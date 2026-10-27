'use client';

import { motion } from 'framer-motion';
import { Attraction } from '@/types';
import { Clock, Tag } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface AttractionsProps {
  attractions: Attraction[];
}

export function Attractions({ attractions }: AttractionsProps) {
  return (
    <section className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#244536] mb-1">
          Places to Visit & Explore
        </h2>
        <p className="text-sm text-[#292D2A]/70 font-sans">
          Curated attractions, natural viewpoints, and cultural waypoints along your journey.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attractions.map((attraction, index) => (
          <motion.div
            key={attraction.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            whileHover={{ y: -4 }}
          >
            <Card className="h-full bg-white rounded-2xl border border-[#244536]/10 hover:border-[#244536]/30 shadow-xs hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-serif font-bold text-[#292D2A] leading-snug">
                      {attraction.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold bg-[#244536]/8 text-[#244536] border border-[#244536]/15 flex-shrink-0">
                      {attraction.category}
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#292D2A]/70 mb-5 leading-relaxed">
                    {attraction.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#292D2A]/60 pt-3 border-t border-[#244536]/8 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C78363]" />
                    <span>{attraction.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#244536]" />
                    <span>{attraction.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
