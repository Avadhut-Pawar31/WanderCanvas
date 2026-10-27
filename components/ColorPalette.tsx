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
    <section className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#244536] mb-1">
          Harmonic Color Palette
        </h2>
        <p className="text-sm text-[#292D2A]/70 font-sans">
          Natural pigments and architectural tones extracted from your destination corridor.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            className="group bg-white p-3 rounded-2xl border border-[#244536]/10 shadow-xs"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-black/10 shadow-2xs"
              style={{ backgroundColor: color.hex }}
              onClick={() => copyToClipboard(color.hex, index)}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-[#244536]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#292D2A]" />
                  )}
                </div>
              </div>
            </motion.div>
            <div className="mt-3 text-center space-y-0.5">
              <p className="text-xs font-serif font-bold text-[#292D2A] truncate">{color.name}</p>
              <p className="text-[11px] text-[#292D2A]/60 font-mono">{color.hex}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
