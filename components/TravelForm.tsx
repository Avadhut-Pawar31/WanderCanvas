'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { TravelFormData, TravelStyle } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, DollarSign, Calendar, Sparkles } from 'lucide-react';

const formSchema = z.object({
  destination: z.string().min(2, 'Destination must be at least 2 characters'),
  budget: z.number().min(100, 'Budget must be at least $100'),
  duration: z.number().min(1, 'Duration must be at least 1 day').max(30, 'Duration cannot exceed 30 days'),
  travelStyle: z.enum(['luxury', 'adventure', 'backpacking', 'solo', 'family', 'romantic', 'food-explorer']),
});

const travelStyles: { value: TravelStyle; label: string; emoji: string }[] = [
  { value: 'luxury', label: 'Luxury', emoji: '✨' },
  { value: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { value: 'backpacking', label: 'Backpacking', emoji: '🎒' },
  { value: 'solo', label: 'Solo', emoji: '🚶' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { value: 'romantic', label: 'Romantic', emoji: '💑' },
  { value: 'food-explorer', label: 'Food Explorer', emoji: '🍜' },
];

interface TravelFormProps {
  onSubmit: (data: TravelFormData) => void;
}

export function TravelForm({ onSubmit }: TravelFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TravelFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: '',
      budget: 2000,
      duration: 7,
      travelStyle: 'adventure',
    },
  });

  const selectedStyle = watch('travelStyle');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative backdrop-blur-xl bg-slate-900/40 border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl" />
        
        <div className="relative">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Plan Your Journey
            </h2>
            <p className="text-slate-400 mt-2">Tell us about your dream trip</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Destination
              </Label>
              <Input
                id="destination"
                placeholder="e.g., Paris, Tokyo, Bali"
                {...register('destination')}
              />
              {errors.destination && (
                <p className="text-sm text-red-400">{errors.destination.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Budget (USD)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="2000"
                  {...register('budget', { valueAsNumber: true })}
                />
                {errors.budget && (
                  <p className="text-sm text-red-400">{errors.budget.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Duration (days)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="7"
                  {...register('duration', { valueAsNumber: true })}
                />
                {errors.duration && (
                  <p className="text-sm text-red-400">{errors.duration.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Travel Style</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {travelStyles.map((style) => (
                  <motion.button
                    key={style.value}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setValue('travelStyle', style.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedStyle === style.value
                        ? 'border-indigo-500 bg-indigo-500/20'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{style.emoji}</div>
                    <div className="text-xs text-slate-300">{style.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Generate My Travel Board
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
