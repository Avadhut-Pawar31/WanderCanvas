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
  const progress = (checkedCount / items.length) * 100;

  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-4xl font-bold text-white mb-2">Smart Packing Assistant</h2>
        <p className="text-slate-400">Personalized checklist for your trip</p>
      </motion.div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">
              Packing Progress
            </span>
            <span className="text-sm font-medium text-indigo-400">
              {checkedCount} / {items.length} items
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category, catIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1, duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{category}</h3>
                <div className="space-y-3">
                  {items
                    .filter(item => item.category === category)
                    .map((item) => (
                      <motion.label
                        key={item.id}
                        className="flex items-center gap-3 cursor-pointer group"
                        whileHover={{ x: 4 }}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => updatePackingItem(item.id, e.target.checked)}
                            className="sr-only"
                          />
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              item.checked
                                ? 'bg-indigo-500 border-indigo-500'
                                : 'border-slate-600 group-hover:border-indigo-400'
                            }`}
                          >
                            {item.checked && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <span
                          className={`text-sm transition-all ${
                            item.checked
                              ? 'text-slate-500 line-through'
                              : 'text-slate-300 group-hover:text-white'
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
