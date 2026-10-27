export type ContinentId = 
  | 'asia' 
  | 'europe' 
  | 'africa' 
  | 'north-america' 
  | 'south-america' 
  | 'oceania' 
  | 'antarctica';

export interface Continent {
  id: ContinentId;
  name: string;
  code: string;
  tagline: string;
  description: string;
  heroImage: string;
  featuredCountryIds: string[];
  curatedCount: number;
}

export type AdministrativeDivisionType = 
  | 'states' 
  | 'prefectures' 
  | 'provinces' 
  | 'regions' 
  | 'departments' 
  | 'cantons' 
  | 'territories';

export interface Subdivision {
  id: string;
  name: string;
  localName?: string;
  type: string; // e.g. "State", "Prefecture", "Canton", "Region"
  description: string;
  heroImage: string;
}

export type CountryCategory =
  | 'regions-cities'
  | 'natural-attractions'
  | 'heritage-history'
  | 'local-culture'
  | 'festivals-events'
  | 'regional-cuisine'
  | 'arts-architecture'
  | 'adventure-outdoors'
  | 'hotels-stays'
  | 'road-trips';

export interface CountryCategoryMeta {
  id: CountryCategory;
  label: string;
  icon: string;
  description: string;
}

export interface Country {
  id: string; // e.g., "india", "japan", "italy", "kenya"
  name: string;
  isoCode: string; // e.g., "IN", "JP", "IT", "KE"
  continentId: ContinentId;
  flag: string;
  capital: string;
  currency: string;
  tagline: string;
  description: string;
  heroImage: string;
  subdivisionType: AdministrativeDivisionType;
  subdivisionLabel: string; // e.g. "States & UTs", "Prefectures", "Regions", "Cantons"
  subdivisions: Subdivision[];
  supportedCategories: CountryCategory[];
}

export interface GlobalDestination {
  id: string;
  name: string;
  countryId: string;
  subdivisionId: string;
  continentId: ContinentId;
  category: CountryCategory;
  categoryLabel?: string;
  rating: number;
  reviews: number;
  hygieneScore: number;
  hygieneStatus: string;
  bestSeason: string;
  image: string;
  description: string;
  highlights: string[];
  coordinates?: { lat: number; lng: number };
}
