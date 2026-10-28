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
 * Only deduplicates exact IDs or messages from the EXACT same sender & senderName with identical content within 2 seconds.
 * Messages from different travelers are NEVER dropped.
 */
export function isSameOrDuplicateMessage(a: TripMessage, b: TripMessage): boolean {
  if (!a || !b) return false;
  // Exact ID match
  if (a.id && b.id && a.id === b.id) return true;

  // Same trip, same senderId, same senderName, and identical content within 2 seconds
  if (
    a.tripId === b.tripId &&
    a.senderId === b.senderId &&
    a.senderName === b.senderName &&
    a.content.trim() === b.content.trim()
  ) {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    if (!isNaN(timeA) && !isNaN(timeB) && Math.abs(timeA - timeB) < 2000) {
      return true;
    }
  }
  return false;
}

export class ChatService {
  private static subscribers: Map<string, Set<(message: TripMessage) => void>> = new Map();
  private static realtimeChannels: Map<string, any> = new Map();
  private static localChannels: Map<string, BroadcastChannel> = new Map();

  private static getLocalChannel(tripId: string): BroadcastChannel | null {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (!this.localChannels.has(tripId)) {
        const bc = new BroadcastChannel(`wandercanvas_chat_${tripId}`);
        bc.onmessage = (event) => {
          if (event.data && event.data.tripId === tripId) {
            this.notifySubscribers(tripId, event.data);
          }
        };
        this.localChannels.set(tripId, bc);
      }
      return this.localChannels.get(tripId)!;
    }
    return null;
  }

  private static getRealtimeChannel(tripId: string) {
    if (typeof window === 'undefined' || !tripId) return null;
    if (!this.realtimeChannels.has(tripId)) {
      try {
        const supabase = createClient();
        const safeChannelName = `trip-chat-${tripId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
        const channel = supabase.channel(safeChannelName, {
          config: {
            broadcast: { self: false },
          },
        });

        // Fast WebSocket direct broadcast between connected clients across devices
        channel.on(
          'broadcast',
          { event: 'chat_message' },
          (data: any) => {
            const msg = data?.payload || data;
            if (msg && msg.tripId === tripId) {
              this.notifySubscribers(tripId, msg as TripMessage);
            }
          }
        );

        // Database level listener (for external inserts if trip is in Supabase DB)
        if (isUuid(tripId)) {
          channel.on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `trip_id=eq.${tripId}`,
            },
            (payload: any) => {
              const row = payload.new as any;
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

              this.notifySubscribers(tripId, tripMessage);
            }
          );
        }

        channel.subscribe((status: string) => {
          console.log(`[WanderCanvas Realtime] ${safeChannelName} status:`, status);
        });

        this.realtimeChannels.set(tripId, channel);
      } catch (err) {
        console.warn('Realtime channel error:', err);
      }
    }
    return this.realtimeChannels.get(tripId);
  }

  private static notifySubscribers(tripId: string, message: TripMessage) {
    const subs = this.subscribers.get(tripId);
    if (subs) {
      subs.forEach(cb => {
        try {
          cb(message);
        } catch (e) {
          console.error('Subscriber callback error:', e);
        }
      });
    }
  }

  /**
   * Listen for real-time messages via both Supabase Realtime (WebSocket streaming across devices)
   * and local BroadcastChannel. Works for all trips.
   */
  static subscribeToTripChat(tripId: string, callback: (message: TripMessage) => void): () => void {
    if (!this.subscribers.has(tripId)) {
      this.subscribers.set(tripId, new Set());
    }
    this.subscribers.get(tripId)!.add(callback);

    // Initialize both Realtime WebSocket & Local BroadcastChannel
    this.getLocalChannel(tripId);
    this.getRealtimeChannel(tripId);

    return () => {
      const subs = this.subscribers.get(tripId);
      if (subs) {
        subs.delete(callback);
      }
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
   * Optimistically creates the message with a deterministic ID, broadcasts via Supabase Realtime,
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

    // 1. Save to local trip in CollaborationService for fast local storage
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

    // 2. Broadcast via Supabase Realtime WebSocket to all other devices/browsers
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

    // 3. Broadcast via local BroadcastChannel for other tabs in same browser profile
    const localChannel = this.getLocalChannel(params.tripId);
    if (localChannel) {
      try {
        localChannel.postMessage(message);
      } catch (err) {
        console.error('Local broadcast message failed:', err);
      }
    }

    // 4. Persist to Supabase if tripId is a valid UUID
    if (typeof window !== 'undefined' && isUuid(params.tripId)) {
      try {
        const supabase = createClient();
        const effectiveSenderId = params.senderId;

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
        }
      } catch (err) {
        console.warn('Supabase message persist error:', err);
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
