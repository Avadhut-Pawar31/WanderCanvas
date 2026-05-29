'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TravelFormData } from '@/types';
import { AIService } from '@/services/aiService';
import { useTravelStore } from '@/store/useTravelStore';
import { TravelForm } from '@/components/TravelForm';
import { AnimatedGlobe } from '@/components/AnimatedGlobe';
import { FloatingCards } from '@/components/FloatingCards';
import { LoadingExperience } from '@/components/LoadingExperience';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function HomePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
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
    <main className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20" />
      
      {isGenerating && <LoadingExperience />}

      <div className="relative z-10">
        {!showForm ? (
          <section className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-indigo-300">AI-Powered Travel Planning</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
                >
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Discover Your Dream Trip
                  </span>
                  <br />
                  <span className="text-white">Before You Travel</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-slate-400 mb-8 leading-relaxed"
                >
                  Generate AI-powered travel mood boards, itineraries, packing lists, and destination insights in seconds.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <Button
                    size="lg"
                    onClick={() => setShowForm(true)}
                    className="group"
                  >
                    Create My Travel Board
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-12 flex items-center gap-8 justify-center lg:justify-start text-sm text-slate-400"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Instant Results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Free to Use</span>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative h-[500px] hidden lg:block"
              >
                <AnimatedGlobe />
                <FloatingCards />
              </motion.div>
            </div>
          </section>
        ) : (
          <section className="min-h-screen flex items-center justify-center px-4 py-20">
            <TravelForm onSubmit={handleFormSubmit} />
          </section>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
