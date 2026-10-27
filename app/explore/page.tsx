'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, MapPin, TrendingUp, Star, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Destination {
  name: string;
  country: string;
  region: string;
  rating: number;
  reviews: number;
  category: string;
  image: string;
  description: string;
  highlights: string[];
}

export default function ExplorePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [savedNames, setSavedNames] = useState<string[]>([]);

  const categories = ['All', 'Coastal & Islands', 'Historic & Cultural', 'Urban & Design', 'Mountain Retreats'];

  const destinations: Destination[] = [
    {
      name: 'Amalfi & Ravello',
      country: 'Italy',
      region: 'Campania',
      rating: 4.9,
      reviews: 1420,
      category: 'Coastal & Islands',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=85',
      description: 'Precipitous cliffs meeting azure waters, terrace lemon groves, and five-star verified coastal hygiene rest stops.',
      highlights: ['SS163 Scenic Highway', 'Villa Rufolo', 'Certified Autogrills'],
    },
    {
      name: 'Kyoto & Uji',
      country: 'Japan',
      region: 'Kansai',
      rating: 4.9,
      reviews: 2150,
      category: 'Historic & Cultural',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=85',
      description: 'Ancient wooden shinto shrines, Zen rock gardens, match tea farms, and world-standard immaculate public amenities.',
      highlights: ['Fushimi Inari', 'Arashiyama Bamboo Grove', 'The Tokyo/Kyoto Toilet Cleanliness Standard'],
    },
    {
      name: 'Paris & Seine Valley',
      country: 'France',
      region: 'Île-de-France',
      rating: 4.8,
      reviews: 3890,
      category: 'Urban & Design',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=85',
      description: 'Haussmann boulevards, world-class galleries, artisan bakeries, and historic gardens along the riverbanks.',
      highlights: ['Louvre & Tuileries', 'Montmartre', 'Latin Quarter Bistros'],
    },
    {
      name: 'Bali & Nusa Islands',
      country: 'Indonesia',
      region: 'Lesser Sunda',
      rating: 4.7,
      reviews: 1840,
      category: 'Coastal & Islands',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=85',
      description: 'Lush inland jungle sanctuaries, sacred sea temples, surf breaks, and tranquil wellness resorts.',
      highlights: ['Ubud Rice Terraces', 'Uluwatu Cliffs', 'Sanur Beachwalk'],
    },
    {
      name: 'Swiss Alps & Zermatt',
      country: 'Switzerland',
      region: 'Valais',
      rating: 4.9,
      reviews: 980,
      category: 'Mountain Retreats',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85',
      description: 'Glacial panoramas surrounding the Matterhorn, cogwheel railways, and pristine alpine villages.',
      highlights: ['Gornergrat Railway', 'Sunnegga Lakes', 'Clean Mountain Springs'],
    },
    {
      name: 'New York & Hudson Valley',
      country: 'USA',
      region: 'New York',
      rating: 4.8,
      reviews: 4200,
      category: 'Urban & Design',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=85',
      description: 'Architectural marvels, Central Park tree-lined promenades, Broadway theaters, and scenic river trails.',
      highlights: ['High Line Promenade', 'Brooklyn Bridge', 'Hudson Valley Rail Trail'],
    },
  ];

  const filteredDestinations = selectedCategory === 'All'
    ? destinations
    : destinations.filter(d => d.category === selectedCategory);

  const toggleSave = (name: string) => {
    setSavedNames(prev => {
      const exists = prev.includes(name);
      if (exists) {
        toast.success(`Removed ${name} from saved`);
        return prev.filter(n => n !== name);
      } else {
        toast.success(`Saved ${name} to your collection!`);
        return [...prev, name];
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#292D2A] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 pb-6 border-b border-[#244536]/10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#244536]/8 border border-[#244536]/15 mb-3">
            <Compass className="w-3.5 h-3.5 text-[#244536]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold">
              Global Curations
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#244536] tracking-tight">
            Explore Destinations
          </h1>
          <p className="text-sm sm:text-base text-[#292D2A]/70 mt-2 max-w-2xl leading-relaxed">
            Discover verified travel corridors, cultural centers, and scenic coastlines vetted for journey comfort, accessibility, and hygiene evidence.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#244536] text-white font-semibold shadow-xs'
                    : 'bg-white text-[#292D2A]/70 border border-[#244536]/10 hover:text-[#244536] hover:bg-[#244536]/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Section Title */}
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-[#C78363]" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#292D2A]">
            Curated Corridors & Places
          </h2>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination, index) => {
            const isSaved = savedNames.includes(destination.name);
            return (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
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

                    {/* Category */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#244536]/85 backdrop-blur-sm rounded-lg text-[11px] font-mono uppercase tracking-wider text-white font-medium">
                      {destination.category}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-[#292D2A] group-hover:text-[#244536] transition-colors">
                          {destination.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-[#292D2A]/60 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C78363]" />
                          <span>{destination.country} • {destination.region}</span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200/60 text-amber-800 text-xs font-semibold flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{destination.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#292D2A]/70 line-clamp-2 leading-relaxed">
                      {destination.description}
                    </p>

                    {/* Highlights */}
                    <div className="pt-2 border-t border-[#244536]/8 flex flex-wrap gap-1.5">
                      {destination.highlights.map(h => (
                        <span key={h} className="text-[11px] px-2 py-0.5 bg-[#F7F5EF] text-[#244536] rounded-md font-mono">
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
                    <span>Plan Journey</span>
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
