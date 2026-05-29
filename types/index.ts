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
