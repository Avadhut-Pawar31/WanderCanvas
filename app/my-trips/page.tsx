'use client';

import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Map, Calendar, MapPin, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function MyTripsPage() {
  const router = useRouter();

  const trips = [
    {
      id: 1,
      destination: 'Paris, France',
      dates: 'Jun 15 - Jun 22, 2024',
      duration: '7 days',
      status: 'Upcoming',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
    },
    {
      id: 2,
      destination: 'Tokyo, Japan',
      dates: 'Aug 10 - Aug 20, 2024',
      duration: '10 days',
      status: 'Planning',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
    },
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Map className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">My Trips</h1>
                <p className="text-slate-400 mt-1">Manage your travel plans</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/home')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Plan New Trip
            </Button>
          </div>
        </motion.div>

        {/* Trips List */}
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="group relative overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-700/50 hover:border-indigo-500/50 transition-all cursor-pointer"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.destination}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-2">{trip.destination}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{trip.dates}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{trip.duration}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trip.status === 'Upcoming' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Map className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No trips yet</h3>
            <p className="text-slate-400 mb-6">Start planning your first adventure!</p>
            <Button onClick={() => router.push('/home')}>
              <Plus className="w-4 h-4 mr-2" />
              Plan Your First Trip
            </Button>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-2xl">
            <div className="text-3xl font-bold text-white mb-2">{trips.length}</div>
            <div className="text-slate-400">Total Trips</div>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-2xl">
            <div className="text-3xl font-bold text-white mb-2">
              {trips.filter(t => t.status === 'Upcoming').length}
            </div>
            <div className="text-slate-400">Upcoming</div>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-700/50 rounded-2xl">
            <div className="text-3xl font-bold text-white mb-2">
              {trips.filter(t => t.status === 'Planning').length}
            </div>
            <div className="text-slate-400">In Planning</div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function MyTrips() {
  return (
    <ProtectedRoute>
      <MyTripsPage />
    </ProtectedRoute>
  );
}
