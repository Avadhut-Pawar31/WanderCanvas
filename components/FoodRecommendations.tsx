'use client';

import { motion } from 'framer-motion';
import { FoodRecommendation } from '@/types';
import { UtensilsCrossed } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface FoodRecommendationsProps {
  foods: FoodRecommendation[];
}

export function FoodRecommendations({ foods }: FoodRecommendationsProps) {
  return (
    <section className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#244536] mb-1">
          Regional Culinary Guide
        </h2>
        <p className="text-sm text-[#292D2A]/70 font-sans">
          Authentic dishes, local terroir, and culinary traditions rooted in the destination.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {foods.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="h-full bg-white rounded-2xl border border-[#244536]/10 hover:border-[#244536]/30 shadow-xs hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-[#C78363]/10 text-[#C78363] flex-shrink-0">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-bold text-[#292D2A] mb-1.5">
                      {food.name}
                    </h3>
                    <p className="text-xs text-[#292D2A]/70 mb-3.5 leading-relaxed">
                      {food.description}
                    </p>
                    <div className="p-3 rounded-xl bg-[#F7F5EF] border border-[#244536]/8">
                      <p className="text-xs text-[#292D2A]/80 leading-relaxed">
                        <span className="font-semibold text-[#244536] font-mono uppercase text-[10px] tracking-wider block mb-0.5">
                          Cultural Context
                        </span>
                        {food.significance}
                      </p>
                    </div>
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
