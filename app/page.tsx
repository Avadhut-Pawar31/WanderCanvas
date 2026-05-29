'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AnimatedGlobe } from '@/components/AnimatedGlobe';
import { FloatingCards } from '@/components/FloatingCards';
import { Sparkles, ArrowRight, Palette, Map, Heart, Zap, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: Palette,
      title: 'AI Mood Boards',
      description: 'Generate beautiful visual inspiration boards for your destination',
    },
    {
      icon: Map,
      title: 'Smart Itineraries',
      description: 'Get personalized day-by-day travel plans tailored to your style',
    },
    {
      icon: Heart,
      title: 'Save & Organize',
      description: 'Keep all your favorite places and activities in one place',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Generate complete travel plans in seconds with AI',
    },
    {
      icon: Globe,
      title: 'Global Destinations',
      description: 'Explore travel plans for destinations worldwide',
    },
    {
      icon: Shield,
      title: 'Travel Insights',
      description: 'Get safety tips, local etiquette, and money-saving advice',
    },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 gradient-mesh" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-20" />
      
      <div className="relative z-10">
        {/* Hero Section */}
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
                  onClick={() => router.push('/signup')}
                  className="group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => router.push('/login')}
                >
                  Login
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

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Everything You Need to Plan Your Trip
              </h2>
              <p className="text-xl text-slate-400">
                Powered by AI to make travel planning effortless
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="p-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Ready to Start Planning?
              </h2>
              <p className="text-xl text-slate-400 mb-8">
                Join thousands of travelers who use WanderCanvas to plan their perfect trips
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push('/signup')}
                  className="group"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => router.push('/login')}
                >
                  Login to Continue
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center text-slate-400">
            <p>© 2024 WanderCanvas. Made with ❤️ for travelers.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
