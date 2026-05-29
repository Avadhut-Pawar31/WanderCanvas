import { TravelFormData, TravelBoard, DestinationData, MoodBoardImage, ColorPalette, Attraction, FoodRecommendation, PackingItem, ItineraryDay, TravelInsight, CategoryDetails } from '@/types';
import { generateId, resetIdCounter } from '@/lib/utils';

// Mock AI service - In production, this would call actual AI APIs
export class AIService {
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async generateTravelBoard(formData: TravelFormData): Promise<TravelBoard> {
    // Reset ID counter for deterministic IDs
    resetIdCounter();
    
    // Simulate AI processing time
    await this.delay(1500);

    const destination = this.generateDestination(formData);
    await this.delay(800);
    
    const moodBoard = this.generateMoodBoard(formData);
    await this.delay(600);
    
    const categoryDetails = this.generateCategoryDetails(formData);
    await this.delay(600);
    
    const colorPalette = this.generateColorPalette(formData);
    await this.delay(500);
    
    const attractions = this.generateAttractions(formData);
    await this.delay(700);
    
    const foodRecommendations = this.generateFoodRecommendations(formData);
    await this.delay(600);
    
    const packingList = this.generatePackingList(formData);
    await this.delay(500);
    
    const itinerary = this.generateItinerary(formData);
    await this.delay(700);
    
    const insights = this.generateInsights(formData);

    return {
      id: generateId(),
      formData,
      destination,
      moodBoard,
      categoryDetails,
      colorPalette,
      attractions,
      foodRecommendations,
      packingList,
      itinerary,
      insights,
      createdAt: new Date(),
    };
  }

  private static generateDestination(formData: TravelFormData): DestinationData {
    const destinations: Record<string, DestinationData> = {
      'paris': {
        name: 'Paris',
        description: 'The City of Light beckons with its iconic Eiffel Tower, world-class museums, charming cafés, and romantic Seine River. Experience art, fashion, and culinary excellence in this timeless European capital.',
        heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
        bestSeason: 'April to June, September to October',
        weather: 'Mild springs, warm summers, cool autumns',
        dailyBudget: formData.budget / formData.duration,
      },
      'tokyo': {
        name: 'Tokyo',
        description: 'A mesmerizing blend of ancient tradition and cutting-edge technology. From serene temples to neon-lit streets, Tokyo offers an unforgettable journey through Japanese culture, cuisine, and innovation.',
        heroImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
        bestSeason: 'March to May, September to November',
        weather: 'Cherry blossoms in spring, mild autumns',
        dailyBudget: formData.budget / formData.duration,
      },
      'bali': {
        name: 'Bali',
        description: 'An Indonesian paradise of lush rice terraces, ancient temples, pristine beaches, and vibrant culture. Discover spiritual retreats, world-class surfing, and warm Balinese hospitality.',
        heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
        bestSeason: 'April to October',
        weather: 'Tropical climate, dry season ideal',
        dailyBudget: formData.budget / formData.duration,
      },
      'goa': {
        name: 'Goa',
        description: 'India\'s beach paradise offers golden sands, Portuguese heritage, vibrant nightlife, and laid-back vibes. Experience water sports, beach shacks, historic churches, and unforgettable sunsets.',
        heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80',
        bestSeason: 'November to February',
        weather: 'Tropical, warm and sunny',
        dailyBudget: formData.budget / formData.duration,
      },
      'dubai': {
        name: 'Dubai',
        description: 'A futuristic oasis in the desert featuring towering skyscrapers, luxury shopping, pristine beaches, and world-class entertainment. Experience the perfect blend of tradition and innovation.',
        heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
        bestSeason: 'November to March',
        weather: 'Hot desert climate, mild winters',
        dailyBudget: formData.budget / formData.duration,
      },
      'london': {
        name: 'London',
        description: 'A historic metropolis blending royal heritage with modern culture. Explore iconic landmarks, world-class museums, diverse neighborhoods, and a thriving arts scene in this global capital.',
        heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
        bestSeason: 'May to September',
        weather: 'Temperate, mild and rainy',
        dailyBudget: formData.budget / formData.duration,
      },
      'new york': {
        name: 'New York',
        description: 'The city that never sleeps offers iconic skylines, Broadway shows, world-class dining, and endless energy. Experience the melting pot of cultures in America\'s most vibrant metropolis.',
        heroImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80',
        bestSeason: 'April to June, September to November',
        weather: 'Four distinct seasons',
        dailyBudget: formData.budget / formData.duration,
      },
      'santorini': {
        name: 'Santorini',
        description: 'A Greek island paradise famous for whitewashed buildings, blue-domed churches, stunning sunsets, and volcanic beaches. Experience romance, wine, and Mediterranean beauty.',
        heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80',
        bestSeason: 'April to November',
        weather: 'Mediterranean, warm and dry',
        dailyBudget: formData.budget / formData.duration,
      },
    };

    const key = formData.destination.toLowerCase();
    return destinations[key] || {
      name: formData.destination,
      description: `Discover the wonders of ${formData.destination}, a destination filled with unique experiences, rich culture, and unforgettable memories waiting to be made.`,
      heroImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
      bestSeason: 'Year-round',
      weather: 'Varies by season',
      dailyBudget: formData.budget / formData.duration,
    };
  }

