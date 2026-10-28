-- ==============================================================================
-- WANDERCANVAS — HIERARCHICAL GEOGRAPHIC CATALOGUE & DISCOVERY MIGRATION
-- ==============================================================================
-- Migration: 20261028020000_hierarchical_geo_catalogue.sql
-- Enables arbitrary, recursive parent-child geographic indexing from continents
-- down to administrative subdivisions, districts, towns, villages, tourist
-- regions, attractions, and local facilities.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------------------------
-- 1. UNIFIED GEO ENTITIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.geo_entities (
  id TEXT PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (
    entity_type IN (
      'continent',
      'country',
      'state',
      'district',
      'city',
      'town',
      'village',
      'locality',
      'suburb',
      'tourist_region',
      'attraction',
      'business'
    )
  ),
  type_label TEXT,
  parent_id TEXT REFERENCES public.geo_entities(id) ON DELETE SET NULL,
  country_code VARCHAR(4) NOT NULL,
  adm1_code VARCHAR(16),
  alternate_names TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  coordinates JSONB NOT NULL DEFAULT '{"lat": 0, "lng": 0}'::JSONB,
  bounding_box DOUBLE PRECISION[],
  category TEXT NOT NULL DEFAULT 'general',
  category_label TEXT,
  description TEXT NOT NULL DEFAULT '',
  hero_image TEXT,
  image_attribution TEXT,
  hierarchy_path TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  source_type TEXT NOT NULL DEFAULT 'verified_catalogue',
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. INDEXES FOR HIGH-PERFORMANCE DISCOVERY
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_geo_entities_parent ON public.geo_entities(parent_id);
CREATE INDEX IF NOT EXISTS idx_geo_entities_type ON public.geo_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_geo_entities_category ON public.geo_entities(category);
CREATE INDEX IF NOT EXISTS idx_geo_entities_country ON public.geo_entities(country_code);
CREATE INDEX IF NOT EXISTS idx_geo_entities_adm1 ON public.geo_entities(adm1_code);
CREATE INDEX IF NOT EXISTS idx_geo_entities_path ON public.geo_entities USING GIN (hierarchy_path);
CREATE INDEX IF NOT EXISTS idx_geo_entities_alt_names ON public.geo_entities USING GIN (alternate_names);
CREATE INDEX IF NOT EXISTS idx_geo_entities_name_trgm ON public.geo_entities USING GIN (canonical_name gin_trgm_ops);

-- ------------------------------------------------------------------------------
-- 3. RECURSIVE BREADCRUMB QUERY FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_geo_breadcrumbs(target_entity_id TEXT)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  entity_type TEXT,
  type_label TEXT,
  level_depth INT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE ancestors AS (
    SELECT 
      g.id,
      g.canonical_name AS name,
      g.entity_type,
      g.type_label,
      g.parent_id,
      1 AS level_depth
    FROM public.geo_entities g
    WHERE g.id = target_entity_id

    UNION ALL

    SELECT 
      p.id,
      p.canonical_name AS name,
      p.entity_type,
      p.type_label,
      p.parent_id,
      a.level_depth + 1
    FROM public.geo_entities p
    JOIN ancestors a ON p.id = a.parent_id
  )
  SELECT 
    ancestors.id,
    ancestors.name,
    ancestors.entity_type,
    ancestors.type_label,
    ancestors.level_depth
  FROM ancestors
  ORDER BY ancestors.level_depth DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.geo_entities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access on geo_entities" ON public.geo_entities;
CREATE POLICY "Public Read Access on geo_entities"
  ON public.geo_entities
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated Write Access on geo_entities" ON public.geo_entities;
CREATE POLICY "Authenticated Write Access on geo_entities"
  ON public.geo_entities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
