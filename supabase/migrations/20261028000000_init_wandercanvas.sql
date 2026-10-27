-- ==============================================================================
-- WANDERCANVAS — DATABASE INITIALIZATION MIGRATION
-- ==============================================================================
-- Idempotent schema for PostgreSQL on Supabase
-- Tables: profiles, trips, trip_members, places, hygiene_reports, waypoints, stops, messages
-- Features: Row Level Security (RLS), Realtime Replication, Non-Recursive Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TRIPS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  origin TEXT NOT NULL,
  origin_coordinates JSONB,
  destination TEXT NOT NULL,
  destination_coordinates JSONB,
  start_date DATE,
  end_date DATE,
  budget NUMERIC(10, 2) DEFAULT 0,
  travel_mode TEXT NOT NULL DEFAULT 'driving' CHECK (travel_mode IN ('driving', 'transit', 'walking', 'bicycling')),
  group_size INTEGER NOT NULL DEFAULT 1 CHECK (group_size >= 1),
  preferences TEXT[] DEFAULT '{}',
  washroom_preference TEXT NOT NULL DEFAULT 'verified_only' CHECK (washroom_preference IN ('any', 'verified_only', 'high_standard')),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_code TEXT NOT NULL UNIQUE,
  route_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. TRIP MEMBERS TABLE (Role-Based Collaboration)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trip_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT trip_members_trip_user_key UNIQUE (trip_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 5. PLACES CATALOG (Curated Authentic Stops & Verified Facilities)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.places (
  id TEXT PRIMARY KEY,
  google_place_id TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hotel', 'restaurant', 'washroom', 'fuel', 'rest_stop', 'attraction')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  phone TEXT,
  opening_hours TEXT,
  price_level INTEGER CHECK (price_level BETWEEN 1 AND 4),
  rating NUMERIC(3, 2) CHECK (rating BETWEEN 0 AND 5),
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  hygiene_status TEXT NOT NULL DEFAULT 'not_yet_verified' CHECK (hygiene_status IN ('officially_inspected', 'independently_inspected', 'community_reported', 'not_yet_verified', 'verification_expired')),
  hygiene_score INTEGER CHECK (hygiene_score BETWEEN 0 AND 100),
  hygiene_confidence TEXT DEFAULT 'medium' CHECK (hygiene_confidence IN ('high', 'medium', 'limited')),
  last_verified_date TIMESTAMPTZ,
  evidence_source TEXT,
  washroom_availability TEXT NOT NULL DEFAULT 'unknown' CHECK (washroom_availability IN ('available', 'customers_only', 'paid', 'unavailable', 'unknown')),
  water_available BOOLEAN DEFAULT true,
  soap_available BOOLEAN DEFAULT true,
  accessible_facility BOOLEAN DEFAULT false,
  checklist JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. HYGIENE AUDIT REPORTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hygiene_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cleanliness_rating INTEGER NOT NULL CHECK (cleanliness_rating BETWEEN 1 AND 5),
  soap_available BOOLEAN NOT NULL DEFAULT false,
  running_water BOOLEAN NOT NULL DEFAULT false,
  flush_working BOOLEAN NOT NULL DEFAULT true,
  comments TEXT,
  flagged_issues TEXT[] DEFAULT '{}',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. WAYPOINTS (Route Corridor Coordinates & Navigation Anchors)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  coordinates JSONB NOT NULL,
  category TEXT,
  detour_km NUMERIC(6, 2) DEFAULT 0,
  detour_minutes INTEGER DEFAULT 0,
  waypoint_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. STOPS (Planned Itinerary Activity Stops)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  place_id TEXT REFERENCES public.places(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address TEXT,
  coordinates JSONB NOT NULL,
  category TEXT,
  detour_km NUMERIC(6, 2) DEFAULT 0,
  detour_minutes INTEGER DEFAULT 0,
  stop_order INTEGER NOT NULL DEFAULT 0,
  planned_arrival TIMESTAMPTZ,
  notes TEXT,
  suggested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. MESSAGES (Collaborative Group Chat & Live Alerts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'itinerary_update', 'place_recommendation', 'vote_alert')),
  attached_place JSONB,
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_trips_owner ON public.trips(owner_id);
CREATE INDEX IF NOT EXISTS idx_trips_invitation ON public.trips(invitation_code);
CREATE INDEX IF NOT EXISTS idx_trip_members_trip ON public.trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user ON public.trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_stops_trip ON public.stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_waypoints_trip ON public.waypoints(trip_id);
CREATE INDEX IF NOT EXISTS idx_messages_trip ON public.messages(trip_id, created_at);
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places(category);
CREATE INDEX IF NOT EXISTS idx_hygiene_reports_place ON public.hygiene_reports(place_id);

-- ------------------------------------------------------------------------------
-- 11. SECURITY DEFINER AUTHORIZATION HELPERS (Anti-Recursion RLS Engine)
-- ------------------------------------------------------------------------------
-- These helper functions run with table-owner security to inspect permissions
-- without triggering recursive RLS query cycles.

CREATE OR REPLACE FUNCTION public.get_user_trip_role(check_trip_id UUID, check_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.trip_members
  WHERE trip_id = check_trip_id AND user_id = check_user_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_trip_member(check_trip_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_id = check_trip_id AND user_id = check_user_id
  );
$$;

-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hygiene_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Profiles are readable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- TRIPS POLICIES
DROP POLICY IF EXISTS "Members can view their trips" ON public.trips;
CREATE POLICY "Members can view their trips"
  ON public.trips FOR SELECT
  USING (owner_id = auth.uid() OR public.is_trip_member(id, auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create trips" ON public.trips;
CREATE POLICY "Authenticated users can create trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners and editors can update trips" ON public.trips;
CREATE POLICY "Owners and editors can update trips"
  ON public.trips FOR UPDATE
  USING (owner_id = auth.uid() OR public.get_user_trip_role(id, auth.uid()) IN ('owner', 'editor'));

DROP POLICY IF EXISTS "Only trip owners can delete trips" ON public.trips;
CREATE POLICY "Only trip owners can delete trips"
  ON public.trips FOR DELETE
  USING (owner_id = auth.uid());

-- TRIP MEMBERS POLICIES (Non-Recursive)
DROP POLICY IF EXISTS "Members can view membership of their trips" ON public.trip_members;
CREATE POLICY "Members can view membership of their trips"
  ON public.trip_members FOR SELECT
  USING (user_id = auth.uid() OR public.is_trip_member(trip_id, auth.uid()));

DROP POLICY IF EXISTS "Users can join trips or owners can add members" ON public.trip_members;
CREATE POLICY "Users can join trips or owners can add members"
  ON public.trip_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    OR public.get_user_trip_role(trip_id, auth.uid()) = 'owner'
    OR EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can update member roles" ON public.trip_members;
CREATE POLICY "Owners can update member roles"
  ON public.trip_members FOR UPDATE
  USING (public.get_user_trip_role(trip_id, auth.uid()) = 'owner');

DROP POLICY IF EXISTS "Members can leave or owners can remove members" ON public.trip_members;
CREATE POLICY "Members can leave or owners can remove members"
  ON public.trip_members FOR DELETE
  USING (user_id = auth.uid() OR public.get_user_trip_role(trip_id, auth.uid()) = 'owner');

-- STOPS & WAYPOINTS POLICIES
DROP POLICY IF EXISTS "Trip members can view stops" ON public.stops;
CREATE POLICY "Trip members can view stops"
  ON public.stops FOR SELECT
  USING (public.is_trip_member(trip_id, auth.uid()));

DROP POLICY IF EXISTS "Owners and editors can insert stops" ON public.stops;
CREATE POLICY "Owners and editors can insert stops"
  ON public.stops FOR INSERT
  WITH CHECK (public.get_user_trip_role(trip_id, auth.uid()) IN ('owner', 'editor'));

DROP POLICY IF EXISTS "Owners and editors can update stops" ON public.stops;
CREATE POLICY "Owners and editors can update stops"
  ON public.stops FOR UPDATE
  USING (public.get_user_trip_role(trip_id, auth.uid()) IN ('owner', 'editor'));

DROP POLICY IF EXISTS "Owners and editors can delete stops" ON public.stops;
CREATE POLICY "Owners and editors can delete stops"
  ON public.stops FOR DELETE
  USING (public.get_user_trip_role(trip_id, auth.uid()) IN ('owner', 'editor'));

DROP POLICY IF EXISTS "Trip members can view waypoints" ON public.waypoints;
CREATE POLICY "Trip members can view waypoints"
  ON public.waypoints FOR SELECT
  USING (public.is_trip_member(trip_id, auth.uid()));

DROP POLICY IF EXISTS "Owners and editors can manage waypoints" ON public.waypoints;
CREATE POLICY "Owners and editors can manage waypoints"
  ON public.waypoints FOR ALL
  USING (public.get_user_trip_role(trip_id, auth.uid()) IN ('owner', 'editor'));

-- MESSAGES POLICIES
DROP POLICY IF EXISTS "Trip members can read messages" ON public.messages;
CREATE POLICY "Trip members can read messages"
  ON public.messages FOR SELECT
  USING (public.is_trip_member(trip_id, auth.uid()));

DROP POLICY IF EXISTS "Trip members can post messages" ON public.messages;
CREATE POLICY "Trip members can post messages"
  ON public.messages FOR INSERT
  WITH CHECK (public.is_trip_member(trip_id, auth.uid()) AND sender_id = auth.uid());

DROP POLICY IF EXISTS "Senders or owners can delete messages" ON public.messages;
CREATE POLICY "Senders or owners can delete messages"
  ON public.messages FOR DELETE
  USING (sender_id = auth.uid() OR public.get_user_trip_role(trip_id, auth.uid()) = 'owner');

-- PLACES POLICIES (Public catalog read, authenticated contributor insert)
DROP POLICY IF EXISTS "Places catalog is readable by everyone" ON public.places;
CREATE POLICY "Places catalog is readable by everyone"
  ON public.places FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can contribute places" ON public.places;
CREATE POLICY "Authenticated users can contribute places"
  ON public.places FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update places" ON public.places;
CREATE POLICY "Authenticated users can update places"
  ON public.places FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- HYGIENE REPORTS POLICIES
DROP POLICY IF EXISTS "Hygiene reports are readable by everyone" ON public.hygiene_reports;
CREATE POLICY "Hygiene reports are readable by everyone"
  ON public.hygiene_reports FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can submit their own hygiene reports" ON public.hygiene_reports;
CREATE POLICY "Users can submit their own hygiene reports"
  ON public.hygiene_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can edit or delete their own hygiene reports" ON public.hygiene_reports;
CREATE POLICY "Users can edit or delete their own hygiene reports"
  ON public.hygiene_reports FOR ALL
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 13. AUTOMATED TRIGGERS
-- ------------------------------------------------------------------------------
-- A. Auto-create public profile upon user signup in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
      avatar_url = CASE WHEN profiles.avatar_url = '' THEN EXCLUDED.avatar_url ELSE profiles.avatar_url END,
      updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. Auto-add trip creator as owner member in trip_members
CREATE OR REPLACE FUNCTION public.handle_trip_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.trip_members (trip_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (trip_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_trip_created ON public.trips;
CREATE TRIGGER on_trip_created
  AFTER INSERT ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_trip_created();

-- ------------------------------------------------------------------------------
-- 14. REALTIME PUBLICATION CONFIGURATION
-- ------------------------------------------------------------------------------
-- Configure Full row identity for real-time update payloads
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.trips REPLICA IDENTITY FULL;
ALTER TABLE public.trip_members REPLICA IDENTITY FULL;
ALTER TABLE public.stops REPLICA IDENTITY FULL;

-- Add collaboration tables to Supabase Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'trips'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'trip_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_members;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'stops'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stops;
  END IF;
END $$;
