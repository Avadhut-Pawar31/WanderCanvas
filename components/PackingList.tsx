'use client';

import { motion } from 'framer-motion';
import { PackingItem } from '@/types';
import { useTravelStore } from '@/store/useTravelStore';
import { Card, CardContent } from './ui/card';
import { Check } from 'lucide-react';

interface PackingListProps {
  items: PackingItem[];
}

export function PackingList({ items }: PackingListProps) {
  const updatePackingItem = useTravelStore((state) => state.updatePackingItem);
  
  const categories = Array.from(new Set(items.map(item => item.category)));
  const checkedCount = items.filter(item => item.checked).length;
  const progress = Math.round((checkedCount / (items.length || 1)) * 100);

  return (
    <section className="py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#244536] mb-1">
          Travel Packing Checklist
        </h2>
        <p className="text-sm text-[#292D2A]/70 font-sans">
          Curated travel gear, personal documents, and essentials tailored to your climate and travel style.
        </p>
      </motion.div>

      {/* Progress Strip */}
      <Card className="mb-6 bg-white border border-[#244536]/10 shadow-xs">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold">
              Readiness Status
            </span>
            <span className="text-xs font-mono text-[#244536] font-semibold">
              {checkedCount} of {items.length} packed ({progress}%)
            </span>
          </div>
          <div className="h-2.5 bg-[#F7F5EF] border border-[#244536]/10 rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-[#244536] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category, catIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.08, duration: 0.4 }}
          >
            <Card className="bg-white border border-[#244536]/10 shadow-xs h-full">
              <CardContent className="p-6">
                <h3 className="text-base font-serif font-bold text-[#244536] mb-4 pb-2 border-b border-[#244536]/8">
                  {category}
                </h3>
                <div className="space-y-3">
                  {items
                    .filter(item => item.category === category)
                    .map((item) => (
                      <motion.label
                        key={item.id}
                        className="flex items-center gap-3 cursor-pointer group"
                        whileHover={{ x: 2 }}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => updatePackingItem(item.id, e.target.checked)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              item.checked
                                ? 'bg-[#244536] border-[#244536]'
                                : 'border-[#244536]/25 bg-white group-hover:border-[#244536]'
                            }`}
                          >
                            {item.checked && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>
                        <span
                          className={`text-xs transition-all ${
                            item.checked
                              ? 'text-[#292D2A]/40 line-through'
                              : 'text-[#292D2A] group-hover:text-[#244536] font-medium'
                          }`}
                        >
                          {item.item}
                        </span>
                      </motion.label>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
