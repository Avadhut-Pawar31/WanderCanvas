'use client';

import { motion } from 'framer-motion';
import { TravelInsight } from '@/types';
import { Users, Shield, PiggyBank, MessageCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface TravelInsightsProps {
  insights: TravelInsight[];
}

const iconMap: Record<string, any> = {
  'users': Users,
  'shield': Shield,
  'piggy-bank': PiggyBank,
  'message-circle': MessageCircle,
};

export function TravelInsights({ insights }: TravelInsightsProps) {
  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-4xl font-bold text-white mb-2">Travel Insights</h2>
        <p className="text-slate-400">Essential tips for your journey</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.icon] || Users;
          
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full hover:border-cyan-500/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-cyan-500/20">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {insight.title}
                    </h3>
                  </div>
                  
                  <ul className="space-y-3">
                    {insight.content.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + i * 0.05 }}
                        className="flex items-start gap-3 text-sm text-slate-400"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                        <span className="leading-relaxed">{item}</span>
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
