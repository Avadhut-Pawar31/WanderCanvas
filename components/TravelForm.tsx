'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { TravelFormData, TravelStyle } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, DollarSign, Calendar, Sparkles, ShieldCheck } from 'lucide-react';

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
  defaultDestination?: string;
}

export function TravelForm({ onSubmit, defaultDestination = '' }: TravelFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TravelFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: defaultDestination || '',
      budget: 2400,
      duration: 7,
      travelStyle: 'adventure',
    },
  });

  const selectedStyle = watch('travelStyle');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-3xl border border-[#244536]/12 p-8 sm:p-10 shadow-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#244536]/8 text-[#244536] border border-[#244536]/15 mx-auto shadow-2xs">
            <Sparkles className="w-7 h-7 text-[#C78363]" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#244536]">
              Plan Your Journey
            </h2>
            <p className="text-sm text-[#292D2A]/70 mt-1">
              Curate routes, hygiene-verified rest stops, and collaborative itineraries.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C78363]" />
              <span>Destination or Route Corridor</span>
            </Label>
            <Input
              id="destination"
              placeholder="e.g., Amalfi Coast, Tokyo, Kyoto, Paris"
              className="bg-[#F7F5EF]/60 border-[#244536]/15 text-[#292D2A] focus:bg-white text-base h-12"
              {...register('destination')}
            />
            {errors.destination && (
              <p className="text-xs text-red-600 font-medium">{errors.destination.message}</p>
            )}
          </div>

          {/* Budget & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#C78363]" />
                <span>Budget (USD)</span>
              </Label>
              <Input
                id="budget"
                type="number"
                className="bg-[#F7F5EF]/60 border-[#244536]/15 text-[#292D2A] focus:bg-white h-11"
                {...register('budget', { valueAsNumber: true })}
              />
              {errors.budget && (
                <p className="text-xs text-red-600 font-medium">{errors.budget.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C78363]" />
                <span>Duration (Days)</span>
              </Label>
              <Input
                id="duration"
                type="number"
                className="bg-[#F7F5EF]/60 border-[#244536]/15 text-[#292D2A] focus:bg-white h-11"
                {...register('duration', { valueAsNumber: true })}
              />
              {errors.duration && (
                <p className="text-xs text-red-600 font-medium">{errors.duration.message}</p>
              )}
            </div>
          </div>

          {/* Travel Style */}
          <div className="space-y-2.5">
            <Label className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold">
              Travel Style & Atmosphere
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {travelStyles.map((style) => {
                const isSelected = selectedStyle === style.value;
                return (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setValue('travelStyle', style.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#244536] text-white border-[#244536] shadow-sm font-semibold'
                        : 'bg-[#F7F5EF]/50 text-[#292D2A]/80 border-[#244536]/10 hover:bg-white hover:border-[#244536]/25'
                    }`}
                  >
                    <span>{style.emoji}</span>
                    <span className="truncate">{style.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hygiene Assurance Callout */}
          <div className="p-3.5 rounded-xl bg-[#244536]/5 border border-[#244536]/10 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#244536] flex-shrink-0" />
            <div className="text-xs text-[#292D2A]/80">
              <span className="font-semibold text-[#244536]">Hygiene-Aware Corridor Filtering:</span> Verified clean washrooms, running water, and accessibility records will be prioritized along your route.
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-[#244536] hover:bg-[#1B3529] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            Generate Editorial Travel Canvas & Route
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
