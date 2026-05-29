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
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-4xl font-bold text-white mb-2">Places to Visit</h2>
        <p className="text-slate-400">Must-see attractions and experiences</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attractions.map((attraction, index) => (
          <motion.div
            key={attraction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -8 }}
          >
            <Card className="h-full hover:border-indigo-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{attraction.name}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                    {attraction.category}
                  </span>
                </div>
                
                <p className="text-slate-400 mb-4 leading-relaxed">
                  {attraction.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{attraction.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
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
