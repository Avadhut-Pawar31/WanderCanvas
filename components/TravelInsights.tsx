'use client';

import { motion } from 'framer-motion';
import { TravelInsight } from '@/types';
import { Users, Shield, PiggyBank, MessageCircle, LucideIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface TravelInsightsProps {
  insights: TravelInsight[];
}

const iconMap: Record<string, LucideIcon> = {
  'users': Users,
  'shield': Shield,
  'piggy-bank': PiggyBank,
  'message-circle': MessageCircle,
};

export function TravelInsights({ insights }: TravelInsightsProps) {
  return (
    <section className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#244536] mb-1">
          Travel Knowledge & Etiquette
        </h2>
        <p className="text-sm text-[#292D2A]/70 font-sans">
          Local customs, safety recommendations, financial advice, and practical language nuances.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.icon] || Users;
          
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              whileHover={{ y: -3 }}
            >
              <Card className="h-full bg-white border border-[#244536]/10 shadow-xs hover:shadow-md transition-all rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-[#244536]/8">
                    <div className="p-3 rounded-2xl bg-[#244536]/8 text-[#244536] flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#244536]" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#292D2A]">
                      {insight.title}
                    </h3>
                  </div>
                  
                  <ul className="space-y-2.5">
                    {insight.content.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 + i * 0.04 }}
                        className="flex items-start gap-2.5 text-xs text-[#292D2A]/75 leading-relaxed"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C78363] mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
