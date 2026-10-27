import { createClient } from '@/lib/supabase/client';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'wandercanvas_auth';

export class AuthService {
  /**
   * Fast synchronous auth state check from local cache.
   * Prevents hydration flash in Client Components.
   */
  static getAuthState(): AuthState {
    if (typeof window === 'undefined') {
      return { user: null, isAuthenticated: false };
    }

    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!authData) {
        return { user: null, isAuthenticated: false };
      }

      const user = JSON.parse(authData) as User;
      return { user, isAuthenticated: true };
    } catch {
      return { user: null, isAuthenticated: false };
    }
  }

  /**
   * Verifies current session asynchronously with Supabase Auth service.
   */
  static async getCurrentUserAsync(): Promise<User | null> {
    if (typeof window === 'undefined') return null;

    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }

      const mappedUser: User = {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Traveler',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url || '',
        createdAt: new Date(user.created_at),
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mappedUser));
      return mappedUser;
    } catch {
      return this.getAuthState().user;
    }
  }

  /**
   * Real Supabase Authentication: Log in with email & password.
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Not available on server' };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Login failed' };
      }

      const user: User = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Traveler',
        email: data.user.email || email,
        avatar: data.user.user_metadata?.avatar_url || '',
        createdAt: new Date(data.user.created_at),
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

      // Trigger automatic one-time migration of any guest trips from localStorage
      this.syncLocalTripsToSupabase(user.id).catch(err => {
        console.warn('LocalStorage trip migration notice:', err);
      });

      return { success: true, user };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: msg };
    }
  }

  /**
   * Real Supabase Authentication: Sign up with full name, email & password.
   */
  static async signup(
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User; emailConfirmationRequired?: boolean }> {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Not available on server' };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            name: name.trim(),
          },
        },
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Signup failed' };
      }

      // Check if user already exists (Supabase email enumeration protection returns empty identities array)
      if (data.user.identities && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'An account with this email already exists. Please sign in instead.',
        };
      }

      const isConfirmed = Boolean(data.session) || Boolean((data.user as any).email_confirmed_at);

      const user: User = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || name,
        email: data.user.email || email,
        avatar: data.user.user_metadata?.avatar_url || '',
        createdAt: new Date(data.user.created_at),
      };

      if (isConfirmed) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        this.syncLocalTripsToSupabase(user.id).catch(err => {
          console.warn('LocalStorage trip migration notice:', err);
        });
      }

      return {
        success: true,
        emailConfirmationRequired: !isConfirmed,
        user,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      return { success: false, error: msg };
    }
  }

  /**
   * Log out from Supabase and clear local session cache.
   */
  static async logout(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut notice:', err);
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  /**
   * Subscribe to real-time auth state events (sign in, token refresh, sign out).
   */
  static subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    try {
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Traveler',
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url || '',
            createdAt: new Date(session.user.created_at),
          };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
          callback(user);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          callback(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {
      return () => {};
    }
  }

  /**
   * Check if authenticated synchronously based on local cache.
   */
  static isAuthenticated(): boolean {
    return this.getAuthState().isAuthenticated;
  }

  /**
   * Get cached user profile synchronously.
   */
  static getCurrentUser(): User | null {
    return this.getAuthState().user;
  }

  /**
   * Update profile in Supabase Auth user metadata and public.profiles table.
   */
  static async updateProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Not available on server' };
    }

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: updates.name,
          avatar_url: updates.avatar,
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            full_name: updates.name,
            avatar_url: updates.avatar,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        const current = this.getAuthState().user;
        if (current) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...current, ...updates }));
        }
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      return { success: false, error: msg };
    }
  }

  /**
   * Automatically migrates local trips into Supabase under the authenticated user.
   * Completely non-destructive and idempotent.
   */
  static async syncLocalTripsToSupabase(userId: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem('wandercanvas_collaborative_trips');
      if (!raw) return;

      const trips = JSON.parse(raw);
      if (!Array.isArray(trips) || trips.length === 0) return;

      const supabase = createClient();

      for (const trip of trips) {
        if (!trip.invitationCode) continue;

        // Check if trip is already synced
        const { data: existing } = await supabase
          .from('trips')
          .select('id')
          .eq('invitation_code', trip.invitationCode)
          .maybeSingle();

        if (!existing) {
          const { data: insertedTrip, error: insertError } = await supabase
            .from('trips')
            .insert({
              name: trip.name || 'My Journey',
              description: trip.description || '',
              cover_image: trip.coverImage || '',
              origin: trip.origin || 'Origin',
              origin_coordinates: trip.originCoordinates || null,
              destination: trip.destination || 'Destination',
              destination_coordinates: trip.destinationCoordinates || null,
              start_date: trip.startDate && !isNaN(Date.parse(trip.startDate))
                ? trip.startDate.split('T')[0]
                : new Date().toISOString().split('T')[0],
              end_date: trip.endDate && !isNaN(Date.parse(trip.endDate))
                ? trip.endDate.split('T')[0]
                : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
              budget: trip.budget || 0,
              travel_mode: trip.travelMode || 'driving',
              group_size: trip.groupSize || 1,
              preferences: trip.preferences || [],
              washroom_preference: trip.washroomPreference || 'verified_only',
              owner_id: userId,
              invitation_code: trip.invitationCode,
              route_summary: trip.route ? {
                distanceKm: trip.route.distanceKm,
                durationMinutes: trip.route.durationMinutes,
                summary: trip.route.summary,
                travelMode: trip.route.travelMode,
                coordinatesPath: trip.route.coordinatesPath,
              } : null,
            })
            .select()
            .single();

          if (insertedTrip && !insertError && Array.isArray(trip.stops) && trip.stops.length > 0) {
            const stopsToInsert = trip.stops.map((stop: {
              name?: string;
              address?: string;
              coordinates?: { lat: number; lng: number };
              category?: string;
              detourKm?: number;
              detourMinutes?: number;
              order?: number;
              notes?: string;
            }, index: number) => ({
              trip_id: insertedTrip.id,
              name: stop.name || `Stop ${index + 1}`,
              address: stop.address || '',
              coordinates: stop.coordinates || { lat: 0, lng: 0 },
              category: stop.category || 'attraction',
              detour_km: stop.detourKm || 0,
              detour_minutes: stop.detourMinutes || 0,
              stop_order: stop.order !== undefined ? stop.order : index,
              notes: stop.notes || '',
              suggested_by: userId,
            }));

            await supabase.from('stops').insert(stopsToInsert);
          }
        }
      }
    } catch (err) {
      console.warn('Trip migration notice:', err);
    }
  }
}
