'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { TravelFormData } from '@/types';
import { AIService } from '@/services/aiService';
import { useTravelStore } from '@/store/useTravelStore';
import { TravelForm } from '@/components/TravelForm';
import { LoadingExperience } from '@/components/LoadingExperience';
import { Sparkles, ArrowRight, ShieldCheck, Map, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destinationQuery = searchParams.get('destination') || '';
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState<boolean>(() => Boolean(destinationQuery));
  const { setCurrentBoard, saveBoard } = useTravelStore();

  const handleFormSubmit = async (formData: TravelFormData) => {
    setIsGenerating(true);
    try {
      const travelBoard = await AIService.generateTravelBoard(formData);
      setCurrentBoard(travelBoard);
      saveBoard(travelBoard);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error generating travel board:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#292D2A] pb-24">
      {isGenerating && <LoadingExperience />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {!showForm ? (
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#244536]/8 border border-[#244536]/15 text-[#244536] text-xs font-mono uppercase tracking-wider font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#C78363]" />
                <span>Hygiene-Aware Collaborative Travel</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-serif font-bold text-[#244536] leading-[1.15] tracking-tight">
                Curate Your Journey <br />
                <span className="italic font-normal text-[#C78363]">Before You Depart</span>
              </h1>

              <p className="text-base sm:text-lg text-[#292D2A]/75 leading-relaxed max-w-xl font-sans">
                Build personalized travel itineraries backed by verified route geometry, 90-day hygiene inspection records for washrooms and hotels, and real-time collaboration with friends.
              </p>

              {/* Pillar Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white rounded-xl p-3 border border-[#244536]/10 shadow-xs flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#244536] flex-shrink-0" />
                  <span className="text-xs font-medium text-[#292D2A]">Audited Clean Washrooms</span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-[#244536]/10 shadow-xs flex items-center gap-2.5">
                  <Map className="w-4 h-4 text-[#C78363] flex-shrink-0" />
                  <span className="text-xs font-medium text-[#292D2A]">Real Route Detour Calc</span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-[#244536]/10 shadow-xs flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#244536] flex-shrink-0" />
                  <span className="text-xs font-medium text-[#292D2A]">Democratic Stop Voting</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-[#244536] text-white hover:bg-[#1B3529] rounded-xl px-7 h-12 text-sm font-semibold shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Start New Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Link href="/workspace/trip-amalfi-classic">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto bg-white text-[#244536] border border-[#244536]/20 hover:bg-white/80 rounded-xl px-6 h-12 text-sm font-semibold shadow-xs"
                  >
                    Open Amalfi Coast Demo Trip
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 bg-white rounded-3xl border border-[#244536]/10 p-6 sm:p-8 shadow-lg space-y-6"
            >
              <div className="relative h-56 rounded-2xl overflow-hidden bg-[#E7ECE5]">
                <img
                  src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=85"
                  alt="Coastal Corridor"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-[#244536]/90 backdrop-blur-sm rounded-lg text-white text-[11px] font-mono uppercase tracking-wider font-semibold">
                  Featured Corridor
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-[#244536]">
                    Naples to Amalfi Coast
                  </h3>
                  <span className="text-xs font-mono font-semibold text-[#C78363] px-2.5 py-1 bg-[#C78363]/10 rounded-lg">
                    63.4 km • 84 min
                  </span>
                </div>
                <p className="text-xs text-[#292D2A]/70 leading-relaxed">
                  Active corridor with 3 verified clean rest stops, cliffside bakeries, and collaborative voting enabled for group travelers.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs border-t border-[#244536]/8">
                  <span className="text-[#292D2A]/60">4 Active Travelers</span>
                  <Link
                    href="/workspace/trip-amalfi-classic"
                    className="text-[#244536] font-semibold hover:underline flex items-center gap-1"
                  >
                    View Live Workspace &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <button
                onClick={() => setShowForm(false)}
                className="text-xs font-mono uppercase tracking-wider text-[#244536] hover:underline flex items-center gap-1"
              >
                &larr; Back to Overview
              </button>
            </div>
            <TravelForm
              onSubmit={handleFormSubmit}
              defaultDestination={destinationQuery}
            />
          </div>
        )}
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <div className="font-serif text-sm text-[#244536] italic">Loading planner...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
