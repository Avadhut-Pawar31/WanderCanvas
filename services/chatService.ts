import { TripMessage, Place } from '@/types';
import { generateId } from '@/lib/utils';
import { CollaborationService } from './collaborationService';

export class ChatService {
  private static STORAGE_PREFIX = 'wandercanvas_chat_';
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
   * Listen for real-time messages in a trip workspace.
   */
  static subscribeToTripChat(tripId: string, callback: (message: TripMessage) => void): () => void {
    const channel = this.getChannel(tripId);
    if (!channel) return () => {};

    const handler = (event: MessageEvent) => {
      if (event.data && event.data.tripId === tripId) {
        callback(event.data);
      }
    };

    channel.addEventListener('message', handler);
    return () => {
      channel.removeEventListener('message', handler);
    };
  }

  /**
   * Send a message to the trip group conversation.
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

    // Save to trip in CollaborationService
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

    // Broadcast message
    const channel = this.getChannel(params.tripId);
    if (channel) {
      try {
        channel.postMessage(message);
      } catch (err) {
        console.error('Broadcast message failed:', err);
      }
    }

    return message;
  }

  /**
   * Get all messages for a trip.
   */
  static getMessages(tripId: string): TripMessage[] {
    const trip = CollaborationService.getTripById(tripId);
    return trip?.messages || [];
  }
}