  private static generateMoodBoard(formData: TravelFormData): MoodBoardImage[] {
    // Real working Unsplash images for each category
    const categoryImages: Record<string, string> = {
      'nature': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
      'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
      'architecture': 'https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?w=600&q=80',
      'beaches': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
      'culture': 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&q=80',
      'cafes': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
      'adventure': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
      'nightlife': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    };

    const categories = ['nature', 'food', 'architecture', 'beaches', 'culture', 'cafes', 'adventure', 'nightlife'];
    
    return categories.map((category) => ({
      id: generateId(),
      url: categoryImages[category],
      category,
      alt: `${formData.destination} ${category}`,
    }));
  }

  private static generateCategoryDetails(formData: TravelFormData): CategoryDetails[] {
    const destination = formData.destination.toLowerCase();
    
    const categoryData: Record<string, CategoryDetails> = {
      'nature': {
        category: 'nature',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
        whyPopular: `${formData.destination} offers breathtaking natural landscapes, from scenic parks to stunning viewpoints. Perfect for outdoor enthusiasts and photography lovers.`,
        topPlaces: [
          { id: generateId(), name: 'Central Park', description: 'Lush green oasis in the heart of the city', estimatedCost: '$0-20', duration: '2-3 hours' },
          { id: generateId(), name: 'Botanical Gardens', description: 'Diverse plant collections and peaceful walking paths', estimatedCost: '$15-25', duration: '1-2 hours' },
          { id: generateId(), name: 'Scenic Overlook', description: 'Panoramic views of the surrounding landscape', estimatedCost: '$0-10', duration: '1 hour' },
        ],
        estimatedCost: '$10-50 per visit',
        bestTime: 'Early morning or late afternoon for best lighting',
        recommendedDuration: '2-4 hours per location',
        tags: ['Outdoor', 'Photography', 'Relaxation', 'Family-Friendly'],
      },
      'food': {
        category: 'food',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
        whyPopular: `Experience authentic local cuisine and world-class dining. ${formData.destination} is renowned for its diverse culinary scene and unique flavors.`,
        topPlaces: [
          { id: generateId(), name: 'Local Market', description: 'Fresh ingredients and street food vendors', estimatedCost: '$10-30', duration: '1-2 hours' },
          { id: generateId(), name: 'Signature Restaurant', description: 'Traditional dishes with modern twist', estimatedCost: '$40-80', duration: '2 hours' },
          { id: generateId(), name: 'Food Tour', description: 'Guided tasting experience through the city', estimatedCost: '$60-100', duration: '3-4 hours' },
        ],
        estimatedCost: '$30-100 per meal',
        bestTime: 'Lunch (12-2pm) or Dinner (7-9pm)',
        recommendedDuration: '1-3 hours per experience',
        tags: ['Culinary', 'Local Culture', 'Must-Try', 'Social'],
      },
      'architecture': {
        category: 'architecture',
        imageUrl: 'https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?w=600&q=80',
        whyPopular: `Marvel at stunning architectural masterpieces that define ${formData.destination}'s skyline and heritage. From historic buildings to modern marvels.`,
        topPlaces: [
          { id: generateId(), name: 'Historic Cathedral', description: 'Centuries-old architectural wonder', estimatedCost: '$10-20', duration: '1-2 hours' },
          { id: generateId(), name: 'Modern Art Museum', description: 'Contemporary design and exhibitions', estimatedCost: '$20-30', duration: '2-3 hours' },
          { id: generateId(), name: 'Old Town District', description: 'Preserved historical architecture', estimatedCost: '$0-15', duration: '2-3 hours' },
        ],
        estimatedCost: '$15-40 per site',
        bestTime: 'Morning for fewer crowds',
        recommendedDuration: '1-3 hours per location',
        tags: ['History', 'Culture', 'Photography', 'Educational'],
      },
      'beaches': {
        category: 'beaches',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
        whyPopular: `Pristine beaches and crystal-clear waters make ${formData.destination} a paradise for beach lovers. Perfect for relaxation and water activities.`,
        topPlaces: [
          { id: generateId(), name: 'Main Beach', description: 'Popular beach with amenities and activities', estimatedCost: '$0-30', duration: '3-5 hours' },
          { id: generateId(), name: 'Hidden Cove', description: 'Secluded spot for peaceful relaxation', estimatedCost: '$0-20', duration: '2-4 hours' },
          { id: generateId(), name: 'Water Sports Center', description: 'Surfing, snorkeling, and diving', estimatedCost: '$50-150', duration: '2-3 hours' },
        ],
        estimatedCost: '$20-100 per day',
        bestTime: 'Morning (8-11am) for calm waters',
        recommendedDuration: '3-6 hours',
        tags: ['Relaxation', 'Water Sports', 'Scenic', 'Family-Friendly'],
      },
      'culture': {
        category: 'culture',
        imageUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&q=80',
        whyPopular: `Immerse yourself in the rich cultural heritage of ${formData.destination}. Experience local traditions, art, and community life.`,
        topPlaces: [
          { id: generateId(), name: 'Cultural Center', description: 'Traditional performances and exhibitions', estimatedCost: '$15-40', duration: '2-3 hours' },
          { id: generateId(), name: 'Local Festival', description: 'Seasonal celebrations and events', estimatedCost: '$0-50', duration: '3-5 hours' },
          { id: generateId(), name: 'Heritage Museum', description: 'Historical artifacts and stories', estimatedCost: '$10-25', duration: '1-2 hours' },
        ],
        estimatedCost: '$20-60 per experience',
        bestTime: 'Varies by event, check local calendar',
        recommendedDuration: '2-4 hours',
        tags: ['Cultural', 'Educational', 'Authentic', 'Memorable'],
      },
      'cafes': {
        category: 'cafes',
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
        whyPopular: `Discover charming cafes and coffee culture in ${formData.destination}. Perfect spots for relaxation, work, or people-watching.`,
        topPlaces: [
          { id: generateId(), name: 'Artisan Coffee House', description: 'Specialty coffee and pastries', estimatedCost: '$5-15', duration: '1-2 hours' },
          { id: generateId(), name: 'Rooftop Cafe', description: 'Scenic views with your coffee', estimatedCost: '$8-20', duration: '1-2 hours' },
          { id: generateId(), name: 'Historic Tea Room', description: 'Traditional tea service and ambiance', estimatedCost: '$15-30', duration: '1-2 hours' },
        ],
        estimatedCost: '$10-25 per visit',
        bestTime: 'Mid-morning (10am-12pm) or afternoon (3-5pm)',
        recommendedDuration: '1-2 hours',
        tags: ['Relaxation', 'Social', 'Budget-Friendly', 'Instagram-Worthy'],
      },
      'adventure': {
        category: 'adventure',
        imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
        whyPopular: `Get your adrenaline pumping with thrilling adventures in ${formData.destination}. From extreme sports to outdoor challenges.`,
        topPlaces: [
          { id: generateId(), name: 'Zip Line Course', description: 'Soar through the canopy', estimatedCost: '$60-120', duration: '2-3 hours' },
          { id: generateId(), name: 'Rock Climbing', description: 'Indoor and outdoor climbing experiences', estimatedCost: '$40-80', duration: '2-4 hours' },
          { id: generateId(), name: 'Adventure Park', description: 'Multiple activities and challenges', estimatedCost: '$50-100', duration: '3-5 hours' },
        ],
        estimatedCost: '$50-150 per activity',
        bestTime: 'Morning for cooler temperatures',
        recommendedDuration: '2-5 hours',
        tags: ['Adrenaline', 'Outdoor', 'Active', 'Memorable'],
      },
      'nightlife': {
        category: 'nightlife',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
        whyPopular: `Experience the vibrant nightlife of ${formData.destination}. From rooftop bars to live music venues and dance clubs.`,
        topPlaces: [
          { id: generateId(), name: 'Rooftop Bar', description: 'Cocktails with panoramic city views', estimatedCost: '$30-80', duration: '2-3 hours' },
          { id: generateId(), name: 'Live Music Venue', description: 'Local and international performances', estimatedCost: '$20-60', duration: '2-4 hours' },
          { id: generateId(), name: 'Night Market', description: 'Street food and shopping after dark', estimatedCost: '$15-40', duration: '2-3 hours' },
        ],
        estimatedCost: '$40-100 per night',
        bestTime: 'Evening (8pm onwards)',
        recommendedDuration: '2-4 hours',
        tags: ['Entertainment', 'Social', 'Vibrant', 'Adults'],
      },
    };

    return Object.values(categoryData);
  }

