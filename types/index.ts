export type TravelStyle = 
  | 'luxury'
  | 'adventure'
  | 'backpacking'
  | 'solo'
  | 'family'
  | 'romantic'
  | 'food-explorer';

export interface TravelFormData {
  destination: string;
  budget: number;
  duration: number;
  travelStyle: TravelStyle;
}

export interface MoodBoardImage {
  id: string;
  url: string;
  category: string;
  alt: string;
}

export type TravelPriority = 'must-visit' | 'nice-to-visit' | 'skip';

export interface CategoryPlace {
  id: string;
  name: string;
  description: string;
  estimatedCost: string;
  duration: string;
}

export interface CategoryDetails {
  category: string;
  imageUrl: string;
  whyPopular: string;
  topPlaces: CategoryPlace[];
  estimatedCost: string;
  bestTime: string;
  recommendedDuration: string;
  tags: string[];
}

export interface SavedActivity {
  id: string;
  categoryId: string;
  category: string;
  placeName: string;
  estimatedCost: number;
  duration: string;
  priority: TravelPriority;
  addedAt: Date;
}

export interface TripPlannerStats {
  totalActivities: number;
  totalBudget: number;
  plannedExperiences: number;
  recommendedExperiences: number;
  progressScore: number;
  mostPopularCategory: string;
  budgetFriendlyCategory: string;
  familyFriendlyCategory: string;
  adventureScore: number;
}

export interface ColorPalette {
  hex: string;
  name: string;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  duration: string;
  category: string;
  image?: string;
}

export interface FoodRecommendation {
  id: string;
  name: string;
  description: string;
  significance: string;
  image?: string;
}

export interface PackingItem {
  id: string;
  item: string;
  category: string;
  checked: boolean;
}

export interface ItineraryDay {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
}

export interface TravelInsight {
  title: string;
  content: string[];
  icon: string;
}

export interface DestinationData {
  name: string;
  description: string;
  heroImage: string;
  bestSeason: string;
  weather: string;
  dailyBudget: number;
}

export interface TravelBoard {
  id: string;
  formData: TravelFormData;
  destination: DestinationData;
  moodBoard: MoodBoardImage[];
  categoryDetails: CategoryDetails[];
  colorPalette: ColorPalette[];
  attractions: Attraction[];
  foodRecommendations: FoodRecommendation[];
  packingList: PackingItem[];
  itinerary: ItineraryDay[];
  insights: TravelInsight[];
  createdAt: Date;
}

// ==========================================
// HYGIENE INTELLIGENCE TYPES
// ==========================================

export type HygieneVerificationStatus =
  | 'officially_inspected'
  | 'independently_inspected'
  | 'community_reported'
  | 'not_yet_verified'
  | 'verification_expired';

export interface HygieneChecklist {
  visibleCleanlinessScore: number; // 1 to 5
  runningWater: boolean;
  soapAvailable: boolean;
  toiletFunctionalityScore: number; // 1 to 5
  wasteDisposalMaintained: boolean;
  odorRatingScore: number; // 1 to 5 (5 = odorless/fresh)
  wheelchairAccessible: boolean;
  babyChangingStation: boolean;
  genderNeutralStalls: boolean;
  notes?: string;
  inspectorIdentity?: string;
  inspectionDate: string;
}

export interface CommunityHygieneReport {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  visitDate: string;
  cleanlinessRating: number; // 1 to 5
  soapAvailable: boolean;
  runningWater: boolean;
  flushWorking: boolean;
  comments: string;
  flaggedIssues?: string[];
  photoUrl?: string;
  timestamp: string;
}

export type PlaceCategory = 
  | 'hotel' 
  | 'restaurant' 
  | 'washroom' 
  | 'fuel' 
  | 'rest_stop' 
  | 'attraction';

export interface Place {
  id: string;
  googlePlaceId?: string;
  name: string;
  category: PlaceCategory;
  address: string;
  city: string;
  coordinates: { lat: number; lng: number };
  phone?: string;
  openingHours?: string;
  priceLevel?: number; // 1 to 4
  rating?: number; // e.g., 4.7
  reviewCount?: number;
  imageUrl?: string;
  detourKm?: number;
  detourMinutes?: number;
  // Hygiene & Sanitation Profile
  hygieneStatus: HygieneVerificationStatus;
  hygieneScore?: number; // 0 to 100 derived transparently
  hygieneConfidence: 'high' | 'medium' | 'limited';
  lastVerifiedDate?: string;
  evidenceSource?: string;
  washroomAvailability: 'available' | 'customers_only' | 'paid' | 'unavailable' | 'unknown';
  waterAvailable: boolean | 'unknown';
  soapAvailable: boolean | 'unknown';
  accessibleFacility: boolean | 'unknown';
  checklist?: HygieneChecklist;
  communityReports?: CommunityHygieneReport[];
}

// ==========================================
// GOOGLE MAPS & ROUTE PLANNING TYPES
// ==========================================

export type TravelMode = 'driving' | 'transit' | 'walking' | 'bicycling';

export interface Waypoint {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  category?: PlaceCategory;
  placeId?: string;
  detourKm?: number;
  detourMinutes?: number;
  order: number;
  plannedArrival?: string;
  notes?: string;
  suggestedBy?: string;
}

export interface RouteInfo {
  origin: { name: string; address: string; coordinates: { lat: number; lng: number } };
  destination: { name: string; address: string; coordinates: { lat: number; lng: number } };
  distanceKm: number;
  durationMinutes: number;
  polyline?: string;
  coordinatesPath: [number, number][]; // [lat, lng][] array
  travelMode: TravelMode;
  summary: string;
  waypoints: Waypoint[];
  alternativeRoutes?: {
    summary: string;
    distanceKm: number;
    durationMinutes: number;
    coordinatesPath: [number, number][];
  }[];
}

// ==========================================
// COLLABORATIVE TRIP WORKSPACE & CHAT TYPES
// ==========================================

export type TripMemberRole = 'owner' | 'editor' | 'viewer';

export interface TripMember {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: TripMemberRole;
  joinedAt: string;
}

export interface StopSuggestionVote {
  userId: string;
  userName: string;
  vote: 1 | -1;
}

export interface StopSuggestion {
  id: string;
  tripId: string;
  place: Place;
  suggestedBy: string;
  suggestedByName: string;
  suggestedAt: string;
  reason?: string;
  votes: StopSuggestionVote[];
  status: 'pending' | 'accepted' | 'rejected';
}

export interface TripMessage {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'itinerary_update' | 'place_recommendation' | 'vote_alert';
  attachedPlace?: Place;
  replyToId?: string;
}

export interface CollaborativeTrip {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  origin: string;
  originCoordinates?: { lat: number; lng: number };
  destination: string;
  destinationCoordinates?: { lat: number; lng: number };
  startDate: string;
  endDate: string;
  budget: number;
  travelMode: TravelMode;
  groupSize: number;
  preferences: string[];
  washroomPreference: 'any' | 'verified_only' | 'high_standard';
  ownerId: string;
  members: TripMember[];
  invitationCode: string;
  route?: RouteInfo;
  stops: Waypoint[];
  suggestions: StopSuggestion[];
  messages: TripMessage[];
  itineraryDays?: ItineraryDay[];
  createdAt: string;
  updatedAt: string;
}

