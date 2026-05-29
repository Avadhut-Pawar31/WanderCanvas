'use client';

import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Compass, MapPin, TrendingUp, Star } from 'lucide-react';

function ExplorePage() {
  const destinations = [
    { name: 'Paris', country: 'France', rating: 4.8, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80' },
    { name: 'Tokyo', country: 'Japan', rating: 4.9, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80' },
    { name: 'Bali', country: 'Indonesia', rating: 4.7, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80' },
    { name: 'Dubai', country: 'UAE', rating: 4.6, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80' },
    { name: 'London', country: 'UK', rating: 4.8, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80' },
    { name: 'New York', country: 'USA', rating: 4.9, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80' },
  ];

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Explore Destinations</h1>
              <p className="text-slate-400 mt-1">Discover amazing places around the world</p>
            </div>
          </div>
        </motion.div>

        {/* Trending Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-2xl font-semibold text-white">Trending Destinations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="group relative overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-700/50 hover:border-indigo-500/50 transition-all cursor-pointer"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{destination.name}</h3>
                      <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{destination.country}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">{destination.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl text-center"
        >
          <h3 className="text-2xl font-semibold text-white mb-2">More Features Coming Soon</h3>
          <p className="text-slate-400">
            We're working on advanced search, filters, and personalized recommendations
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function Explore() {
  return (
    <ProtectedRoute>
      <ExplorePage />
    </ProtectedRoute>
  );
}