  private static generateColorPalette(formData: TravelFormData): ColorPalette[] {
    const palettes: Record<string, ColorPalette[]> = {
      'paris': [
        { hex: '#2C3E50', name: 'Parisian Night' },
        { hex: '#E8D5C4', name: 'Café Crème' },
        { hex: '#8B7355', name: 'Seine Stone' },
        { hex: '#C9A66B', name: 'Golden Hour' },
        { hex: '#4A5D6C', name: 'Eiffel Steel' },
      ],
      'tokyo': [
        { hex: '#FF6B9D', name: 'Cherry Blossom' },
        { hex: '#1A1A2E', name: 'Tokyo Night' },
        { hex: '#16213E', name: 'Shibuya Blue' },
        { hex: '#0F3460', name: 'Mount Fuji' },
        { hex: '#E94560', name: 'Neon Red' },
      ],
      'bali': [
        { hex: '#00B4D8', name: 'Ocean Blue' },
        { hex: '#90E0EF', name: 'Tropical Sky' },
        { hex: '#48CAE4', name: 'Beach Water' },
        { hex: '#023E8A', name: 'Deep Sea' },
        { hex: '#0077B6', name: 'Island Breeze' },
      ],
    };

    const key = formData.destination.toLowerCase();
    return palettes[key] || [
      { hex: '#667EEA', name: 'Primary' },
      { hex: '#764BA2', name: 'Secondary' },
      { hex: '#F093FB', name: 'Accent' },
      { hex: '#4FACFE', name: 'Sky' },
      { hex: '#00F2FE', name: 'Cyan' },
    ];
  }

