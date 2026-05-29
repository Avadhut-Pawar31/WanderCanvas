'use client';

import { motion } from 'framer-motion';
import { ItineraryDay } from '@/types';
import { Sunrise, Sun, Moon } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface ItineraryProps {
  days: ItineraryDay[];
}

export function Itinerary({ days }: ItineraryProps) {
  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-4xl font-bold text-white mb-2">Your Itinerary</h2>
        <p className="text-slate-400">Day-by-day travel plan</p>
      </motion.div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="space-y-8">
          {days.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative pl-20"
            >
              <div className="absolute left-0 top-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                Day {day.day}
              </div>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-orange-500/20 flex-shrink-0">
                      <Sunrise className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">Morning</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {day.morning}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-yellow-500/20 flex-shrink-0">
                      <Sun className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">Afternoon</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {day.afternoon}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-indigo-500/20 flex-shrink-0">
                      <Moon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">Evening</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {day.evening}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
