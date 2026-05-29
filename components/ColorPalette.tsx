'use client';

import { motion } from 'framer-motion';
import { ColorPalette as ColorPaletteType } from '@/types';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface ColorPaletteProps {
  colors: ColorPaletteType[];
}

export function ColorPalette({ colors }: ColorPaletteProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (hex: string, index: number) => {
    // Check if clipboard API is available (client-side only)
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(hex);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-4xl font-bold text-white mb-2">Color Palette</h2>
        <p className="text-slate-400">Inspired by your destination's aesthetics</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-lg"
              style={{ backgroundColor: color.hex }}
              onClick={() => copyToClipboard(color.hex, index)}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-full p-3"
                >
                  {copiedIndex === index ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-800" />
                  )}
                </motion.div>
              </div>
            </motion.div>
            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-white">{color.name}</p>
              <p className="text-xs text-slate-400 font-mono">{color.hex}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
