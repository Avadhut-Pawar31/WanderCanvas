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
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-4xl font-bold text-white mb-2">Local Food Guide</h2>
        <p className="text-slate-400">Authentic dishes you must try</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {foods.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/20 flex-shrink-0">
                    <UtensilsCrossed className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {food.name}
                    </h3>
                    <p className="text-slate-400 mb-3 leading-relaxed">
                      {food.description}
                    </p>
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <p className="text-sm text-slate-300">
                        <span className="font-medium text-purple-400">Cultural Note:</span>{' '}
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
