'use client';

import { motion } from 'framer-motion';
import { DestinationData } from '@/types';
import { Calendar, Cloud, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface DestinationOverviewProps {
  destination: DestinationData;
}

export function DestinationOverview({ destination }: DestinationOverviewProps) {
  const [imageError, setImageError] = useState(false);
  
  const fallbackImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80';

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl"
    >
      <div className="relative h-96">
        <img
          src={imageError ? fallbackImage : destination.heroImage}
          alt={destination.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold text-white mb-4"
          >
            {destination.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-200 max-w-3xl"
          >
            {destination.description}
          </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-indigo-500/20">
            <Calendar className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Best Season</p>
            <p className="text-lg font-semibold text-white">{destination.bestSeason}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-purple-500/20">
            <Cloud className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Weather</p>
            <p className="text-lg font-semibold text-white">{destination.weather}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-pink-500/20">
            <DollarSign className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Daily Budget</p>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(destination.dailyBudget)}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