  private static generateAttractions(formData: TravelFormData): Attraction[] {
    return [
      {
        id: generateId(),
        name: 'Historic City Center',
        description: 'Explore the heart of the city with its iconic landmarks and rich history.',
        duration: '3-4 hours',
        category: 'Culture',
      },
      {
        id: generateId(),
        name: 'Local Market Experience',
        description: 'Immerse yourself in local culture at the vibrant traditional market.',
        duration: '2-3 hours',
        category: 'Culture',
      },
      {
        id: generateId(),
        name: 'Scenic Viewpoint',
        description: 'Breathtaking panoramic views of the city and surrounding landscape.',
        duration: '1-2 hours',
        category: 'Nature',
      },
      {
        id: generateId(),
        name: 'Museum of Art & History',
        description: 'World-class collection showcasing local and international masterpieces.',
        duration: '2-3 hours',
        category: 'Culture',
      },
      {
        id: generateId(),
        name: 'Waterfront Promenade',
        description: 'Relaxing walk along the water with cafes and street performers.',
        duration: '1-2 hours',
        category: 'Leisure',
      },
      {
        id: generateId(),
        name: 'Adventure Park',
        description: 'Thrilling outdoor activities and nature experiences.',
        duration: '4-5 hours',
        category: 'Adventure',
      },
    ];
  }

  private static generateFoodRecommendations(formData: TravelFormData): FoodRecommendation[] {
    return [
      {
        id: generateId(),
        name: 'Traditional Local Dish',
        description: 'Authentic regional specialty passed down through generations.',
        significance: 'A cornerstone of local cuisine, representing cultural heritage.',
      },
      {
        id: generateId(),
        name: 'Street Food Favorite',
        description: 'Popular quick bite loved by locals and visitors alike.',
        significance: 'Represents the vibrant street food culture of the region.',
      },
      {
        id: generateId(),
        name: 'Signature Dessert',
        description: 'Sweet delicacy unique to this destination.',
        significance: 'Traditional recipe celebrating local ingredients.',
      },
      {
        id: generateId(),
        name: 'Seafood Specialty',
        description: 'Fresh catch prepared with local spices and techniques.',
        significance: 'Showcases the coastal culinary traditions.',
      },
      {
        id: generateId(),
        name: 'Vegetarian Delight',
        description: 'Plant-based dish bursting with local flavors.',
        significance: 'Reflects the diverse dietary traditions of the area.',
      },
    ];
  }

