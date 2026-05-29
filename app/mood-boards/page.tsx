'use client';

import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Palette, Plus, Share2, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function MoodBoardsPage() {
  const router = useRouter();

  const moodBoards = [
    {
      id: 1,
      title: 'Tropical Paradise',
      destination: 'Bali, Indonesia',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      created: '2024-06-15',
      image: 'https://images.unsplash.com/photo-1537008122235-260b09ee128f?w=400&q=80',
    },
    {
      id: 2,
      title: 'Urban Explorer',
      destination: 'New York City, USA',
      colors: ['#2C3E50', '#E74C3C', '#ECF0F1'],
      created: '2024-06-10',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80',
    },
    {
      id: 3,
      title: 'Mountain Escape',
      destination: 'Swiss Alps, Switzerland',
      colors: ['#FFFFFF', '#87CEEB', '#8B7355'],
      created: '2024-06-05',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    },
  ];

  // Calculate statistics
  const stats = [
    { label: 'Total Mood Boards', value: moodBoards.length },
    { label: 'Destinations', value: new Set(moodBoards.map(b => b.destination)).size },
    { label: 'Countries', value: new Set(moodBoards.map(b => b.destination.split(', ')[1])).size },
  ];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-950">
        {/* Premium Gradient Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 lg:mb-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
          >
            {/* Left Section */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg backdrop-blur-sm">
                  <Palette className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wide">Mood Boards</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                Your Travel Palettes
              </h1>
              <p className="text-lg text-slate-400 mt-2 max-w-2xl">
                Curated color stories and visual inspirations for every destination. Create, share, and export your mood boards.
              </p>
            </div>

            {/* Right Section - CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={() => router.push('/home')}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-indigo-500/25"
              >
                <Sparkles className="w-5 h-5" />
                <span>Create Mood Board</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 lg:mb-16"
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-300"
              >
                <div className="text-3xl sm:text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                  {stat.value}
                </div>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Mood Boards Grid */}
          {moodBoards.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {moodBoards.map((board, index) => (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group h-full"
                >
                  <div className="relative h-full flex flex-col overflow-hidden rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/10">
                    {/* Image Container - Reduced Height */}
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                      <img
                        src={board.image}
                        alt={board.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Soft Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col p-5 space-y-4">
                      {/* Title & Destination */}
                      <div className="space-y-1 flex-1">
                        <h3 className="text-lg font-semibold text-white leading-tight">
                          {board.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {board.destination}
                        </p>
                      </div>

                      {/* Color Palette - Elegant Dots */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                        <span className="text-xs text-slate-500 font-medium">Palette:</span>
                        <div className="flex gap-2">
                          {board.colors.map((color, i) => (
                            <motion.div
                              key={i}
                              whileHover={{ scale: 1.2 }}
                              className="w-6 h-6 rounded-full border border-slate-600/50 shadow-md hover:shadow-lg transition-all cursor-pointer"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex gap-2 pt-2">
                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-all duration-200"
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Share</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Export</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="mb-6 p-4 bg-indigo-500/10 rounded-full">
                <Palette className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                No mood boards yet
              </h3>
              <p className="text-slate-400 mb-8 max-w-md text-center">
                Create your first mood board to start collecting color stories and visual inspiration for your travels.
              </p>
              <button
                onClick={() => router.push('/home')}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Create First Mood Board
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default MoodBoardsPage;
