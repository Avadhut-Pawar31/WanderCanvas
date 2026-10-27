'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  category: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, alt, category }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors z-10"
          >
            <X className="w-5 h-5 text-[#244536]" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full"
          >
            <img
              src={imageUrl}
              alt={alt}
              className="w-full h-auto max-h-[85vh] object-contain rounded-3xl shadow-2xl border border-white/10"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent rounded-b-3xl">
              <p className="text-white font-serif text-2xl font-bold capitalize">{category}</p>
              <p className="text-white/80 text-xs mt-1 font-sans">{alt}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
