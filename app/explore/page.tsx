'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, TrendingUp, Star, ArrowRight, Heart, Search, ShieldCheck, Sparkles, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Destination {
  name: string;
  state: string;
  region: string;
  macroRegion: 'Western Ghats & Konkan' | 'Himalayas & Valleys' | 'Kerala & Southern Trails' | 'Rajasthan & Heritage' | 'Northeast & Living Roots';
  rating: number;
  reviews: number;
  category: 'Coastal & Beaches' | 'Mountain Passes' | 'Heritage & Forts' | 'Eco & Cleanest Villages' | 'Tea & Spice Plantations';
  hygieneScore: number;
  hygieneStatus: string;
  bestSeason: string;
  image: string;
  description: string;
  highlights: string[];
}

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMacroRegion, setSelectedMacroRegion] = useState<string>('All India');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [savedNames, setSavedNames] = useState<string[]>([]);

  const macroRegions = [
    'All India',
    'Western Ghats & Konkan',
    'Himalayas & Valleys',
    'Kerala & Southern Trails',
    'Rajasthan & Heritage',
    'Northeast & Living Roots',
  ];

  const categories = [
    'All',
    'Coastal & Beaches',
    'Mountain Passes',
    'Heritage & Forts',
    'Eco & Cleanest Villages',
    'Tea & Spice Plantations',
  ];

  const destinations: Destination[] = [
    {
      name: 'Alibaug & Kashid Coastal Corridor',
      state: 'Maharashtra',
      region: 'Konkan Coastline',
      macroRegion: 'Western Ghats & Konkan',
      rating: 4.8,
      reviews: 2410,
      category: 'Coastal & Beaches',
      hygieneScore: 94,
      hygieneStatus: 'Audited Beach Amenities',
      bestSeason: 'Oct - March',
      image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=85',
      description: 'Pristine coastal drive from Mumbai/Pune along swaying betel nut orchards, sea-fort Kolaba, and inspected highway restroom plazas.',
      highlights: ['Revdanda Beach', 'Murud Janjira Sea Fort', 'Fresh Coastal Kokum Stalls'],
    },
    {
      name: 'Mahabaleshwar & Kaas Plateau',
      state: 'Maharashtra',
      region: 'Western Ghats (Sahyadri)',
      macroRegion: 'Western Ghats & Konkan',
      rating: 4.9,
      reviews: 3120,
      category: 'Mountain Passes',
      hygieneScore: 96,
      hygieneStatus: 'Officially Inspected Hill Plazas',
      bestSeason: 'Aug - Feb',
      image: 'https://images.unsplash.com/photo-1626014303757-646654271373?w=800&q=85',
      description: 'Misty plateau ridges, strawberry garden trails, and UNESCO World Natural Heritage flower carpets with verified rest stops on Pasarni Ghat.',
      highlights: ['Kaas Valley of Flowers', 'Arthur Seat Ridge', 'Venna Lake Walkways'],
    },
    {
      name: 'Lonavala, Khandala & Duke’s Nose',
      state: 'Maharashtra',
      region: 'Sahyadri Corridor',
      macroRegion: 'Western Ghats & Konkan',
      rating: 4.7,
      reviews: 4200,
      category: 'Mountain Passes',
      hygieneScore: 92,
      hygieneStatus: 'Verified Expressway Amenities',
      bestSeason: 'July - Feb',
      image: 'https://images.unsplash.com/photo-1609137144822-261546b3f71c?w=800&q=85',
      description: 'Famous Mumbai-Pune expressway mountain route with heritage Buddhist rock-cut caves, waterfall viewpoints, and ISO-certified food courts.',
      highlights: ['Karla & Bhaja Caves', 'Rajmachi Fort View', 'Expressway Food Plazas'],
    },
    {
      name: 'South Goa & Palolem Sanctuary',
      state: 'Goa',
      region: 'Konkan Coastal Belt',
      macroRegion: 'Western Ghats & Konkan',
      rating: 4.9,
      reviews: 3840,
      category: 'Coastal & Beaches',
      hygieneScore: 95,
      hygieneStatus: 'High Sanitation Standards',
      bestSeason: 'Nov - April',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=85',
      description: 'Crescent-shaped serene golden sands, eco-beach huts, spice plantations, and immaculately maintained coastal boutique cafes.',
      highlights: ['Palolem & Butterfly Beach', 'Cotigao Wildlife Sanctuary', 'Portuguese Heritage Villas'],
    },
    {
      name: 'Spiti Valley & Kaza High Pass',
      state: 'Himachal Pradesh',
      region: 'Trans-Himalayan Cold Desert',
      macroRegion: 'Himalayas & Valleys',
      rating: 4.9,
      reviews: 1650,
      category: 'Mountain Passes',
      hygieneScore: 90,
      hygieneStatus: 'Eco-Community Verified',
      bestSeason: 'May - Oct',
      image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800&q=85',
      description: 'Dramatic high-altitude mountain desert roads, ancient millennium-old Key Monastery, and pristine high-altitude fossil villages.',
      highlights: ['Key Gompa', 'Chicham Highest Suspension Bridge', 'Chandratal Moon Lake'],
    },
    {
      name: 'Manali to Solang & Rohtang Corridor',
      state: 'Himachal Pradesh',
      region: 'Kullu Valley',
      macroRegion: 'Himalayas & Valleys',
      rating: 4.8,
      reviews: 4500,
      category: 'Mountain Passes',
      hygieneScore: 93,
      hygieneStatus: 'BRO & Highway Verified',
      bestSeason: 'Sept - June',
      image: 'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?w=800&q=85',
      description: 'Snow-capped Pir Panjal peaks, cedar forests along the Beas River, Atal Tunnel marvel, and audited highway rest points.',
      highlights: ['Atal Tunnel Corridor', 'Old Manali Apple Orchards', 'Solang Valley Adventure'],
    },
    {
      name: 'Rishikesh to Devprayag Sangam',
      state: 'Uttarakhand',
      region: 'Garhwal Himalayas',
      macroRegion: 'Himalayas & Valleys',
      rating: 4.9,
      reviews: 3200,
      category: 'Mountain Passes',
      hygieneScore: 94,
      hygieneStatus: 'Clean Ganga Mission Verified',
      bestSeason: 'Sept - April',
      image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=85',
      description: 'Emerald holy rivers cutting through Himalayan foothills, yoga ashrams, suspension bridges, and eco-certified riverside retreats.',
      highlights: ['Laxman Jhula Promenade', 'Devprayag River Confluence', 'Beatles Ashram'],
    },
    {
      name: 'Mawlynnong & Living Root Bridges',
      state: 'Meghalaya',
      region: 'East Khasi Hills',
      macroRegion: 'Northeast & Living Roots',
      rating: 5.0,
      reviews: 1980,
      category: 'Eco & Cleanest Villages',
      hygieneScore: 100,
      hygieneStatus: 'Declared Asia’s Cleanest Village',
      bestSeason: 'Sept - May',
      image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=85',
      description: 'Celebrated as Asia’s cleanest village with 100% bamboo dustbins, living root bridges woven from rubber trees, and pristine crystal streams.',
      highlights: ['Single Living Root Bridge', 'Umngot River at Dawki', 'Balancing Rock Wonder'],
    },
    {
      name: 'Alleppey & Vembanad Backwaters',
      state: 'Kerala',
      region: 'Kuttanad Waterways',
      macroRegion: 'Kerala & Southern Trails',
      rating: 4.9,
      reviews: 4100,
      category: 'Coastal & Beaches',
      hygieneScore: 97,
      hygieneStatus: 'Kerala Tourism Gold Audited',
      bestSeason: 'Sept - March',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=85',
      description: 'Labyrinth of palm-fringed canals, eco houseboats with private certified chefs, and village homestays serving warm banana leaf feasts.',
      highlights: ['Luxury Houseboat Cruises', 'Punnamada Lake Regatta', 'Marari Fishermen Beach'],
    },
    {
      name: 'Munnar & Anamalai Tea Estates',
      state: 'Kerala',
      region: 'Idukki Western Ghats',
      macroRegion: 'Kerala & Southern Trails',
      rating: 4.9,
      reviews: 3600,
      category: 'Tea & Spice Plantations',
      hygieneScore: 96,
      hygieneStatus: 'Estate Hygiene Certified',
      bestSeason: 'Aug - May',
      image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=800&q=85',
      description: 'Endless rolling emerald carpet hills, crisp mountain air, cardamom spice gardens, and colonial tea factory museums.',
      highlights: ['Kolukkumalai Sunrise (World Highest Tea Estate)', 'Eravikulam Tahr Sanctuary', 'Mattupetty Dam'],
    },
    {
      name: 'Coorg & Madikeri Coffee Trails',
      state: 'Karnataka',
      region: 'Kodagu Highlands',
      macroRegion: 'Kerala & Southern Trails',
      rating: 4.8,
      reviews: 2890,
      category: 'Tea & Spice Plantations',
      hygieneScore: 95,
      hygieneStatus: 'High Cleanliness Standards',
      bestSeason: 'Oct - April',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=85',
      description: 'Aromatic Arabica and Robusta plantations, cascading Abbey Falls, Tibetan settlement in Bylakuppe, and Kodava hospitality.',
      highlights: ['Namdroling Golden Temple', 'Abbey Falls Gorge', 'Raja’s Seat Sunset View'],
    },
    {
      name: 'Udaipur & Mewar Lake Corridors',
      state: 'Rajasthan',
      region: 'Mewar Kingdom',
      macroRegion: 'Rajasthan & Heritage',
      rating: 4.9,
      reviews: 4800,
      category: 'Heritage & Forts',
      hygieneScore: 96,
      hygieneStatus: 'Heritage Hotel Hygiene Guild',
      bestSeason: 'Oct - March',
      image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&q=85',
      description: 'City of Lakes boasting floating marble palaces, historic City Palace courtyards, and scenic Aravali mountain highway approaches.',
      highlights: ['City Palace Complex', 'Lake Pichola Boat Promenade', 'Sajjangarh Monsoon Palace'],
    },
    {
      name: 'Jaipur & Amber Fort Royal Ridge',
      state: 'Rajasthan',
      region: 'Dhundhar Corridor',
      macroRegion: 'Rajasthan & Heritage',
      rating: 4.8,
      reviews: 5200,
      category: 'Heritage & Forts',
      hygieneScore: 94,
      hygieneStatus: 'Smart City Verified',
      bestSeason: 'Oct - March',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=85',
      description: 'The UNESCO Pink City with sandstone palaces, astronomical observatory Jantar Mantar, and hilltop fortifications overlooking Maota Lake.',
      highlights: ['Amber Fort Mirrors Gallery', 'Hawa Mahal Windows', 'Nahargarh Sunset Ridge'],
    },
    {
      name: 'Hampi Vijayanagara Empire Ruins',
      state: 'Karnataka',
      region: 'Tungabhadra Valley',
      macroRegion: 'Rajasthan & Heritage',
      rating: 4.9,
      reviews: 2950,
      category: 'Heritage & Forts',
      hygieneScore: 93,
      hygieneStatus: 'ASI & UNESCO Maintained',
      bestSeason: 'Oct - March',
      image: 'https://images.unsplash.com/photo-1600100397608-f010f4439c2c?w=800&q=85',
      description: 'Surreal boulder-strewn landscape hosting the 14th-century capital of the Vijayanagara Empire along the ancient Tungabhadra River.',
      highlights: ['Stone Chariot at Vittala Temple', 'Virupaksha Temple', 'Matanga Hill Sunrise'],
    },
    {
      name: 'Gokarna & Kudle Coastal Trail',
      state: 'Karnataka',
      region: 'Uttara Kannada',
      macroRegion: 'Western Ghats & Konkan',
      rating: 4.8,
      reviews: 2150,
      category: 'Coastal & Beaches',
      hygieneScore: 93,
      hygieneStatus: 'Clean Coastline Certified',
      bestSeason: 'Oct - March',
      image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=85',
      description: 'Cliffside coastal hiking paths linking secluded beaches shaped like the sacred Om symbol, offering peaceful coastal cafes.',
      highlights: ['Om Beach Viewpoint', 'Half Moon Beach Cliff Hike', 'Mahabaleshwar Temple Shrine'],
    },
  ];

  // Real-time multi-dimensional filter
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      // 1. Text search across name, state, region, description, highlights
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = dest.name.toLowerCase().includes(q);
        const matchesState = dest.state.toLowerCase().includes(q);
        const matchesRegion = dest.region.toLowerCase().includes(q);
        const matchesDesc = dest.description.toLowerCase().includes(q);
        const matchesHighlight = dest.highlights.some(h => h.toLowerCase().includes(q));

        if (!matchesName && !matchesState && !matchesRegion && !matchesDesc && !matchesHighlight) {
          return false;
        }
      }

      // 2. Macro Region Filter
      if (selectedMacroRegion !== 'All India' && dest.macroRegion !== selectedMacroRegion) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'All' && dest.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedMacroRegion, selectedCategory, destinations]);

  const toggleSave = (name: string) => {
    const exists = savedNames.includes(name);
    if (exists) {
      setSavedNames((prev) => prev.filter((n) => n !== name));
      toast.success(`Removed ${name} from saved`);
    } else {
      setSavedNames((prev) => [...prev, name]);
      toast.success(`Saved ${name} to your collection!`);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#292D2A] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 pb-6 border-b border-[#244536]/10"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#244536]/10 border border-[#244536]/15">
              <Compass className="w-3.5 h-3.5 text-[#244536]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold">
                Incredible India Corridors &amp; Local Regions
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#244536]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Regional Registry ({filteredDestinations.length} available)</span>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#244536] tracking-tight">
            Explore Indian Destinations &amp; Hidden Circuits
          </h1>
          <p className="text-sm sm:text-base text-[#292D2A]/70 mt-2 max-w-3xl leading-relaxed">
            From the misty Western Ghats and Konkan coastline of Maharashtra to the high Himalayan passes, royal Mewar palaces, and Asia’s cleanest eco-villages. All vetted with verified travel and hygiene intelligence.
          </p>

          {/* Real-Time Live Search Bar */}
          <div className="mt-6 relative max-w-2xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#244536]/50 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by state (Maharashtra, Kerala, HP), region (Konkan, Ghats, Spiti), or place..."
              className="w-full pl-11 pr-10 py-3 bg-white rounded-2xl border border-[#244536]/20 text-sm text-[#292D2A] placeholder:text-[#5F6761]/60 focus:outline-hidden focus:border-[#244536] focus:ring-2 focus:ring-[#244536]/15 transition shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#5F6761]/60 hover:text-[#292D2A]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Macro Region Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 scrollbar-none">
            {macroRegions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedMacroRegion(region)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedMacroRegion === region
                    ? 'bg-[#244536] text-white font-semibold shadow-xs'
                    : 'bg-white text-[#292D2A]/70 border border-[#244536]/10 hover:text-[#244536] hover:bg-[#244536]/5'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Sub-Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
            <span className="text-[11px] font-mono uppercase text-[#5F6761]/70 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#C78363] text-white font-semibold'
                    : 'bg-[#F0F3EF] text-[#244536] hover:bg-[#244536]/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Section Title & Live Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C78363]" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#292D2A]">
              {selectedMacroRegion === 'All India' ? 'Featured Indian Circuits' : selectedMacroRegion}
            </h2>
          </div>
          <span className="text-xs font-mono text-[#5F6761]">
            {filteredDestinations.length} {filteredDestinations.length === 1 ? 'place' : 'places'} found
          </span>
        </div>

        {/* Empty State */}
        {filteredDestinations.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#244536]/15 space-y-3">
            <Compass className="w-8 h-8 text-[#C78363] mx-auto animate-bounce" />
            <h3 className="font-serif text-lg font-medium text-[#244536]">No destinations matched your search</h3>
            <p className="text-xs text-[#5F6761] max-w-sm mx-auto">
              Try searching for &quot;Maharashtra&quot;, &quot;Konkan&quot;, &quot;Spiti&quot;, &quot;Kerala&quot;, or reset your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMacroRegion('All India');
                setSelectedCategory('All');
              }}
              className="mt-2 px-4 py-2 bg-[#244536] text-white rounded-xl text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination, index) => {
            const isSaved = savedNames.includes(destination.name);
            return (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group bg-white rounded-2xl border border-[#244536]/10 hover:border-[#244536]/30 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-56 w-full overflow-hidden bg-[#E7ECE5]">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Bookmark Heart */}
                    <button
                      onClick={() => toggleSave(destination.name)}
                      className="absolute top-3.5 right-3.5 p-2 bg-white/90 backdrop-blur-md rounded-xl text-[#292D2A]/60 hover:text-[#C78363] hover:bg-white shadow-xs transition"
                      title={isSaved ? 'Remove from saved' : 'Save destination'}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C78363] text-[#C78363]' : ''}`} />
                    </button>

                    {/* Category & State Tag */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-[#244536]/90 backdrop-blur-sm rounded-lg text-[10px] font-mono uppercase tracking-wider text-white font-medium">
                        {destination.category}
                      </span>
                      <span className="px-2 py-1 bg-[#C78363]/90 backdrop-blur-sm rounded-lg text-[10px] font-mono uppercase tracking-wider text-white font-medium">
                        {destination.state}
                      </span>
                    </div>

                    {/* Hygiene Score Pill */}
                    <div className="absolute top-3.5 left-3.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl border border-[#244536]/15 shadow-sm flex items-center gap-1 text-[11px] font-bold text-[#244536]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#244536]" />
                      <span>{destination.hygieneScore}/100</span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#292D2A] group-hover:text-[#244536] transition-colors line-clamp-1">
                          {destination.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-[#292D2A]/60 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C78363] shrink-0" />
                          <span className="truncate">{destination.region}, {destination.state}</span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-200/60 text-amber-800 text-xs font-semibold shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{destination.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#292D2A]/70 line-clamp-2 leading-relaxed">
                      {destination.description}
                    </p>

                    {/* Season & Verification Status */}
                    <div className="flex items-center justify-between text-[11px] pt-1 text-[#5F6761]">
                      <span>Best time: <strong className="text-[#244536]">{destination.bestSeason}</strong></span>
                      <span className="text-emerald-700 font-medium">✓ {destination.hygieneStatus}</span>
                    </div>

                    {/* Highlights */}
                    <div className="pt-2 border-t border-[#244536]/8 flex flex-wrap gap-1.5">
                      {destination.highlights.map((h) => (
                        <span key={h} className="text-[10px] px-2 py-0.5 bg-[#F7F5EF] text-[#244536] rounded-md font-mono">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-[#292D2A]/50 font-mono">
                    {destination.reviews.toLocaleString()} reviews
                  </div>

                  <Button
                    onClick={() => router.push(`/home?destination=${encodeURIComponent(destination.name)}`)}
                    className="bg-[#244536] text-white hover:bg-[#1B3529] rounded-xl px-4 py-1.5 text-xs font-medium gap-1.5 shadow-xs"
                  >
                    <span>Plan Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
