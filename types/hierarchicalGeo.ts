/**
 * ==============================================================================
 * WANDERCANVAS — HIERARCHICAL GEOGRAPHIC CATALOGUE & DISCOVERY SYSTEM
 * ==============================================================================
 * Multi-level geographic ontology supporting global travel discovery from
 * continents down to sub-localities, attractions, and local businesses.
 */

export type GeoEntityType =
  | 'continent'
  | 'country'
  | 'state'              // ADM1 (State, Province, Territory, Canton, Prefecture, Region)
  | 'district'           // ADM2 (District, County, Department, Regency)
  | 'city'               // Populated urban center
  | 'town'               // Populated minor urban center
  | 'village'            // Populated rural locality / settlement
  | 'locality'           // General named geographic locality
  | 'suburb'             // Sub-locality, neighbourhood
  | 'tourist_region'     // Hill station, biosphere, scenic corridor, valley, island
  | 'attraction'         // Waterfall, fort, viewpoint, lake, monument, landmark
  | 'business';          // Hotel, restaurant, cafe, petrol pump, EV charger, washroom

export type GeoPlaceCategory =
  | 'administrative'
  | 'waterfall'
  | 'heritage'
  | 'viewpoint'
  | 'lake'
  | 'nature_reserve'
  | 'temple'
  | 'hotel'
  | 'resort'
  | 'restaurant'
  | 'cafe'
  | 'petrol_pump'
  | 'ev_charging'
  | 'parking'
  | 'washroom'
  | 'general';

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface GeoBreadcrumbItem {
  id: string;
  name: string;
  entityType: GeoEntityType;
  typeLabel: string;
}

export interface GeoEntity {
  id: string;                               // Stable canonical identifier (e.g. "locality-in-mh-mahabaleshwar")
  canonicalName: string;                    // Primary display name (e.g. "Mahabaleshwar")
  entityType: GeoEntityType;                // Level in hierarchy
  typeLabel?: string;                       // Human-friendly label (e.g. "Hill Station / Town", "District")
  parentId: string | null;                  // Direct parent in hierarchy (null for continents)
  countryCode: string;                      // ISO 3166-1 alpha-2 ("IN", "JP", "FR", "IT", "US")
  adm1Code?: string;                        // State/Province code ("MH", "KA", "13")
  alternateNames: string[];                 // Multilingual names, abbreviations, historical spellings
  coordinates: GeoCoordinates;              // Representative GPS coordinates
  boundingBox?: [number, number, number, number]; // [minLat, minLng, maxLat, maxLng]
  category: GeoPlaceCategory;
  categoryLabel?: string;
  description: string;
  heroImage?: string;
  imageAttribution?: string;
  hierarchyPath?: string[];                 // Materialized ancestor IDs: [continentId, countryId, adm1Id, ...]
  
  // Rich metadata (ratings, hygiene scores, operating hours, addresses, contact)
  metadata?: {
    hygieneScore?: number;
    hygieneStatus?: 'verified_clean' | 'officially_inspected' | 'community_reported' | 'unverified';
    amenityType?: string;
    address?: string;
    postalCode?: string;
    phone?: string;
    website?: string;
    googlePlaceId?: string;
    fuelTypes?: string[];                   // e.g. ["Petrol", "Diesel", "CNG", "EV Charging"]
    fuelBrand?: string;                     // e.g. "Indian Oil", "HP", "Bharat Petroleum", "Shell"
    starRating?: number;
    reviewCount?: number;
    priceLevel?: 'budget' | 'moderate' | 'luxury';
    admissionPrice?: {
      amount: number;
      currency: string;
      status: 'free_access' | 'verified' | 'estimated';
    };
    tags?: string[];
  };

  sourceType: 'verified_catalogue' | 'geo_names' | 'natural_earth' | 'official_tourism' | 'google_places';
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HierarchicalSearchResult {
  entity: GeoEntity;
  matchType: 'exact_name' | 'alternate_name' | 'category_in_location' | 'fuzzy_substring';
  matchedQueryToken?: string;
  breadcrumbs: GeoBreadcrumbItem[];
  highlightSnippet?: string;
  directChildrenCount?: number;
}

export interface LocationHierarchyNode {
  entity: GeoEntity;
  breadcrumbs: GeoBreadcrumbItem[];
  children: GeoEntity[];
  attractions: GeoEntity[];
  businesses: GeoEntity[];
}

export interface HierarchicalBrowseState {
  currentEntityId: string;
  breadcrumbs: GeoBreadcrumbItem[];
  currentEntity: GeoEntity | null;
  childSubdivisions: GeoEntity[];
  childLocalities: GeoEntity[];
  childAttractions: GeoEntity[];
  childBusinesses: GeoEntity[];
  stats: {
    totalContinents: number;
    totalCountries: number;
    totalAdministrativeAreas: number;
    totalCitiesLocalities: number;
    totalAttractions: number;
    totalBusinesses: number;
  };
}
