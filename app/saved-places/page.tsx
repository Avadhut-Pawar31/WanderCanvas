'use client';

import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Heart, MapPin, Clock, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function SavedPlacesPage() {
  const router = useRouter();

  const savedPlaces = [
    {
      id: 1,
      name: 'Eiffel Tower',
      location: 'Paris, France',
      category: 'Landmark',
      savedDate: '2024-06-20',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
    },
    {
      id: 2,
      name: 'Shibuya Crossing',
      location: 'Tokyo, Japan',
      category: 'Urban Experience',
      savedDate: '2024-06-18',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
    },
    {
      id: 3,
      name: 'Santorini Caldera',
      location: 'Santorini, Greece',
      category: 'Natural Wonder',
      savedDate: '2024-06-15',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80',
    },
    {
      id: 4,
      name: 'Great Wall of China',
      location: 'Beijing, China',
      category: 'Historical Site',
      savedDate: '2024-06-12',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80',
    },
  ];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Saved Places</h1>
                  <p className="text-slate-400 mt-1">Your collection of favorite destinations</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Saved Places Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-rose-500/50 transition-all duration-300 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Heart Icon */}
                    <div className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg">
                      <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="space-y-2 flex-grow">
                      <div>
                        <h3 className="text-lg font-bold text-white">{place.name}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{place.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full">
                          {place.category}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                          <span>⭐</span>
                          <span>{place.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500 text-xs pt-2">
                        <Clock className="w-3 h-3" />
                        <span>Saved {place.savedDate}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 mt-4 border-t border-slate-700">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <button className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-red-600/50 text-white text-sm rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {savedPlaces.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Heart className="w-16 h-16 text-slate-700 mb-4" />
              <p className="text-slate-400 text-lg">No saved places yet</p>
              <p className="text-slate-500 text-sm">Explore destinations and save your favorites</p>
            </motion.div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default SavedPlacesPage;
