import { TripMessage, Place } from '@/types';
import { generateId } from '@/lib/utils';
import { CollaborationService } from './collaborationService';
import { createClient } from '@/lib/supabase/client';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(val: string): boolean {
  return UUID_REGEX.test(val);
}

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Robust message deduplication helper.
 * Matches exact IDs or composite (tripId + senderId + trimmed content within 5 seconds).
 */
export function isSameOrDuplicateMessage(a: TripMessage, b: TripMessage): boolean {
  if (!a || !b) return false;
  if (a.id && b.id && a.id === b.id) return true;
  if (
    a.tripId === b.tripId &&
    a.senderId === b.senderId &&
    a.content.trim() === b.content.trim()
  ) {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    if (!isNaN(timeA) && !isNaN(timeB) && Math.abs(timeA - timeB) < 5000) {
      return true;
    }
  }
  return false;
}

export class ChatService {
  private static channels: Map<string, BroadcastChannel> = new Map();
  private static realtimeChannels: Map<string, any> = new Map();

  private static getChannel(tripId: string): BroadcastChannel | null {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (!this.channels.has(tripId)) {
        this.channels.set(tripId, new BroadcastChannel(`wandercanvas_chat_${tripId}`));
      }
      return this.channels.get(tripId)!;
    }
    return null;
  }

  private static getRealtimeChannel(tripId: string) {
    if (typeof window === 'undefined' || !isUuid(tripId)) return null;
    if (!this.realtimeChannels.has(tripId)) {
      try {
        const supabase = createClient();
        const channel = supabase.channel(`trip-chat-${tripId}`, {
          config: {
            broadcast: { self: false },
          },
        });
        channel.subscribe();
        this.realtimeChannels.set(tripId, channel);
      } catch (err) {
        console.warn('Realtime channel initialization notice:', err);
      }
    }
    return this.realtimeChannels.get(tripId);
  }

  /**
   * Listen for real-time messages via both Supabase Realtime (Broadcast + Postgres Changes)
   * and local BroadcastChannel.
   */
  static subscribeToTripChat(tripId: string, callback: (message: TripMessage) => void): () => void {
    const unsubscribers: Array<() => void> = [];

    // 1. Local BroadcastChannel subscription (for fast same-browser tab sync)
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

    // 2. Supabase Realtime WebSocket subscription (for multi-device / network sync)
    if (typeof window !== 'undefined' && isUuid(tripId)) {
      try {
        const supabase = createClient();
        const realtimeChannel = supabase
          .channel(`trip-chat-${tripId}`, {
            config: {
              broadcast: { self: false }, // Never echo back to the sending client
            },
          })
          // Fast WebSocket direct broadcast between connected clients
          .on(
            'broadcast',
            { event: 'chat_message' },
            ({ payload }) => {
              if (payload && payload.tripId === tripId) {
                callback(payload as TripMessage);
              }
            }
          )
          // Database level listener (for external inserts or background alerts)
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

              if (!row) return;

              const memberName = CollaborationService.getTripById(tripId)?.members.find(
                m => m.userId === row.sender_id
              )?.name;

              const tripMessage: TripMessage = {
                id: row.id,
                tripId: row.trip_id,
                senderId: row.sender_id,
                senderName: memberName || 'Fellow Traveler',
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

        this.realtimeChannels.set(tripId, realtimeChannel);

        unsubscribers.push(() => {
          supabase.removeChannel(realtimeChannel);
          this.realtimeChannels.delete(tripId);
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
   * Optimistically creates the message with a deterministic UUID, broadcasts via Supabase Realtime,
   * and persists into Supabase DB & local cache.
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
    // Generate valid UUID if trip is UUID, ensuring client & server use identical ID
    const messageId = isUuid(params.tripId) ? generateUuid() : generateId();

    const message: TripMessage = {
      id: messageId,
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

    // 1. Save to local trip in CollaborationService for fast reactive updates
    const trip = CollaborationService.getTripById(params.tripId);
    if (trip) {
      if (!trip.messages) trip.messages = [];
      const alreadyExists = trip.messages.some(m => isSameOrDuplicateMessage(m, message));
      if (!alreadyExists) {
        trip.messages.push(message);
      }
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

    // 2. Broadcast via Supabase Realtime Broadcast (instant network delivery to connected friends)
    try {
      const realtimeChannel = this.getRealtimeChannel(params.tripId);
      if (realtimeChannel) {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'chat_message',
          payload: message,
        });
      }
    } catch (broadcastErr) {
      console.warn('Realtime broadcast error:', broadcastErr);
    }

    // 3. Broadcast via local BroadcastChannel (for other tabs in same browser profile)
    const localChannel = this.getChannel(params.tripId);
    if (localChannel) {
      try {
        localChannel.postMessage(message);
      } catch (err) {
        console.error('Local broadcast message failed:', err);
      }
    }

    // 4. Persist to Supabase messages table with matching UUID
    if (typeof window !== 'undefined' && isUuid(params.tripId)) {
      try {
        const supabase = createClient();
        let effectiveSenderId = params.senderId;

        if (isUuid(effectiveSenderId)) {
          this.persistMessageToSupabase(supabase, {
            id: message.id,
            tripId: params.tripId,
            senderId: effectiveSenderId,
            content: params.content,
            type: params.type,
            attachedPlace: params.attachedPlace,
            replyToId: params.replyToId,
          });
        } else {
          // Resolve authenticated user ID if senderId was a placeholder (e.g. 'user-me' or 'traveler-guest')
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && isUuid(user.id)) {
              this.persistMessageToSupabase(supabase, {
                id: message.id,
                tripId: params.tripId,
                senderId: user.id,
                content: params.content,
                type: params.type,
                attachedPlace: params.attachedPlace,
                replyToId: params.replyToId,
              });
            }
          });
        }
      } catch (err) {
        console.warn('Supabase message send error:', err);
      }
    }

    return message;
  }

  private static async persistMessageToSupabase(
    supabase: any,
    params: {
      id: string;
      tripId: string;
      senderId: string;
      content: string;
      type?: string;
      attachedPlace?: Place;
      replyToId?: string;
    }
  ) {
    try {
      const { error } = await supabase.from('messages').insert({
        id: params.id,
        trip_id: params.tripId,
        sender_id: params.senderId,
        content: params.content.trim(),
        message_type: params.type || 'text',
        attached_place: params.attachedPlace || null,
        reply_to_id: params.replyToId && isUuid(params.replyToId) ? params.replyToId : null,
      });
      if (error) {
        console.warn('Supabase message persist notice:', error.message);
      }
    } catch (e) {
      console.warn('Failed to persist message to Supabase:', e);
    }
  }

  /**
   * Get all messages for a trip synchronously from local cache.
   */
  static getMessages(tripId: string): TripMessage[] {
    const trip = CollaborationService.getTripById(tripId);
    return trip?.messages || [];
  }
}
