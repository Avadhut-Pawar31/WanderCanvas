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
    <section className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#244536] mb-1">
          Chronological Itinerary
        </h2>
        <p className="text-sm text-[#292D2A]/70 font-sans">
          Thoughtfully paced morning, afternoon, and evening recommendations.
        </p>
      </motion.div>

      <div className="relative">
        {/* Timeline connector */}
        <div className="absolute left-7 top-6 bottom-6 w-0.5 bg-[#244536]/15 hidden sm:block" />
        
        <div className="space-y-6">
          {days.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="relative sm:pl-20"
            >
              {/* Day badge */}
              <div className="sm:absolute left-0 top-0 w-14 h-14 rounded-2xl bg-[#244536] text-[#F7F5EF] flex flex-col items-center justify-center font-serif font-bold shadow-xs mb-3 sm:mb-0">
                <span className="text-[10px] uppercase font-mono font-normal tracking-wider opacity-75">Day</span>
                <span className="text-lg leading-none">{day.day}</span>
              </div>

              <Card className="bg-white border border-[#244536]/10 shadow-xs rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  {/* Morning */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#C78363]/10 text-[#C78363] flex-shrink-0">
                      <Sunrise className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif font-bold text-sm text-[#292D2A] mb-0.5">
                        Morning Excursion
                      </h4>
                      <p className="text-xs text-[#292D2A]/70 leading-relaxed">
                        {day.morning}
                      </p>
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div className="flex items-start gap-3.5 pt-3 border-t border-[#244536]/8">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 flex-shrink-0">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif font-bold text-sm text-[#292D2A] mb-0.5">
                        Afternoon Exploration
                      </h4>
                      <p className="text-xs text-[#292D2A]/70 leading-relaxed">
                        {day.afternoon}
                      </p>
                    </div>
                  </div>

                  {/* Evening */}
                  <div className="flex items-start gap-3.5 pt-3 border-t border-[#244536]/8">
                    <div className="p-2.5 rounded-xl bg-[#244536]/10 text-[#244536] flex-shrink-0">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif font-bold text-sm text-[#292D2A] mb-0.5">
                        Evening Dining & Leisure
                      </h4>
                      <p className="text-xs text-[#292D2A]/70 leading-relaxed">
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
