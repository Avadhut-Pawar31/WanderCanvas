'use client';

import { motion } from 'framer-motion';
import { Plane, MapPin, Camera, Compass } from 'lucide-react';

const cards = [
  { icon: Plane, label: 'Flights', delay: 0 },
  { icon: MapPin, label: 'Destinations', delay: 0.2 },
  { icon: Camera, label: 'Memories', delay: 0.4 },
  { icon: Compass, label: 'Adventures', delay: 0.6 },
];

export function FloatingCards() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          className="absolute bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: card.delay,
            ease: "easeInOut",
          }}
          style={{
            top: `${20 + index * 20}%`,
            left: `${10 + index * 15}%`,
          }}
        >
          <card.icon className="w-5 h-5 text-indigo-400" />
          <span className="text-sm text-slate-300">{card.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
