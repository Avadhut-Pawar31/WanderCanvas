'use client';

import { motion } from 'framer-motion';
import { Plane, MapPin, Camera, Compass } from 'lucide-react';

const cards = [
  { icon: Plane, label: 'Scenic Corridors', delay: 0 },
  { icon: MapPin, label: 'Clean Washrooms', delay: 0.2 },
  { icon: Camera, label: 'Artisan Stops', delay: 0.4 },
  { icon: Compass, label: 'Shared Itineraries', delay: 0.6 },
];

export function FloatingCards() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          className="absolute bg-white/85 backdrop-blur-md border border-[#244536]/15 rounded-2xl p-3.5 flex items-center gap-2.5 shadow-xs"
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: [0.4, 0.85, 0.4],
            y: [0, -16, 0],
            x: [0, 8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: card.delay,
            ease: "easeInOut",
          }}
          style={{
            top: `${20 + index * 18}%`,
            left: `${8 + index * 18}%`,
          }}
        >
          <card.icon className="w-4 h-4 text-[#244536]" />
          <span className="text-xs font-serif font-bold text-[#292D2A]">{card.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
