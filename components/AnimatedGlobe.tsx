'use client';

import { motion } from 'framer-motion';

export function AnimatedGlobe() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="relative w-64 h-64"
        animate={{
          rotateY: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#244536]/15 via-[#A8B5A0]/15 to-[#C78363]/15 blur-2xl" />
        <motion.div
          className="absolute inset-0 rounded-full border border-[#244536]/20"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border border-[#C78363]/25"
          animate={{
            scale: [1.08, 1, 1.08],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute inset-8 rounded-full border border-[#A8B5A0]/30"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </motion.div>
    </div>
  );
}
