import { HygieneVerificationStatus } from './index';

export type PricingStatus = 'free_access' | 'verified' | 'estimated' | 'unavailable';

export interface AdmissionPrice {
  amount: number;
  currency: string; // ISO 4217, e.g. 'INR', 'EUR', 'JPY', 'USD'
  status: PricingStatus;
  details?: string;
  source?: string;
  lastVerified?: string;
}

export interface FoodPriceRange {
  min: number;
  max: number;
  currency: string;
  status: PricingStatus;
  unit: 'per_person' | 'per_dish' | 'per_portion';
  source?: string;
}

export interface AccommodationPriceEstimate {
  min: number;
  max: number;
  currency: string;
  status: 'estimated' | 'verified_range';
  note: string;
  source?: string;
}

export interface VerifiedAttraction {
  id: string;
  destinationId: string;
  name: string;
  canonicalName: string;
  locality: string; // e.g. "Mahabaleshwar-Pune Road, 6 km from town"
  distanceFromCenterKm: number;
  coordinates: { lat: number; lng: number };
  category: 'waterfall' | 'heritage' | 'viewpoint' | 'nature' | 'food_park' | 'lake' | 'temple' | 'culture' | 'landmark';
  description: string;
  admission: AdmissionPrice;
  recommendedDuration: string;
  bestTimeToVisit: string;
  imageUrl: string;
  imageAttribution?: string;
  verificationSource: string;
  tags: string[];
}

export interface VerifiedFoodExperience {
  id: string;
  destinationId: string;
  name: string;
  category: 'specialty' | 'street_food' | 'traditional_meal' | 'farm_produce' | 'dessert' | 'beverage';
  description: string;
  significance: string;
  locality: string;
  priceRange: FoodPriceRange;
  imageUrl: string;
  imageAttribution?: string;
  verificationSource: string;
}

export interface VerifiedAccommodation {
  id: string;
  destinationId: string;
  name: string;
  type: 'resort' | 'hotel' | 'homestay' | 'heritage' | 'villa';
  locality: string;
  coordinates: { lat: number; lng: number };
  rateEstimate: AccommodationPriceEstimate;
  hygieneScore: number;
  hygieneStatus: HygieneVerificationStatus;
  rating: number;
  phone?: string;
  imageUrl: string;
  verificationSource: string;
}

export interface VerifiedDestinationProfile {
  id: string;
  canonicalName: string;
  countryId: string;
  countryName: string;
  countryCode: string; // 'IN', 'IT', 'JP', etc.
  subdivisionId: string;
  subdivisionName: string;
  locality: string;
  coordinates: { lat: number; lng: number };
  matchKeywords: string[];
  description: string;
  bestSeason: string;
  weather: string;
  heroImage: string;
  imageAttribution?: string;
  defaultCurrency: string; // 'INR', 'EUR', etc.
  dailyBudgetEstimate: {
    amount: number;
    currency: string;
    level: 'budget' | 'moderate' | 'luxury';
  };
  hygieneAuditSummary: {
    overallScore: number;
    verifiedFacilitiesCount: number;
    sanitationConfidence: 'high' | 'medium';
    authority: string;
  };
  attractions: VerifiedAttraction[];
  foodExperiences: VerifiedFoodExperience[];
  accommodations: VerifiedAccommodation[];
  cultureAndEtiquette: {
    title: string;
    tips: string[];
  }[];
  colorPalette: { hex: string; name: string }[];
}
