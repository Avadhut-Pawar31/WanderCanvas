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
  
  const fallbackImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=85';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-[#244536]/10 shadow-sm"
    >
      {/* Hero Banner */}
      <div className="relative h-96 bg-[#E7ECE5]">
        <img
          src={imageError ? fallbackImage : destination.heroImage}
          alt={destination.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl sm:text-6xl font-serif font-bold text-white mb-3 tracking-tight"
          >
            {destination.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm sm:text-base text-white/90 max-w-3xl leading-relaxed"
          >
            {destination.description}
          </motion.p>
        </div>
      </div>

      {/* Editorial Key Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 bg-white border-t border-[#244536]/10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-4"
        >
          <div className="p-3 rounded-2xl bg-[#244536]/8 text-[#244536]">
            <Calendar className="w-5 h-5 text-[#244536]" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#292D2A]/60 font-semibold">Ideal Season</p>
            <p className="text-base font-serif font-bold text-[#244536] mt-0.5">{destination.bestSeason}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-4"
        >
          <div className="p-3 rounded-2xl bg-[#244536]/8 text-[#244536]">
            <Cloud className="w-5 h-5 text-[#244536]" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#292D2A]/60 font-semibold">Climate & Atmosphere</p>
            <p className="text-base font-serif font-bold text-[#244536] mt-0.5">{destination.weather}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-4"
        >
          <div className="p-3 rounded-2xl bg-[#C78363]/10 text-[#C78363]">
            <DollarSign className="w-5 h-5 text-[#C78363]" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#292D2A]/60 font-semibold">Estimated Daily Budget</p>
            <p className="text-base font-serif font-bold text-[#244536] mt-0.5">
              {formatCurrency(destination.dailyBudget)}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
