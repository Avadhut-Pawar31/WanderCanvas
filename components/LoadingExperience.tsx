'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Compass, Sparkles } from 'lucide-react';

const loadingMessages = [
  'Calculating route geometry and corridor waypoints...',
  'Querying official hygiene inspection records & checklists...',
  'Checking running water, soap, and accessible washroom facilities...',
  'Optimizing detour distances & driving times...',
  'Synthesizing collaborative itinerary & packing essentials...',
  'Finalizing editorial travel canvas...',
];

export function LoadingExperience() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1400);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + 2;
      });
    }, 70);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#F7F5EF]/95 backdrop-blur-md px-4"
    >
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#244536]/12 shadow-2xl text-center space-y-6">
        {/* Animated Compass Icon */}
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-[#244536]/8 border border-[#244536]/15 flex items-center justify-center mx-auto shadow-xs">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Compass className="w-10 h-10 text-[#244536]" />
            </motion.div>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#C78363] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-bold text-[#244536]">
            Curating Your Journey
          </h3>
          <p className="text-sm text-[#292D2A]/70 min-h-[40px] flex items-center justify-center leading-relaxed font-sans px-2">
            {loadingMessages[messageIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-[#F7F5EF] border border-[#244536]/10 h-2.5 rounded-full overflow-hidden p-0.5">
            <motion.div
              className="bg-[#244536] h-full rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#292D2A]/50">
            <span>Grounding data</span>
            <span className="font-semibold text-[#244536]">{progress}%</span>
          </div>
        </div>

        {/* Pulsing Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <span className="w-2 h-2 rounded-full bg-[#244536]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#244536]/40 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#244536]/40 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </motion.div>
  );
}
