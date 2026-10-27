'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Heart, MapPin, Calendar, Share2, Trash2, Star, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface SavedPlace {
  id: number;
  name: string;
  location: string;
  category: string;
  savedDate: string;
  rating: number;
  image: string;
  description: string;
}

export default function SavedPlacesPage() {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([
    {
      id: 1,
      name: 'Eiffel Tower & Champ de Mars',
      location: 'Paris, France',
      category: 'Landmark',
      savedDate: 'June 20, 2026',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=85',
      description: 'Iconic wrought-iron lattice tower overlooking the Seine with verified accessible hygiene facilities.',
    },
    {
      id: 2,
      name: 'Shibuya Crossing & Miyashita Park',
      location: 'Tokyo, Japan',
      category: 'Urban Experience',
      savedDate: 'June 18, 2026',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=85',
      description: 'Vibrant Tokyo corridor featuring world-renowned clean public restrooms certified by The Tokyo Toilet Project.',
    },
    {
      id: 3,
      name: 'Santorini Caldera & Oia Cliffside',
      location: 'Santorini, Greece',
      category: 'Natural Wonder',
      savedDate: 'June 15, 2026',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=85',
      description: 'Whitewashed villages clinging to volcanic cliffs with boutique suites and Mediterranean dining.',
    },
    {
      id: 4,
      name: 'Mutianyu Great Wall',
      location: 'Beijing, China',
      category: 'Historical Site',
      savedDate: 'June 12, 2026',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=85',
      description: 'Well-preserved mountain ramparts surrounded by dense pine forests and modern visitor amenities.',
    },
  ]);

  const handleRemove = (id: number, name: string) => {
    setSavedPlaces(prev => prev.filter(p => p.id !== id));
    toast.success(`Removed ${name} from saved collection`);
  };

  const handleShare = (name: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success(`Share link for ${name} copied to clipboard!`);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#F7F5EF] text-[#292D2A] pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#244536]/10"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C78363]/10 border border-[#C78363]/20 mb-3">
                <Heart className="w-3.5 h-3.5 text-[#C78363] fill-[#C78363]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#C78363] font-semibold">
                  Personal Sanctuary
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#244536] tracking-tight">
                Saved Destinations
              </h1>
              <p className="text-sm sm:text-base text-[#292D2A]/70 mt-2 max-w-2xl leading-relaxed">
                Your curated catalog of memorable destinations, historic landmarks, and hygiene-verified waypoints saved for upcoming journeys.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/home">
                <Button className="bg-[#244536] text-white hover:bg-[#1B3529] rounded-xl px-5 gap-2 shadow-xs">
                  <Plus className="w-4 h-4" />
                  <span>Plan Journey</span>
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Empty State */}
          {savedPlaces.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#244536]/10 max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F7F5EF] text-[#C78363] flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#292D2A]">No Saved Places Yet</h3>
              <p className="text-sm text-[#292D2A]/70">
                Explore destinations and click the heart icon to save places for your future itineraries.
              </p>
              <Link href="/explore">
                <Button className="bg-[#244536] text-white hover:bg-[#1B3529] mt-2">
                  Browse Explore Catalog
                </Button>
              </Link>
            </div>
          ) : (
            /* Saved Places Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPlaces.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group bg-white rounded-2xl border border-[#244536]/10 hover:border-[#244536]/30 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image Cover */}
                    <div className="relative h-52 w-full overflow-hidden bg-[#E7ECE5]">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      {/* Heart Badge */}
                      <button
                        onClick={() => handleRemove(place.id, place.name)}
                        className="absolute top-3.5 right-3.5 p-2 bg-white/90 backdrop-blur-md rounded-xl text-[#C78363] hover:bg-white shadow-xs transition"
                        title="Remove from saved"
                      >
                        <Heart className="w-4 h-4 fill-[#C78363]" />
                      </button>

                      {/* Category Pill */}
                      <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#244536]/85 backdrop-blur-sm rounded-lg text-[11px] font-mono uppercase tracking-wider text-white font-medium">
                        {place.category}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-[#292D2A] group-hover:text-[#244536] transition-colors line-clamp-1">
                            {place.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[#292D2A]/60 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-[#C78363]" />
                            <span>{place.location}</span>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg border border-amber-200/60 text-amber-800 text-xs font-semibold flex-shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{place.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#292D2A]/70 line-clamp-2 leading-relaxed">
                        {place.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#292D2A]/50 pt-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Saved {place.savedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleShare(place.name)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#292D2A]/70 hover:text-[#244536] py-1.5 px-3 rounded-lg hover:bg-white border border-transparent hover:border-[#244536]/15 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/workspace/trip-amalfi-classic`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#244536] bg-[#244536]/8 hover:bg-[#244536] hover:text-white py-1.5 px-3 rounded-lg transition"
                      >
                        <span>Add to Route</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => handleRemove(place.id, place.name)}
                        className="p-1.5 rounded-lg text-[#292D2A]/40 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
