import { TripMessage, Place } from '@/types';
import { generateId } from '@/lib/utils';
import { CollaborationService } from './collaborationService';
import { createClient } from '@/lib/supabase/client';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(val: string): boolean {
  return UUID_REGEX.test(val);
}

export class ChatService {
  private static channels: Map<string, BroadcastChannel> = new Map();

  private static getChannel(tripId: string): BroadcastChannel | null {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (!this.channels.has(tripId)) {
        this.channels.set(tripId, new BroadcastChannel(`wandercanvas_chat_${tripId}`));
      }
      return this.channels.get(tripId)!;
    }
    return null;
  }

  /**
   * Listen for real-time messages via both Supabase Realtime WebSocket and local BroadcastChannel.
   */
  static subscribeToTripChat(tripId: string, callback: (message: TripMessage) => void): () => void {
    const unsubscribers: Array<() => void> = [];

    // 1. Local BroadcastChannel subscription (for fast zero-latency local tab sync)
    const localChannel = this.getChannel(tripId);
    if (localChannel) {
      const handler = (event: MessageEvent) => {
        if (event.data && event.data.tripId === tripId) {
          callback(event.data);
        }
      };
      localChannel.addEventListener('message', handler);
      unsubscribers.push(() => localChannel.removeEventListener('message', handler));
    }

    // 2. Supabase Realtime WebSocket subscription (for multi-device / multi-user network sync)
    if (typeof window !== 'undefined' && isUuid(tripId)) {
      try {
        const supabase = createClient();
        const realtimeChannel = supabase
          .channel(`trip-chat-${tripId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `trip_id=eq.${tripId}`,
            },
            (payload) => {
              const row = payload.new as {
                id: string;
                trip_id: string;
                sender_id: string;
                content: string;
                message_type: 'text' | 'itinerary_update' | 'place_recommendation' | 'vote_alert';
                attached_place?: Place;
                reply_to_id?: string;
                created_at: string;
              };

              const tripMessage: TripMessage = {
                id: row.id,
                tripId: row.trip_id,
                senderId: row.sender_id,
                senderName: 'Fellow Traveler',
                content: row.content,
                timestamp: row.created_at,
                type: row.message_type || 'text',
                attachedPlace: row.attached_place,
                replyToId: row.reply_to_id,
              };

              callback(tripMessage);
            }
          )
          .subscribe();

        unsubscribers.push(() => {
          supabase.removeChannel(realtimeChannel);
        });
      } catch (err) {
        console.warn('Realtime chat subscription notice:', err);
      }
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Fetch historical messages asynchronously from Supabase.
   */
  static async fetchMessagesAsync(tripId: string): Promise<TripMessage[]> {
    if (typeof window === 'undefined' || !isUuid(tripId)) {
      return this.getMessages(tripId);
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          trip_id,
          sender_id,
          content,
          message_type,
          attached_place,
          reply_to_id,
          created_at,
          profiles:sender_id (full_name, avatar_url)
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

      if (error || !data) {
        return this.getMessages(tripId);
      }

      return data.map((row: any) => ({
        id: row.id,
        tripId: row.trip_id,
        senderId: row.sender_id,
        senderName: row.profiles?.full_name || 'Traveler',
        senderAvatar: row.profiles?.avatar_url,
        content: row.content,
        timestamp: row.created_at,
        type: row.message_type || 'text',
        attachedPlace: row.attached_place,
        replyToId: row.reply_to_id,
      }));
    } catch {
      return this.getMessages(tripId);
    }
  }

  /**
   * Send a message to the trip group conversation.
   * Optimistically returns the created message immediately, then writes to Supabase & BroadcastChannel.
   */
  static sendMessage(params: {
    tripId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    type?: 'text' | 'itinerary_update' | 'place_recommendation' | 'vote_alert';
    attachedPlace?: Place;
    replyToId?: string;
  }): TripMessage {
    const message: TripMessage = {
      id: generateId(),
      tripId: params.tripId,
      senderId: params.senderId,
      senderName: params.senderName,
      senderAvatar: params.senderAvatar,
      content: params.content.trim(),
      timestamp: new Date().toISOString(),
      type: params.type || 'text',
      attachedPlace: params.attachedPlace,
      replyToId: params.replyToId,
    };

    // 1. Save to local trip in CollaborationService for fast local storage
    const trip = CollaborationService.getTripById(params.tripId);
    if (trip) {
      if (!trip.messages) trip.messages = [];
      trip.messages.push(message);
      trip.updatedAt = new Date().toISOString();

      if (typeof window !== 'undefined') {
        try {
          const trips = CollaborationService.getAllTrips();
          const idx = trips.findIndex(t => t.id === params.tripId);
          if (idx >= 0) {
            trips[idx] = trip;
            localStorage.setItem('wandercanvas_collaborative_trips', JSON.stringify(trips));
          }
        } catch (e) {
          console.error('Error saving message to trip storage:', e);
        }
      }
    }

    // 2. Broadcast via local BroadcastChannel
    const localChannel = this.getChannel(params.tripId);
    if (localChannel) {
      try {
        localChannel.postMessage(message);
      } catch (err) {
        console.error('Broadcast message failed:', err);
      }
    }

    // 3. Persist to Supabase if tripId & senderId are valid UUIDs
    if (typeof window !== 'undefined' && isUuid(params.tripId) && isUuid(params.senderId)) {
      try {
        const supabase = createClient();
        supabase
          .from('messages')
          .insert({
            trip_id: params.tripId,
            sender_id: params.senderId,
            content: params.content.trim(),
            message_type: params.type || 'text',
            attached_place: params.attachedPlace || null,
            reply_to_id: params.replyToId && isUuid(params.replyToId) ? params.replyToId : null,
          })
          .then(({ error }) => {
            if (error) {
              console.warn('Supabase message persist notice:', error.message);
            }
          });
      } catch (err) {
        console.warn('Supabase message send error:', err);
      }
    }

    return message;
  }

  /**
   * Get all messages for a trip synchronously from local cache.
   */
  static getMessages(tripId: string): TripMessage[] {
    const trip = CollaborationService.getTripById(tripId);
    return trip?.messages || [];
  }
}
