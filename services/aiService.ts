import { 
  TravelFormData, 
  TravelBoard, 
  DestinationData, 
  MoodBoardImage, 
  ColorPalette, 
  Attraction, 
  FoodRecommendation, 
  PackingItem, 
  ItineraryDay, 
  TravelInsight, 
  CategoryDetails 
} from '@/types';
import { generateId, resetIdCounter } from '@/lib/utils';
import { resolveDestinationKnowledge } from '@/data/destinationKnowledge';

export class AIService {
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async generateTravelBoard(formData: TravelFormData): Promise<TravelBoard> {
    // Reset ID counter for deterministic IDs
    resetIdCounter();
    
    // Simulate natural AI thinking time
    await this.delay(600);

    const profile = resolveDestinationKnowledge(formData.destination);

    const destination: DestinationData = {
      ...profile.destination,
      dailyBudget: Math.round(formData.budget / Math.max(formData.duration, 1)),
    };
    
    const moodBoard = this.generateMoodBoard(formData, profile.categoryDetails);
    const categoryDetails = Object.values(profile.categoryDetails);
    const colorPalette = profile.colorPalette;
    const attractions = profile.attractions;
    const foodRecommendations = profile.foodRecommendations;
    const packingList = this.generatePackingList(formData, destination);
    const itinerary = this.generateItinerary(formData, attractions, foodRecommendations);
    const insights = this.generateInsights(formData, destination);

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

  private static generateMoodBoard(
    formData: TravelFormData, 
    categories: Record<string, CategoryDetails>
  ): MoodBoardImage[] {
    const categoryKeys = ['nature', 'food', 'architecture', 'beaches', 'culture', 'cafes', 'adventure', 'nightlife'];
    
    return categoryKeys.map((category) => {
      const catDetail = categories[category];
      return {
        id: generateId(),
        url: catDetail?.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
        category,
        alt: `${formData.destination} ${category}`,
      };
    });
  }

  private static generatePackingList(formData: TravelFormData, destination: DestinationData): PackingItem[] {
    const isCold = /antarctica|spiti|matterhorn|zermatt|himalaya|alps/i.test(destination.name + destination.weather);
    const isTropical = /bali|goa|amalfi|thailand|indonesia|beach/i.test(destination.name + destination.weather);

    const baseItems: PackingItem[] = [
      { id: generateId(), item: 'Passport & Essential Travel Documents', category: 'Essentials', checked: false },
      { id: generateId(), item: 'Universal Power Adapter & Cable Kit', category: 'Electronics', checked: false },
      { id: generateId(), item: 'Cards & Local Currency Reserves', category: 'Essentials', checked: false },
      { id: generateId(), item: 'Comfortable Vibram-Sole Walking Shoes', category: 'Clothing', checked: false },
      { id: generateId(), item: 'Personal First-Aid & Essential Medications', category: 'Personal Care', checked: false },
      { id: generateId(), item: 'High-SPF Sunscreen & UV Sunglasses', category: 'Personal Care', checked: false },
      { id: generateId(), item: 'Reusable Insulated Water Bottle', category: 'Essentials', checked: false },
      { id: generateId(), item: 'Compact High-Capacity Power Bank', category: 'Electronics', checked: false },
    ];

    if (isCold) {
      baseItems.push(
        { id: generateId(), item: 'Thermal Base Layers (Merino Wool)', category: 'Clothing', checked: false },
        { id: generateId(), item: 'Waterproof Gore-Tex Windbreaker Jacket', category: 'Clothing', checked: false },
        { id: generateId(), item: 'Insulated Touchscreen Gloves & Beanie', category: 'Clothing', checked: false },
        { id: generateId(), item: 'Moisturizing Lip Balm & Cold Cream', category: 'Personal Care', checked: false }
      );
    } else if (isTropical) {
      baseItems.push(
        { id: generateId(), item: 'Breathable Linen Shirts & Shorts', category: 'Clothing', checked: false },
        { id: generateId(), item: 'Quick-Dry Swimwear & Microfiber Towel', category: 'Clothing', checked: false },
        { id: generateId(), item: 'Natural Mosquito & Insect Repellent', category: 'Personal Care', checked: false },
        { id: generateId(), item: 'Waterproof Phone Dry Bag Pouch', category: 'Gear', checked: false }
      );
    } else {
      baseItems.push(
        { id: generateId(), item: 'Light Layering Cardigan / Light Jacket', category: 'Clothing', checked: false },
        { id: generateId(), item: 'Compact Foldable Travel Umbrella', category: 'Gear', checked: false }
      );
    }

    if (formData.travelStyle === 'adventure') {
      baseItems.push(
        { id: generateId(), item: 'Ankle-Support Waterproof Trail Boots', category: 'Clothing', checked: false },
        { id: generateId(), item: '25L Ergonomic Daypack with Rain Cover', category: 'Gear', checked: false },
        { id: generateId(), item: 'Electrolyte Hydration Tablets', category: 'Personal Care', checked: false }
      );
    } else if (formData.travelStyle === 'luxury') {
      baseItems.push(
        { id: generateId(), item: 'Smart Casual / Evening Attire for Fine Dining', category: 'Clothing', checked: false },
        { id: generateId(), item: 'Wrinkle-Release Fabric Spray', category: 'Personal Care', checked: false }
      );
    }

    return baseItems;
  }

  private static generateItinerary(
    formData: TravelFormData, 
    attractions: Attraction[], 
    foods: FoodRecommendation[]
  ): ItineraryDay[] {
    const days: ItineraryDay[] = [];
    const numDays = Math.min(formData.duration || 3, 7);

    const destName = formData.destination || 'Destination';

    const safeAttractions: Attraction[] = (attractions && attractions.length > 0) ? attractions : [
      {
        id: generateId(),
        name: `${destName} Historic Quarter & Heritage Trail`,
        description: 'Explore preserved historic core, regional architecture, and local artisan shops',
        duration: '2-3 hours',
        category: 'Culture',
      },
      {
        id: generateId(),
        name: `${destName} Scenic Overlook & Waterfront Promenade`,
        description: 'Panoramic viewpoints and scenic walking trails',
        duration: '2 hours',
        category: 'Nature',
      },
    ];

    const safeFoods: FoodRecommendation[] = (foods && foods.length > 0) ? foods : [
      {
        id: generateId(),
        name: `${destName} Authentic Slow-Cooked Specialty`,
        description: 'Traditional regional recipe made with locally sourced farm ingredients',
        significance: 'Generational culinary staple passed down through families',
      },
      {
        id: generateId(),
        name: `${destName} Market Street Specialty & Artisan Pastry`,
        description: 'Freshly prepared savory bites and regional delicacies',
        significance: 'Everyday street food loved by locals',
      },
    ];

    for (let i = 1; i <= numDays; i++) {
      const attractionA = safeAttractions[(i * 2 - 2) % safeAttractions.length] || safeAttractions[0];
      const attractionB = safeAttractions[(i * 2 - 1) % safeAttractions.length] || safeAttractions[safeAttractions.length - 1] || safeAttractions[0];
      const foodItem = safeFoods[(i - 1) % safeFoods.length] || safeFoods[0];

      const aName = attractionA?.name || `${destName} Landmark`;
      const aDuration = attractionA?.duration || '2 hours';
      const bName = attractionB?.name || `${destName} Viewpoint`;
      const bDuration = attractionB?.duration || '2 hours';
      const fName = foodItem?.name || `${destName} Regional Specialty`;

      days.push({
        day: i,
        morning: `Commence with morning coffee and pastries, followed by a visit to ${aName} (${aDuration}).`,
        afternoon: `Savor an authentic lunch featuring ${fName}, followed by exploring ${bName} (${bDuration}).`,
        evening: `Golden hour sunset stroll along scenic viewpoints, followed by evening dinner and regional dessert.`,
      });
    }

    return days;
  }

  private static generateInsights(formData: TravelFormData, destination: DestinationData): TravelInsight[] {
    const isAntarctica = /antarctica/i.test(destination.name);
    const isIndia = /india|spiti|jaipur|udaipur|kerala|goa/i.test(destination.name);
    const isJapan = /kyoto|tokyo|japan/i.test(destination.name);
    const isItaly = /amalfi|italy|campania/i.test(destination.name);
    const isIndonesia = /bali|indonesia|komodo/i.test(destination.name);

    if (isAntarctica) {
      return [
        {
          title: 'IAATO Environmental Guidelines',
          icon: 'shield',
          content: [
            'Maintain a strict 5-meter distance from penguins and marine wildlife at all times',
            'Thoroughly biosecure boots and clothing in Virkon disinfectant wash before and after every landing',
            'Take nothing but photographs, leave nothing but footprints in the snow',
            'Never leave any equipment, food, or gear unattended on shore',
          ],
        },
        {
          title: 'Polar Navigation & Clothing Protocol',
          icon: 'users',
          content: [
            'Dress in three breathable layers: moisture-wicking wool base, fleece mid-layer, and waterproof shell',
            'Wear high muck boots with thick wool socks for wet zodiac beach landings',
            'Secure cameras and phones with wrist leashes to prevent accidental loss into the icy ocean',
            'Keep spare camera batteries warm in interior pockets as sub-zero cold drains charge rapidly',
          ],
        },
        {
          title: 'Drake Passage Sea Preparedness',
          icon: 'piggy-bank',
          content: [
            'Consult the ship medical doctor for seasickness patches or medication before hitting open waters',
            'Always maintain three points of contact when moving around the vessel during heavy swells',
            'Store all loose cabin items securely in drawers or latch locks before sleeping',
            'Take advantage of early breakfast broths to settle equilibrium during sea transit',
          ],
        },
        {
          title: 'Polar Expedition Terminology',
          icon: 'message-circle',
          content: [
            'Zodiac: Heavy-duty inflatable motorized launch used for iceberg cruising and shore landings',
            'Brash Ice: Accumulation of floating ice fragments less than 2 meters across',
            'Bergy Bit: Large chunk of floating glacier ice rising 1 to 5 meters above sea level',
            'Calving: The dramatic breaking off of massive ice masses from glacier faces into the sea',
          ],
        },
      ];
    }

    if (isItaly) {
      return [
        {
          title: 'Amalfi Coast Etiquette & Dining',
          icon: 'users',
          content: [
            'Order cappuccino only in the morning before 11:00 AM; drink espresso (caffè) after meals',
            'Coperto is a standard bread and table charge (typically €2-€4 per person) on your bill',
            'Dress elegantly for evening dinners in coastal trattorias and seaside restaurants',
            'Greet shopkeepers and restaurant hosts with "Buongiorno" or "Buonasera"',
          ],
        },
        {
          title: 'Highway & Transit Navigation',
          icon: 'shield',
          content: [
            'Use SITA coastal buses or passenger ferries (Travelmar) to avoid extreme parking fees and hairpin road congestion',
            'Be prepared for narrow vertical stone staircases; wear sturdy walking shoes with rubber grip',
            'Verify ferry schedules during high swells as morning sea conditions determine docking',
            'Reserve dinner and clifftop sunset tables at least 24 to 48 hours in advance during peak season',
          ],
        },
        {
          title: 'Terroir & Savoring Secrets',
          icon: 'piggy-bank',
          content: [
            'Look for IGP and DOP certified Sorrento lemons, Cetara colatura, and Gragnano pasta',
            'Take the water ferry between Amalfi and Positano for the world’s finest cliffside perspective',
            'Purchase ceramics directly from artisan ateliers in Vietri sul Mare for authentic handcrafts',
            'Drink cold Limoncello served in frozen ceramic copitas as a digestive after seafood dinners',
          ],
        },
        {
          title: 'Helpful Italian Phrases',
          icon: 'message-circle',
          content: [
            'Un caffè per favore (An espresso, please)',
            'Il conto per favore (The check, please)',
            'Dov\'è la fermata dell\'autobus? (Where is the bus stop?)',
            'Grazie mille / Buona giornata (Thank you very much / Have a nice day)',
          ],
        },
      ];
    }

    if (isIndia) {
      return [
        {
          title: 'Himalayan & Regional Cultural Respect',
          icon: 'users',
          content: [
            'Always walk clockwise (Pradakshina) around Buddhist chortens, stupas, and monastery prayer wheels',
            'Remove shoes before entering monastery prayer halls (dukhang) and Hindu temples',
            'Never point your feet or soles towards altars, lamas, or sacred statues while seated',
            'Ask polite permission before photographing local residents or monk ceremonies',
          ],
        },
        {
          title: 'High-Altitude & Highway Preparedness',
          icon: 'shield',
          content: [
            'Acclimatize for at least 48 hours when ascending above 3,000 meters; drink 3-4 liters of water daily',
            'Avoid heavy physical exertion on Day 1; sip local warm seabuckthorn tea or ginger water',
            'Carry cash as mountain ATMs in remote high-altitude corridors frequently experience power outages',
            'Download offline maps and keep a physical photocopy of identification documents for border checkposts',
          ],
        },
        {
          title: 'Sustainable Himalayan Travel',
          icon: 'piggy-bank',
          content: [
            'Refill purified water at local eco-centers rather than purchasing single-use plastic bottles',
            'Eat at family-run local dhabas and homestays to support the mountain village economy directly',
            'Pack out all non-biodegradable waste from remote lakes like Chandratal',
            'Respect mountain pass prayer flags (lungta) by not stepping on or removing them',
          ],
        },
        {
          title: 'Helpful Local Greetings',
          icon: 'message-circle',
          content: [
            'Julley! (Hello / Goodbye / Thank you in Himalayan regions)',
            'Namaste (Traditional respectful Indian greeting)',
            'Kripya (Please)',
            'Yeh kitne ka hai? (How much is this?)',
          ],
        },
      ];
    }

    if (isJapan) {
      return [
        {
          title: 'Japanese Customs & Etiquette',
          icon: 'users',
          content: [
            'Bow politely when greeting; avoid tipping as exceptional service is standard and tips can cause confusion',
            'Remove your shoes when stepping onto tatami mats or entering traditional ryokans',
            'Never stick chopsticks vertically into a bowl of rice, as this resembles a Buddhist funeral rite',
            'Speak in quiet tones on trains and public transportation; refrain from phone conversations',
          ],
        },
        {
          title: 'Smooth Transit & Daily Habits',
          icon: 'shield',
          content: [
            'Load a Suica or Pasmo digital transit card on your phone for seamless subway and bus tap-and-go',
            'Public trash cans are rare; carry a small bag to hold your personal rubbish until you return to your hotel',
            'Carry cash (Japanese Yen) as many historic temples, shrines, and traditional soba shops do not accept cards',
            'Wash and rinse thoroughly at the sit-down washing station before stepping into an onsen hot spring bath',
          ],
        },
        {
          title: 'Culinary & Shopping Secrets',
          icon: 'piggy-bank',
          content: [
            'Department store basement food halls (depachika) offer world-class gourmet bento boxes at evening discounts',
            'Slurping ramen and soba noodles is encouraged—it aerates the broth and signals appreciation to the chef',
            'Visit popular shrines like Fushimi Inari at dawn (6:30 AM) to experience the torii gates in serene tranquility',
            'Always receive and present money or business cards with both hands as a mark of respect',
          ],
        },
        {
          title: 'Essential Japanese Phrases',
          icon: 'message-circle',
          content: [
            'Arigatou gozaimasu (Thank you very much)',
            'Sumimasen (Excuse me / Sorry)',
            'Kore o kudasai (Please give me this)',
            'O-kaikei o onegaishimasu (The bill, please)',
          ],
        },
      ];
    }

    if (isIndonesia) {
      return [
        {
          title: 'Balinese Hindu & Island Etiquette',
          icon: 'users',
          content: [
            'Wear a sarong and sash when entering any temple complex; both men and women must cover their shoulders and knees',
            'Be mindful not to step on small coconut-leaf flower offerings (Canang Sari) placed on sidewalks and doorsteps',
            'Always use your right hand when giving or receiving items, money, or food',
            'Never touch anyone on the head, as it is considered the most sacred part of the body in Balinese belief',
          ],
        },
        {
          title: 'Island Health & Transport Tips',
          icon: 'shield',
          content: [
            'Drink only bottled or filtered water; avoid tap water and stay well-hydrated in the tropical climate',
            'Wear a certified helmet if renting a scooter, and verify you hold an International Driving Permit (IDP)',
            'Secure sunglasses, hats, and loose jewelry before entering the Monkey Forest as macaques can snatch shiny objects',
            'Use reputable blue-metered taxis (Bluebird) or Grab apps for transparent pricing',
          ],
        },
        {
          title: 'Local Craft & Market Traditions',
          icon: 'piggy-bank',
          content: [
            'Bargaining is expected at traditional outdoor markets (like Sukawati or Ubud Market); negotiate with a smile and warmth',
            'Support local organic warungs for the freshest traditional meals at a fraction of tourist restaurant prices',
            'Arrive at Uluwatu Temple by 4:45 PM to secure good stadium seats for the famous 6:00 PM sunset Kecak dance',
            'Tip around 5-10% at independent cafes and restaurants if a service charge is not already included on the bill',
          ],
        },
        {
          title: 'Helpful Indonesian Phrases',
          icon: 'message-circle',
          content: [
            'Terima kasih (Thank you)',
            'Sama-sama (You are welcome)',
            'Berapa harganya? (How much does this cost?)',
            'Tolong (Please / Help)',
          ],
        },
      ];
    }

    // Default global insights
    return [
      {
        title: 'Cultural Etiquette',
        icon: 'users',
        content: [
          'Greet locals respectfully and learn basic courteous greetings in the local language',
          'Dress appropriately and modestly when visiting religious sites and traditional sanctuaries',
          'Ask permission before photographing residents, artisans, and sacred ceremonies',
          'Observe local tipping customs and service standards',
        ],
      },
      {
        title: 'Travel Safety & Preparedness',
        icon: 'shield',
        content: [
          'Store digital copies of passports, visas, and insurance cards in secure cloud backup',
          'Use licensed, registered public transit or vetted ride-hailing services',
          'Keep emergency contact numbers and local embassy information readily accessible',
          'Maintain situational awareness in bustling tourist centers and transportation hubs',
        ],
      },
      {
        title: 'Budget & Terroir Secrets',
        icon: 'piggy-bank',
        content: [
          'Dine where local residents and neighborhood workers eat for authentic culinary discovery',
          'Book premier museum and archaeological site permits in advance to avoid long ticket lines',
          'Utilize regional rail and public transit passes for cost-efficient transportation',
          'Shop at traditional farmers markets for fresh seasonal fruits and artisanal provisions',
        ],
      },
      {
        title: 'Essential Universal Phrases',
        icon: 'message-circle',
        content: [
          'Hello / Good day',
          'Thank you very much / Please',
          'Where is the station / entrance?',
          'How much is this, please?',
        ],
      },
    ];
  }
}
