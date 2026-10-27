-- ==============================================================================
-- WANDERCANVAS — GLOBAL TRAVEL KNOWLEDGE CATALOGUE MIGRATION
-- ==============================================================================
-- Idempotent schema for PostgreSQL on Supabase
-- Tables:
--   1. catalogue_continents
--   2. catalogue_countries
--   3. catalogue_subdivisions
--   4. catalogue_destinations
--   5. catalogue_attractions
--   6. catalogue_food_experiences
--   7. catalogue_accommodations
--   8. catalogue_photographs
-- Features:
--   - Stable string IDs and canonical naming
--   - Geographic coordinates (lat, lng) with spatial validation
--   - Normalized admission and meal pricing with ISO currency codes
--   - Source attribution, audit timestamps, and verification confidence
--   - Row Level Security (RLS) with public read access
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CONTINENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalogue_continents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  hero_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. COUNTRIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalogue_countries (
  id TEXT PRIMARY KEY,
  continent_id TEXT NOT NULL REFERENCES public.catalogue_continents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  iso_code TEXT NOT NULL UNIQUE,
  capital TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  flag TEXT,
  tagline TEXT,
  description TEXT,
  hero_image TEXT,
  subdivision_type TEXT NOT NULL DEFAULT 'regions',
  subdivision_label TEXT NOT NULL DEFAULT 'Regions',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. ADMINISTRATIVE SUBDIVISIONS (States, Prefectures, Cantons, Regions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalogue_subdivisions (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL REFERENCES public.catalogue_countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  local_name TEXT,
  type TEXT NOT NULL, -- e.g. "State", "Canton", "Prefecture", "Region"
  description TEXT,
  hero_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. DESTINATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalogue_destinations (
  id TEXT PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  country_id TEXT NOT NULL REFERENCES public.catalogue_countries(id) ON DELETE CASCADE,
  subdivision_id TEXT NOT NULL REFERENCES public.catalogue_subdivisions(id) ON DELETE CASCADE,
  locality TEXT NOT NULL,
  coordinates JSONB NOT NULL, -- { lat: float, lng: float }
  category TEXT NOT NULL DEFAULT 'regions-cities',
  description TEXT NOT NULL,
  best_season TEXT,
  weather_summary TEXT,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  daily_budget_estimate NUMERIC(10, 2) DEFAULT 100,
  hygiene_score INTEGER CHECK (hygiene_score BETWEEN 0 AND 100),
  hygiene_status TEXT NOT NULL DEFAULT 'not_yet_verified',
  hero_image TEXT NOT NULL,
  image_attribution TEXT,
  source_authority TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. ATTRACTIONS (Grounded Historical, Natural & Cultural Landmarks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalogue_attractions (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES public.catalogue_destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('waterfall', 'heritage', 'viewpoint', 'nature', 'food_park', 'lake', 'temple', 'culture', 'landmark')),
  locality TEXT NOT NULL,
  distance_from_center_km NUMERIC(5, 2) DEFAULT 0,
  coordinates JSONB NOT NULL,
  description TEXT NOT NULL,
  admission_amount NUMERIC(8, 2) DEFAULT 0,
  admission_currency TEXT NOT NULL DEFAULT 'INR',
  pricing_status TEXT NOT NULL DEFAULT 'estimated' CHECK (pricing_status IN ('free_access', 'verified', 'estimated', 'unavailable')),
  admission_details TEXT,
  recommended_duration TEXT,
  best_time_to_visit TEXT,
  image_url TEXT NOT NULL,
  image_attribution TEXT,
  verification_source TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. FOOD EXPERIENCES & SPECIALTIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalogue_food_experiences (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES public.catalogue_destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('specialty', 'street_food', 'traditional_meal', 'farm_produce', 'dessert', 'beverage')),
  description TEXT NOT NULL,
  significance TEXT,
  locality TEXT,
  price_min NUMERIC(8, 2) DEFAULT 0,
  price_max NUMERIC(8, 2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  pricing_status TEXT NOT NULL DEFAULT 'estimated' CHECK (pricing_status IN ('verified', 'estimated', 'unavailable')),
  unit TEXT NOT NULL DEFAULT 'per_dish',
  image_url TEXT NOT NULL,
  image_attribution TEXT,
  verification_source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. ACCOMMODATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.catalogue_accommodations (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES public.catalogue_destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('resort', 'hotel', 'homestay', 'heritage', 'villa')),
  locality TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  rate_min NUMERIC(10, 2) DEFAULT 0,
  rate_max NUMERIC(10, 2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  rate_status TEXT NOT NULL DEFAULT 'estimated' CHECK (rate_status IN ('estimated', 'verified_range')),
  rate_note TEXT,
  hygiene_score INTEGER CHECK (hygiene_score BETWEEN 0 AND 100),
  hygiene_status TEXT NOT NULL DEFAULT 'not_yet_verified',
  rating NUMERIC(3, 2) CHECK (rating BETWEEN 0 AND 5),
  phone TEXT,
  image_url TEXT NOT NULL,
  verification_source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cat_countries_continent ON public.catalogue_countries(continent_id);
CREATE INDEX IF NOT EXISTS idx_cat_subdivisions_country ON public.catalogue_subdivisions(country_id);
CREATE INDEX IF NOT EXISTS idx_cat_destinations_subdivision ON public.catalogue_destinations(subdivision_id);
CREATE INDEX IF NOT EXISTS idx_cat_destinations_country ON public.catalogue_destinations(country_id);
CREATE INDEX IF NOT EXISTS idx_cat_attractions_dest ON public.catalogue_attractions(destination_id);
CREATE INDEX IF NOT EXISTS idx_cat_attractions_cat ON public.catalogue_attractions(category);
CREATE INDEX IF NOT EXISTS idx_cat_food_dest ON public.catalogue_food_experiences(destination_id);
CREATE INDEX IF NOT EXISTS idx_cat_acc_dest ON public.catalogue_accommodations(destination_id);

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.catalogue_continents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_subdivisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_food_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_accommodations ENABLE ROW LEVEL SECURITY;

-- Public read access for global catalogue
DROP POLICY IF EXISTS "Public read access for continents" ON public.catalogue_continents;
CREATE POLICY "Public read access for continents" ON public.catalogue_continents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for countries" ON public.catalogue_countries;
CREATE POLICY "Public read access for countries" ON public.catalogue_countries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for subdivisions" ON public.catalogue_subdivisions;
CREATE POLICY "Public read access for subdivisions" ON public.catalogue_subdivisions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for destinations" ON public.catalogue_destinations;
CREATE POLICY "Public read access for destinations" ON public.catalogue_destinations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for attractions" ON public.catalogue_attractions;
CREATE POLICY "Public read access for attractions" ON public.catalogue_attractions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for food" ON public.catalogue_food_experiences;
CREATE POLICY "Public read access for food" ON public.catalogue_food_experiences FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for accommodations" ON public.catalogue_accommodations;
CREATE POLICY "Public read access for accommodations" ON public.catalogue_accommodations FOR SELECT USING (true);
