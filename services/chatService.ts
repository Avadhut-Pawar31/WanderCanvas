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
        channel.subscribe();
        this.realtimeChannels.set(tripId, channel);
      } catch (err) {
        console.warn('Realtime channel initialization notice:', err);
      }
    }
    return this.realtimeChannels.get(tripId);
  }

  /**
   * Listen for real-time messages via both Supabase Realtime (Broadcast across all devices + Postgres Changes)
   * and local BroadcastChannel. Works for all trips (UUIDs, custom slugs, and demo trips).
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

    // 2. Supabase Realtime WebSocket subscription (streams across all browsers and devices)
    if (typeof window !== 'undefined' && tripId) {
      try {
        const supabase = createClient();
        const safeChannelName = `trip-chat-${tripId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

        let realtimeChannel = this.realtimeChannels.get(tripId);
        if (!realtimeChannel) {
          realtimeChannel = supabase.channel(safeChannelName, {
            config: {
              broadcast: { self: false }, // Never echo back to the sending client
            },
          });
          this.realtimeChannels.set(tripId, realtimeChannel);
        }

        realtimeChannel
          // Fast WebSocket direct broadcast between connected clients across devices
          .on(
            'broadcast',
            { event: 'chat_message' },
            ({ payload }: { payload: any }) => {
              if (payload && payload.tripId === tripId) {
                callback(payload as TripMessage);
              }
            }
          );

        // Database level listener (for external DB inserts on persistent trips)
        if (isUuid(tripId)) {
          realtimeChannel.on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `trip_id=eq.${tripId}`,
            },
            (payload: any) => {
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
          );
        }

        realtimeChannel.subscribe();

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

    // 2. Broadcast via Supabase Realtime Broadcast (instant WebSocket delivery across devices)
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

    // 4. Persist to Supabase messages table if tripId is a persistent UUID
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
        } else {
          // Resolve authenticated user ID if senderId was a placeholder
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

  /**
   * Trigger intelligent Concierge assistant reply inside the trip group chat.
   * Responds to greetings, questions about washrooms, food, detours, and recommendations.
   */
  static triggerConciergeAutoReply(tripId: string, userText: string, senderName: string): void {
    if (typeof window === 'undefined') return;

    const lower = userText.toLowerCase().trim();
    let replyText = '';

    // Greetings
    if (/^(hi|hello|hey|yo|namaste|good\s*(morning|afternoon|evening))\b/i.test(lower)) {
      replyText = `Hello ${senderName || 'there'}! 👋 I'm your WanderCanvas Concierge. How can I help your group with route planning, verified hygiene stops, or recommendations today?`;
    } 
    // Hygiene / Restroom / Washroom inquiries
    else if (/(washroom|restroom|toilet|hygiene|clean|sanit|bathroom)/i.test(lower)) {
      replyText = `Restroom check verified! 🧼 Along this corridor, Mapro Garden and Venna Lake Municipal Pier have clean touchless facilities with verified scores. Check the "Hygiene & Washrooms" tab for full audit reports!`;
    } 
    // Food / Lunch / Restaurants
    else if (/(food|eat|lunch|dinner|restaurant|cafe|snack|mapro|strawberry)/i.test(lower)) {
      replyText = `Culinary recommendation: Mapro Garden is highly rated for strawberry cream and wood-fired pizzas (+0 min detour). Bagicha Corner in Wai is also excellent for fresh corn patties!`;
    } 
    // Permit / Kaas Plateau / Scenery
    else if (/(permit|kaas|flower|pass|entry|ticket)/i.test(lower)) {
      replyText = `Permit notice: Kaas Pathar floral plateau requires online dynamic slots to protect the UNESCO biodiversity. Pre-booking via the official forest portal is recommended for weekend visits.`;
    }
    // Questions or help
    else if (/(\?|help|where|recommend|suggest|how|what)/i.test(lower)) {
      replyText = `I'm on it! 🗺️ You can propose any stop directly from the "Route & Map Planner" tab, or vote on group stops in "Shared Itinerary & Voting". For AI itinerary generation, head to the "AI Travel Assistant" tab!`;
    }

    if (replyText) {
      setTimeout(() => {
        this.sendMessage({
          tripId,
          senderId: 'system',
          senderName: 'WanderCanvas Concierge',
          content: replyText,
          type: 'text',
        });
      }, 700);
    }
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
