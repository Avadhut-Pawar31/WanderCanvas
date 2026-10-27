import { 
  CollaborativeTrip, 
  TripMember, 
  StopSuggestion, 
  Waypoint, 
  Place,
  TravelMode,
  TripMemberRole
} from '@/types';
import { generateId } from '@/lib/utils';
import { MapRouteService } from './mapRouteService';
import { createClient } from '@/lib/supabase/client';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(val: string): boolean {
  return UUID_REGEX.test(val);
}

export class CollaborationService {
  private static STORAGE_KEY = 'wandercanvas_collaborative_trips';
  private static broadcastChannel: BroadcastChannel | null = null;
  private static memoryTrips: CollaborativeTrip[] | null = null;

  private static getChannel(): BroadcastChannel | null {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (!this.broadcastChannel) {
        this.broadcastChannel = new BroadcastChannel('wandercanvas_collaboration');
      }
      return this.broadcastChannel;
    }
    return null;
  }

  private static notifyListeners(type: string, payload: unknown) {
    const channel = this.getChannel();
    if (channel) {
      try {
        channel.postMessage({ type, payload, timestamp: Date.now() });
      } catch (err) {
        console.error('BroadcastChannel notification error:', err);
      }
    }
  }

  /**
   * Subscribe to real-time collaborative updates across browser windows, tabs, and devices.
   */
  static subscribeToUpdates(callback: (event: { type: string; payload: unknown }) => void): () => void {
    const unsubscribers: Array<() => void> = [];

    // 1. Local BroadcastChannel subscription (for fast zero-latency tab sync)
    const localChannel = this.getChannel();
    if (localChannel) {
      const handler = (event: MessageEvent) => {
        callback(event.data);
      };
      localChannel.addEventListener('message', handler);
      unsubscribers.push(() => localChannel.removeEventListener('message', handler));
    }

    // 2. Supabase Realtime publication subscription
    if (typeof window !== 'undefined') {
      try {
        const supabase = createClient();
        const realtimeChannel = supabase
          .channel('collaboration-live-sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, (payload) => {
            callback({ type: 'trip_updated', payload: payload.new });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_members' }, (payload) => {
            callback({ type: 'member_updated', payload: payload.new });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'stops' }, (payload) => {
            callback({ type: 'stop_updated', payload: payload.new });
          })
          .subscribe();

        unsubscribers.push(() => {
          supabase.removeChannel(realtimeChannel);
        });
      } catch (err) {
        console.warn('Realtime collaboration subscription notice:', err);
      }
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Get all trips stored in local workspace.
   */
  static getAllTrips(): CollaborativeTrip[] {
    if (typeof window === 'undefined') {
      if (!this.memoryTrips) {
        this.memoryTrips = this.getSeedTrips();
      }
      return this.memoryTrips;
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        const seed = this.getSeedTrips();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(data);
    } catch {
      return this.getSeedTrips();
    }
  }

  /**
   * Save trips list to localStorage.
   */
  private static saveTrips(trips: CollaborativeTrip[]): void {
    if (typeof window === 'undefined') {
      this.memoryTrips = [...trips];
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trips));
    } catch (err) {
      console.error('Failed to save collaborative trips:', err);
    }
  }

  /**
   * Fetch all trips from Supabase where the user is an owner or member,
   * merged with local offline seed trips.
   */
  static async fetchUserTripsFromSupabase(userId: string): Promise<CollaborativeTrip[]> {
    if (typeof window === 'undefined' || !isUuid(userId)) {
      return this.getAllTrips();
    }

    try {
      const supabase = createClient();
      const { data: memberRows } = await supabase
        .from('trip_members')
        .select('trip_id')
        .eq('user_id', userId);

      const tripIds = memberRows?.map(m => m.trip_id) || [];
      if (tripIds.length === 0) {
        return this.getAllTrips();
      }

      const { data: dbTrips, error } = await supabase
        .from('trips')
        .select(`
          *,
          trip_members (
            user_id,
            role,
            joined_at,
            profiles:user_id (full_name, avatar_url, email)
          ),
          stops (*)
        `)
        .in('id', tripIds)
        .order('created_at', { ascending: false });

      if (error || !dbTrips) {
        return this.getAllTrips();
      }

      const mapped: CollaborativeTrip[] = dbTrips.map((dt: any) => {
        const members: TripMember[] = (dt.trip_members || []).map((m: any) => ({
          userId: m.user_id,
          name: m.profiles?.full_name || 'Traveler',
          email: m.profiles?.email || '',
          avatar: m.profiles?.avatar_url,
          role: m.role as TripMemberRole,
          joinedAt: m.joined_at,
        }));

        const stops: Waypoint[] = (dt.stops || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          address: s.address,
          coordinates: s.coordinates,
          category: s.category,
          detourKm: Number(s.detour_km) || 0,
          detourMinutes: Number(s.detour_minutes) || 0,
          order: s.stop_order,
          notes: s.notes,
          suggestedBy: s.suggested_by,
        }));

        return {
          id: dt.id,
          name: dt.name,
          description: dt.description,
          coverImage: dt.cover_image,
          origin: dt.origin,
          originCoordinates: dt.origin_coordinates,
          destination: dt.destination,
          destinationCoordinates: dt.destination_coordinates,
          startDate: dt.start_date,
          endDate: dt.end_date,
          budget: Number(dt.budget) || 0,
          travelMode: dt.travel_mode,
          groupSize: dt.group_size,
          preferences: dt.preferences || [],
          washroomPreference: dt.washroom_preference,
          ownerId: dt.owner_id,
          members,
          invitationCode: dt.invitation_code,
          stops,
          suggestions: [],
          messages: [],
          createdAt: dt.created_at,
          updatedAt: dt.updated_at,
        };
      });

      // Merge with local offline trips so seed trips are preserved
      const local = this.getAllTrips();
      const merged = [...mapped];
      local.forEach(lt => {
        if (!merged.some(m => m.id === lt.id || m.invitationCode === lt.invitationCode)) {
          merged.push(lt);
        }
      });

      this.saveTrips(merged);
      return merged;
    } catch (err) {
      console.warn('fetchUserTripsFromSupabase notice:', err);
      return this.getAllTrips();
    }
  }

  /**
   * Retrieve single trip by ID.
   */
  static getTripById(id: string): CollaborativeTrip | null {
    const trips = this.getAllTrips();
    return trips.find(t => t.id === id) || null;
  }

  /**
   * Retrieve single trip by invitation code.
   */
  static getTripByInviteCode(code: string): CollaborativeTrip | null {
    const trips = this.getAllTrips();
    return trips.find(t => t.invitationCode.toLowerCase() === code.trim().toLowerCase()) || null;
  }

  /**
   * Join an existing trip by invitation code.
   */
  static joinTripByInviteCode(code: string, traveler: { id: string; name: string; email: string; avatar?: string }): CollaborativeTrip | null {
    const trips = this.getAllTrips();
    const trip = trips.find(t => t.invitationCode.toLowerCase() === code.trim().toLowerCase());
    if (!trip) return null;

    // Check if member already in trip
    const existingIndex = trip.members.findIndex(m => m.userId === traveler.id || m.email === traveler.email);
    if (existingIndex === -1) {
      const newMember: TripMember = {
        userId: traveler.id,
        name: traveler.name,
        email: traveler.email,
        avatar: traveler.avatar,
        role: 'editor',
        joinedAt: new Date().toISOString(),
      };
      trip.members.push(newMember);
      this.saveTrips(trips);
      this.notifyListeners('member_joined', { tripId: trip.id, member: newMember });
    }

    return trip;
  }

  /**
   * Create a new collaborative trip.
   */
  static async createTrip(params: {
    name: string;
    description?: string;
    origin: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    travelMode?: TravelMode;
    groupSize?: number;
    preferences?: string[];
    washroomPreference?: 'any' | 'verified_only' | 'high_standard';
    owner: { id: string; name: string; email: string; avatar?: string };
  }): Promise<CollaborativeTrip> {
    const tripId = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const invitationCode = `WC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Calculate initial route
    const route = await MapRouteService.calculateRoute({
      origin: params.origin,
      destination: params.destination,
      travelMode: params.travelMode || 'driving',
    });

    const ownerMember: TripMember = {
      userId: params.owner.id,
      name: params.owner.name,
      email: params.owner.email,
      avatar: params.owner.avatar,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    };

    const newTrip: CollaborativeTrip = {
      id: tripId,
      name: params.name,
      description: params.description || `Journey from ${params.origin} to ${params.destination}`,
      coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&q=80',
      origin: params.origin,
      originCoordinates: route.origin.coordinates,
      destination: params.destination,
      destinationCoordinates: route.destination.coordinates,
      startDate: params.startDate,
      endDate: params.endDate,
      budget: params.budget,
      travelMode: params.travelMode || 'driving',
      groupSize: params.groupSize || 2,
      preferences: params.preferences || ['Scenic Coastal', 'Clean Washrooms', 'Authentic Food'],
      washroomPreference: params.washroomPreference || 'verified_only',
      ownerId: params.owner.id,
      members: [ownerMember],
      invitationCode,
      route,
      stops: [],
      suggestions: [],
      messages: [
        {
          id: `msg-${Date.now()}`,
          tripId,
          senderId: 'system',
          senderName: 'WanderCanvas Concierge',
          content: `Welcome to ${params.name}! Route initialized from ${params.origin} to ${params.destination}. Share invite code ${invitationCode} with friends to plan together.`,
          timestamp: new Date().toISOString(),
          type: 'text',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Persist to Supabase if owner has a valid authenticated UUID
    if (typeof window !== 'undefined' && isUuid(params.owner.id)) {
      try {
        const supabase = createClient();
        const { data: dbTrip, error: insertError } = await supabase
          .from('trips')
          .insert({
            name: params.name,
            description: params.description || `Journey from ${params.origin} to ${params.destination}`,
            cover_image: newTrip.coverImage,
            origin: params.origin,
            origin_coordinates: route.origin.coordinates,
            destination: params.destination,
            destination_coordinates: route.destination.coordinates,
            start_date: params.startDate.includes('T') ? params.startDate.split('T')[0] : params.startDate,
            end_date: params.endDate.includes('T') ? params.endDate.split('T')[0] : params.endDate,
            budget: params.budget,
            travel_mode: params.travelMode || 'driving',
            group_size: params.groupSize || 2,
            preferences: params.preferences || ['Scenic Coastal', 'Clean Washrooms', 'Authentic Food'],
            washroom_preference: params.washroomPreference || 'verified_only',
            owner_id: params.owner.id,
            invitation_code: invitationCode,
            route_summary: {
              distanceKm: route.distanceKm,
              durationMinutes: route.durationMinutes,
              summary: route.summary,
              travelMode: route.travelMode,
              coordinatesPath: route.coordinatesPath,
            },
          })
          .select()
          .single();

        if (dbTrip && !insertError) {
          newTrip.id = dbTrip.id;
        }
      } catch (err) {
        console.warn('Supabase createTrip notice:', err);
      }
    }

    const trips = this.getAllTrips();
    trips.unshift(newTrip);
    this.saveTrips(trips);
    this.notifyListeners('trip_created', newTrip);

    return newTrip;
  }

  /**
   * Join trip by invitation code.
   */
  static joinTrip(
    invitationCode: string,
    user: { id: string; name: string; email: string; avatar?: string }
  ): { success: boolean; trip?: CollaborativeTrip; error?: string } {
    const trips = this.getAllTrips();
    const trip = trips.find(t => t.invitationCode.toLowerCase() === invitationCode.trim().toLowerCase());

    if (!trip) {
      return { success: false, error: 'Invalid or expired invitation code.' };
    }

    // Check if already a member
    const existing = trip.members.find(m => m.userId === user.id);
    if (existing) {
      return { success: true, trip };
    }

    const newMember: TripMember = {
      userId: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: 'editor',
      joinedAt: new Date().toISOString(),
    };

    trip.members.push(newMember);
    trip.messages.push({
      id: `msg-${Date.now()}`,
      tripId: trip.id,
      senderId: 'system',
      senderName: 'System',
      content: `${user.name} joined the trip!`,
      timestamp: new Date().toISOString(),
      type: 'text',
    });
    trip.updatedAt = new Date().toISOString();

    this.saveTrips(trips);
    this.notifyListeners('member_joined', { tripId: trip.id, member: newMember });

    return { success: true, trip };
  }

  /**
   * Suggest a candidate place for member voting.
   */
  static suggestStop(
    tripId: string,
    place: Place,
    user: { id: string; name: string },
    reason?: string
  ): StopSuggestion | null {
    const trips = this.getAllTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return null;

    // Check permission (owner or editor)
    const member = trip.members.find(m => m.userId === user.id);
    if (!member || member.role === 'viewer') return null;

    const suggestion: StopSuggestion = {
      id: generateId(),
      tripId,
      place,
      suggestedBy: user.id,
      suggestedByName: user.name,
      suggestedAt: new Date().toISOString(),
      reason: reason || `Hygiene verified ${place.category} with score ${place.hygieneScore || 85}/100`,
      votes: [{ userId: user.id, userName: user.name, vote: 1 }],
      status: 'pending',
    };

    trip.suggestions.push(suggestion);
    trip.messages.push({
      id: `msg-${Date.now()}`,
      tripId,
      senderId: user.id,
      senderName: user.name,
      content: `Suggested adding ${place.name} (${place.category}): "${suggestion.reason}"`,
      timestamp: new Date().toISOString(),
      type: 'place_recommendation',
      attachedPlace: place,
    });
    trip.updatedAt = new Date().toISOString();

    this.saveTrips(trips);
    this.notifyListeners('suggestion_added', { tripId, suggestion });

    return suggestion;
  }

  /**
   * Vote on a stop suggestion. Automatically promotes to confirmed stop if net votes >= 2.
   */
  static voteOnSuggestion(
    tripId: string,
    suggestionId: string,
    user: { id: string; name: string },
    vote: 1 | -1
  ): { suggestion: StopSuggestion; promotedToStop: boolean } | null {
    const trips = this.getAllTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return null;

    const suggestion = trip.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return null;

    // Record or update vote
    const existingVoteIndex = suggestion.votes.findIndex(v => v.userId === user.id);
    if (existingVoteIndex >= 0) {
      suggestion.votes[existingVoteIndex].vote = vote;
    } else {
      suggestion.votes.push({ userId: user.id, userName: user.name, vote });
    }

    const netVotes = suggestion.votes.reduce((acc, v) => acc + v.vote, 0);
    let promotedToStop = false;

    // If net votes >= 2 and not already accepted, promote to confirmed stop
    if (netVotes >= 2 && suggestion.status !== 'accepted') {
      suggestion.status = 'accepted';
      promotedToStop = true;

      const newWaypoint: Waypoint = {
        id: generateId(),
        name: suggestion.place.name,
        address: suggestion.place.address,
        coordinates: suggestion.place.coordinates,
        category: suggestion.place.category,
        placeId: suggestion.place.id,
        detourKm: suggestion.place.detourKm || 1.0,
        detourMinutes: suggestion.place.detourMinutes || 5,
        order: trip.stops.length + 1,
        suggestedBy: suggestion.suggestedByName,
      };

      trip.stops.push(newWaypoint);
      if (trip.route) {
        trip.route.waypoints = trip.stops;
        trip.route.distanceKm = Math.round((trip.route.distanceKm + (newWaypoint.detourKm || 0)) * 10) / 10;
        trip.route.durationMinutes += (newWaypoint.detourMinutes || 0);
      }
      
      trip.messages.push({
        id: `msg-${Date.now()}`,
        tripId,
        senderId: 'system',
        senderName: 'Consensus Alert',
        content: `🎉 ${suggestion.place.name} was approved by group consensus (${netVotes} upvotes) and added to your route!`,
        timestamp: new Date().toISOString(),
        type: 'vote_alert',
        attachedPlace: suggestion.place,
      });
    }

    trip.updatedAt = new Date().toISOString();
    this.saveTrips(trips);
    this.notifyListeners('suggestion_voted', { tripId, suggestion, promotedToStop });

    return { suggestion, promotedToStop };
  }

  /**
   * Add a confirmed stop directly (for trip owner or editor).
   */
  static addStopDirectly(tripId: string, place: Place, user: { id: string; name: string }): Waypoint | null {
    const trips = this.getAllTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return null;

    const waypoint: Waypoint = {
      id: generateId(),
      name: place.name,
      address: place.address,
      coordinates: place.coordinates,
      category: place.category,
      placeId: place.id,
      detourKm: place.detourKm || 1.2,
      detourMinutes: place.detourMinutes || 5,
      order: trip.stops.length + 1,
      suggestedBy: user.name,
    };

    trip.stops.push(waypoint);
    if (trip.route) {
      trip.route.waypoints = trip.stops;
      trip.route.distanceKm = Math.round((trip.route.distanceKm + (waypoint.detourKm || 0)) * 10) / 10;
      trip.route.durationMinutes += (waypoint.detourMinutes || 0);
    }

    trip.messages.push({
      id: `msg-${Date.now()}`,
      tripId,
      senderId: user.id,
      senderName: user.name,
      content: `Added ${place.name} to the route stops.`,
      timestamp: new Date().toISOString(),
      type: 'itinerary_update',
      attachedPlace: place,
    });
    trip.updatedAt = new Date().toISOString();

    this.saveTrips(trips);
    this.notifyListeners('stop_added', { tripId, waypoint });

    return waypoint;
  }

  /**
   * Remove a stop from the route.
   */
  static removeStop(tripId: string, stopId: string, userId: string): boolean {
    const trips = this.getAllTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return false;

    const stop = trip.stops.find(s => s.id === stopId);
    if (!stop) return false;

    trip.stops = trip.stops.filter(s => s.id !== stopId);
    // Reindex order
    trip.stops.forEach((s, idx) => {
      s.order = idx + 1;
    });

    if (trip.route) {
      trip.route.waypoints = trip.stops;
      trip.route.distanceKm = Math.max(10, Math.round((trip.route.distanceKm - (stop.detourKm || 0)) * 10) / 10);
      trip.route.durationMinutes = Math.max(15, trip.route.durationMinutes - (stop.detourMinutes || 0));
    }

    trip.messages.push({
      id: `msg-${Date.now()}`,
      tripId,
      senderId: userId,
      senderName: 'Trip Editor',
      content: `Removed ${stop.name} from itinerary stops.`,
      timestamp: new Date().toISOString(),
      type: 'itinerary_update',
    });
    trip.updatedAt = new Date().toISOString();

    this.saveTrips(trips);
    this.notifyListeners('stop_removed', { tripId, stopId });

    return true;
  }

  /**
   * Seed authentic demonstration trips with active routes and hygiene intelligence.
   */
  private static getSeedTrips(): CollaborativeTrip[] {
    return [
      {
        id: 'trip-amalfi-classic',
        name: 'Amalfi Coast Coastal & Hygiene Odyssey',
        description: 'Collaborative road trip along the Tyrrhenian coast with verified clean restrooms and cliffside villas.',
        coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&q=85',
        origin: 'Naples',
        originCoordinates: { lat: 40.8518, lng: 14.2681 },
        destination: 'Ravello & Amalfi',
        destinationCoordinates: { lat: 40.6492, lng: 14.6115 },
        startDate: '2026-06-12',
        endDate: '2026-06-19',
        budget: 2400,
        travelMode: 'driving',
        groupSize: 4,
        preferences: ['Scenic Coastal', 'Clean Washrooms', 'Gastronomy', 'Accessible'],
        washroomPreference: 'verified_only',
        ownerId: 'user-demo-1',
        route: {
          origin: {
            name: 'Naples Central',
            address: 'Piazza Garibaldi, Naples, Italy',
            coordinates: { lat: 40.8518, lng: 14.2681 },
          },
          destination: {
            name: 'Amalfi Coast (Amalfi & Ravello)',
            address: 'Piazza Duomo, Amalfi (SA), Italy',
            coordinates: { lat: 40.6492, lng: 14.6115 },
          },
          distanceKm: 63.4,
          durationMinutes: 84,
          coordinatesPath: [
            [40.8518, 14.2681],
            [40.8250, 14.3400],
            [40.7500, 14.4850],
            [40.6720, 14.4870],
            [40.6263, 14.3758],
            [40.6120, 14.4450],
            [40.6281, 14.4850],
            [40.6150, 14.5300],
            [40.6180, 14.5700],
            [40.6300, 14.5900],
            [40.6340, 14.6027],
            [40.6492, 14.6115],
          ],
          travelMode: 'driving',
          summary: 'Via Autostrada A3 and SS163 Amalfitana Scenic Highway',
          waypoints: [
            {
              id: 'stop-1',
              name: 'Autogrill Cantagallo Ovest (A1 Rest Stop)',
              address: 'Autostrada A1 km 198',
              coordinates: { lat: 44.4712, lng: 11.2741 },
              category: 'rest_stop',
              detourKm: 0.2,
              detourMinutes: 2,
              order: 1,
              suggestedBy: 'Elena Rostova',
            },
            {
              id: 'stop-2',
              name: 'Bar Pasticceria Sal De Riso',
              address: 'Via Santa Maria della Neve 80, Minori',
              coordinates: { lat: 40.6514, lng: 14.6289 },
              category: 'restaurant',
              detourKm: 0.8,
              detourMinutes: 4,
              order: 2,
              suggestedBy: 'Marco Bellini',
            },
          ],
          alternativeRoutes: [
            {
              summary: 'Via SS145 Panoramica and Agerola Mountain Pass',
              distanceKm: 58.2,
              durationMinutes: 85,
              coordinatesPath: [
                [40.8518, 14.2681],
                [40.7500, 14.4850],
                [40.6382, 14.5428],
                [40.6492, 14.6115],
              ],
            },
          ],
        },
        members: [
          {
            userId: 'user-demo-1',
            name: 'Elena Rostova',
            email: 'elena@wandercanvas.com',
            role: 'owner',
            joinedAt: '2026-05-01T10:00:00Z',
          },
          {
            userId: 'user-demo-2',
            name: 'Marco Bellini',
            email: 'marco@wandercanvas.com',
            role: 'editor',
            joinedAt: '2026-05-02T14:30:00Z',
          },
          {
            userId: 'user-demo-3',
            name: 'Sophie Laurent',
            email: 'sophie@wandercanvas.com',
            role: 'editor',
            joinedAt: '2026-05-03T09:15:00Z',
          },
        ],
        invitationCode: 'AMALFI-26',
        stops: [
          {
            id: 'stop-1',
            name: 'Autogrill Cantagallo Ovest (A1 Rest Stop)',
            address: 'Autostrada A1 km 198',
            coordinates: { lat: 44.4712, lng: 11.2741 },
            category: 'rest_stop',
            detourKm: 0.2,
            detourMinutes: 2,
            order: 1,
            suggestedBy: 'Elena Rostova',
          },
          {
            id: 'stop-2',
            name: 'Bar Pasticceria Sal De Riso',
            address: 'Via Santa Maria della Neve 80, Minori',
            coordinates: { lat: 40.6514, lng: 14.6289 },
            category: 'restaurant',
            detourKm: 0.8,
            detourMinutes: 4,
            order: 2,
            suggestedBy: 'Marco Bellini',
          },
        ],
        suggestions: [
          {
            id: 'sug-1',
            tripId: 'trip-amalfi-classic',
            place: {
              id: 'place-amalfi-3',
              name: 'Hotel Santa Caterina Restrooms & Lounge',
              category: 'hotel',
              address: 'Via Stradone 9, Amalfi',
              city: 'Amalfi',
              coordinates: { lat: 40.6308, lng: 14.5935 },
              hygieneStatus: 'independently_inspected',
              hygieneScore: 98,
              hygieneConfidence: 'high',
              washroomAvailability: 'customers_only',
              waterAvailable: true,
              soapAvailable: true,
              accessibleFacility: true,
              detourKm: 1.2,
              detourMinutes: 6,
            },
            suggestedBy: 'user-demo-3',
            suggestedByName: 'Sophie Laurent',
            suggestedAt: '2026-05-04T11:20:00Z',
            reason: 'Luxury cliffside spot with five-star verified restroom and stunning sunset view.',
            votes: [
              { userId: 'user-demo-3', userName: 'Sophie Laurent', vote: 1 },
              { userId: 'user-demo-2', userName: 'Marco Bellini', vote: 1 },
            ],
            status: 'accepted',
          },
        ],
        messages: [
          {
            id: 'msg-seed-1',
            tripId: 'trip-amalfi-classic',
            senderId: 'user-demo-1',
            senderName: 'Elena Rostova',
            content: 'Hey team! I mapped out the drive from Naples to Amalfi. Please vote on the lunch and hygiene stops.',
            timestamp: '2026-05-03T10:00:00Z',
            type: 'text',
          },
          {
            id: 'msg-seed-2',
            tripId: 'trip-amalfi-classic',
            senderId: 'user-demo-2',
            senderName: 'Marco Bellini',
            content: 'I checked Sal De Riso in Minori—their restrooms were officially certified by the health board last month and the lemon pastries are world-class!',
            timestamp: '2026-05-03T10:15:00Z',
            type: 'text',
          },
        ],
        createdAt: '2026-05-01T09:00:00Z',
        updatedAt: '2026-05-04T12:00:00Z',
      },
    ];
  }
}