  private static generatePackingList(formData: TravelFormData): PackingItem[] {
    const baseItems: PackingItem[] = [
      { id: generateId(), item: 'Passport & Travel Documents', category: 'Essentials', checked: false },
      { id: generateId(), item: 'Phone & Charger', category: 'Electronics', checked: false },
      { id: generateId(), item: 'Credit Cards & Cash', category: 'Essentials', checked: false },
      { id: generateId(), item: 'Comfortable Walking Shoes', category: 'Clothing', checked: false },
      { id: generateId(), item: 'Weather-Appropriate Clothing', category: 'Clothing', checked: false },
      { id: generateId(), item: 'Toiletries & Medications', category: 'Personal Care', checked: false },
      { id: generateId(), item: 'Camera', category: 'Electronics', checked: false },
      { id: generateId(), item: 'Sunscreen & Sunglasses', category: 'Personal Care', checked: false },
      { id: generateId(), item: 'Reusable Water Bottle', category: 'Essentials', checked: false },
      { id: generateId(), item: 'Travel Adapter', category: 'Electronics', checked: false },
    ];

    // Add style-specific items
    if (formData.travelStyle === 'adventure') {
      baseItems.push(
        { id: generateId(), item: 'Hiking Boots', category: 'Clothing', checked: false },
        { id: generateId(), item: 'Backpack', category: 'Gear', checked: false },
        { id: generateId(), item: 'First Aid Kit', category: 'Safety', checked: false }
      );
    } else if (formData.travelStyle === 'luxury') {
      baseItems.push(
        { id: generateId(), item: 'Formal Attire', category: 'Clothing', checked: false },
        { id: generateId(), item: 'Jewelry & Accessories', category: 'Personal', checked: false }
      );
    } else if (formData.travelStyle === 'backpacking') {
      baseItems.push(
        { id: generateId(), item: 'Sleeping Bag', category: 'Gear', checked: false },
        { id: generateId(), item: 'Portable Charger', category: 'Electronics', checked: false }
      );
    }

    return baseItems;
  }

  private static generateItinerary(formData: TravelFormData): ItineraryDay[] {
    const days: ItineraryDay[] = [];
    
    for (let i = 1; i <= Math.min(formData.duration, 7); i++) {
      days.push({
        day: i,
        morning: `Start your day with breakfast at a local café, then explore the historic district and visit key landmarks.`,
        afternoon: `Enjoy lunch at a recommended restaurant, followed by a visit to museums or cultural sites.`,
        evening: `Experience the local nightlife, dine at a traditional restaurant, and take an evening stroll.`,
      });
    }

    return days;
  }

  private static generateInsights(formData: TravelFormData): TravelInsight[] {
    return [
      {
        title: 'Local Etiquette',
        icon: 'users',
        content: [
          'Greet locals with a smile and basic phrases in their language',
          'Dress modestly when visiting religious sites',
          'Tipping customs vary - research local expectations',
          'Ask permission before taking photos of people',
        ],
      },
      {
        title: 'Safety Tips',
        icon: 'shield',
        content: [
          'Keep copies of important documents in separate locations',
          'Use registered taxis or ride-sharing apps',
          'Stay aware of your surroundings in crowded areas',
          'Register with your embassy if staying long-term',
        ],
      },
      {
        title: 'Money-Saving Tips',
        icon: 'piggy-bank',
        content: [
          'Eat where locals eat for authentic and affordable meals',
          'Use public transportation instead of taxis',
          'Book attractions online in advance for discounts',
          'Visit free museums and attractions on designated days',
        ],
      },
      {
        title: 'Essential Phrases',
        icon: 'message-circle',
        content: [
          'Hello / Goodbye',
          'Thank you / Please',
          'How much does this cost?',
          'Where is...?',
          'I need help',
        ],
      },
    ];
  }
}
