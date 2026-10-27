'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  MapPin, 
  Compass, 
  Sparkles, 
  Luggage, 
  Calendar, 
  Check, 
  ChevronRight, 
  Menu, 
  X, 
  Sunrise, 
  Sun, 
  Moon, 
  Utensils, 
  Camera,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'itinerary' | 'moodboard' | 'packing' | 'attractions'>('itinerary');
  const [checkedPackingItems, setCheckedPackingItems] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '3': false,
    '4': false,
    '5': true,
    '6': false,
  });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      router.push('/home');
    } else {
      router.push('/signup');
    }
  };

  const handleDestinationClick = () => {
    if (isAuthenticated) {
      router.push('/home');
    } else {
      router.push('/signup');
    }
  };

  const togglePackingItem = (id: string) => {
    setCheckedPackingItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const destinations = [
    {
      id: 'amalfi',
      name: 'Amalfi Coast',
      country: 'Italy',
      tagline: 'Pastel villages, lemon groves, and sheer cliffs plunging into the sapphire sea.',
      duration: '7 Days',
      style: 'Coastal Leisure',
      season: 'May – October',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&q=85',
    },
    {
      id: 'kyoto',
      name: 'Kyoto',
      country: 'Japan',
      tagline: 'Centuries-old wooden temples, meditative rock gardens, and traditional teahouses.',
      duration: '8 Days',
      style: 'Cultural Immersion',
      season: 'March – May, Oct – Nov',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=85',
    },
    {
      id: 'paris',
      name: 'Paris',
      country: 'France',
      tagline: 'Haussmann boulevards, quiet neighborhood bistros, and iconic river walks.',
      duration: '5 Days',
      style: 'Art & Gastronomy',
      season: 'April – June, Sept – Oct',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=85',
    },
    {
      id: 'reykjavik',
      name: 'South Coast & Highlands',
      country: 'Iceland',
      tagline: 'Basalt sea stacks, geothermal pools, cascading falls, and raw volcanic serenity.',
      duration: '6 Days',
      style: 'Wild Nature',
      season: 'Year-round',
      image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1000&q=85',
    },
    {
      id: 'bali',
      name: 'Ubud & Coastal Cliffs',
      country: 'Indonesia',
      tagline: 'Lush terraced rice paddies, sacred water temples, and restorative wellness retreats.',
      duration: '10 Days',
      style: 'Island Retreat',
      season: 'April – October',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&q=85',
    },
    {
      id: 'zermatt',
      name: 'Zermatt & Valais',
      country: 'Switzerland',
      tagline: 'Iconic alpine peaks, glacier hiking, and quiet fireside moments in wooden chalets.',
      duration: '6 Days',
      style: 'Alpine Escape',
      season: 'July – Sept, Dec – March',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1000&q=85',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#292D2A] selection:bg-[#244536]/15 selection:text-[#244536]">
      {/* 1. EDITORIAL NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#F7F5EF]/90 backdrop-blur-md border-b border-[#244536]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link href="/" className="group flex items-baseline gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244536] rounded-md">
            <span className="font-serif text-2xl lg:text-3xl font-medium tracking-tight text-[#244536] group-hover:text-[#1B3529] transition-colors">
              WanderCanvas
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C78363]" />
          </Link>

          {/* Minimal Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#destinations" 
              className="text-sm font-medium text-[#292D2A]/80 hover:text-[#244536] transition-colors"
            >
              Explore
            </a>
            <a 
              href="#how-it-works" 
              className="text-sm font-medium text-[#292D2A]/80 hover:text-[#244536] transition-colors"
            >
              How it works
            </a>
            <a 
              href="#product-preview" 
              className="text-sm font-medium text-[#292D2A]/80 hover:text-[#244536] transition-colors"
            >
              Preview
            </a>
            <Link 
              href="/workspace/trip-amalfi-classic"
              className="text-sm font-medium text-[#244536] hover:text-[#1B3529] transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C78363]" />
              Route Workspace
            </Link>
            <Link 
              href={isAuthenticated ? "/my-trips" : "/login"}
              className="text-sm font-medium text-[#292D2A]/80 hover:text-[#244536] transition-colors"
            >
              My Trips
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#5F6761] flex items-center gap-1.5 font-medium">
                  <UserIcon className="w-3.5 h-3.5 text-[#244536]" />
                  {user?.name || 'Traveler'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/home')}
                  className="rounded-xl border-[#244536]/20 text-[#244536] hover:bg-[#244536]/5"
                >
                  Open Planner
                </Button>
                <button
                  onClick={() => logout()}
                  title="Sign out"
                  className="p-2 text-[#5F6761] hover:text-[#244536] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[#292D2A] hover:text-[#244536] px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Button
                  size="sm"
                  onClick={() => handlePrimaryAction()}
                  className="bg-[#244536] text-white hover:bg-[#1B3529] rounded-xl px-5 py-2 text-sm shadow-xs"
                >
                  Plan your journey
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#244536] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-[#244536]/10 bg-[#F7F5EF] px-6 py-6 space-y-4"
            >
              <div className="flex flex-col space-y-3">
                <a 
                  href="#destinations" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-[#292D2A] hover:text-[#244536] py-1"
                >
                  Explore Destinations
                </a>
                <a 
                  href="#how-it-works" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-[#292D2A] hover:text-[#244536] py-1"
                >
                  How it works
                </a>
                <a 
                  href="#product-preview" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-[#292D2A] hover:text-[#244536] py-1"
                >
                  Live Preview
                </a>
                <Link 
                  href="/workspace/trip-amalfi-classic"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-serif text-[#244536] py-1 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#C78363]" />
                  Route Workspace (Demo)
                </Link>
                <Link 
                  href={isAuthenticated ? "/my-trips" : "/login"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-[#292D2A] hover:text-[#244536] py-1"
                >
                  My Trips
                </Link>
              </div>

              <div className="pt-4 border-t border-[#244536]/10 flex flex-col gap-3">
                {isAuthenticated ? (
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/home');
                    }}
                    className="w-full bg-[#244536] text-white"
                  >
                    Go to Planner
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/login');
                      }}
                      className="w-full border-[#244536]/20 text-[#244536]"
                    >
                      Log in
                    </Button>
                    <Button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handlePrimaryAction();
                      }}
                      className="w-full bg-[#244536] text-white"
                    >
                      Plan your journey
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Editorial Typography & Actions */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7ECE5] text-[#244536] text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#C78363]" />
              <span>Thoughtful AI-crafted journeys</span>
            </div>

            <div className="space-y-6">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#244536] font-normal tracking-tight leading-[1.12]">
                Less planning. <br className="hidden sm:inline" />
                <span className="italic font-normal text-[#292D2A]">More wondering.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#5F6761] leading-relaxed max-w-xl font-normal">
                Turn the places you dream about into trips you&apos;ll remember. Discover destinations, build thoughtful itineraries, and organize every detail in one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => handlePrimaryAction()}
                className="bg-[#244536] text-white hover:bg-[#1B3529] rounded-xl px-7 text-sm font-medium shadow-sm transition-all"
              >
                Plan your journey
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/workspace/trip-amalfi-classic')}
                className="border border-[#244536]/25 text-[#244536] hover:bg-[#244536]/5 rounded-xl px-6 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#C78363]" />
                Route Workspace
              </Button>
            </div>

            {/* Subtle editorial trust proof */}
            <div className="pt-6 border-t border-[#244536]/10 flex flex-wrap items-center gap-6 text-xs text-[#5F6761]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#244536]" />
                <span>Balanced day-by-day itineraries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C78363]" />
                <span>Curated visual mood boards</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8B5A0]" />
                <span>Exportable travel checklists</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Quality Authentic Photography Visual */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-[#244536]/10 bg-white">
              <div className="aspect-[4/3] sm:aspect-[16/11] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1400&q=85"
                  alt="Pastel cliffside architecture in Positano, Amalfi Coast in natural morning light"
                  className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700 ease-out"
                />
                
                {/* Subtle natural photograph gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                {/* Overlaid Product Element 1: Compact Destination Label */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-black/5 shadow-sm flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C78363]" />
                  <span className="text-xs font-medium text-[#292D2A]">
                    Positano, Amalfi Coast · Italy
                  </span>
                </div>

                {/* Overlaid Product Element 2: Grounded Trip Summary Card */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-black/5 shadow-lg">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#E7ECE5] text-[#244536] text-[11px] font-medium tracking-wide">
                        7-Day Itinerary
                      </span>
                      <span className="text-xs text-[#5F6761]">• 14 Curated Spots</span>
                    </div>
                    <span className="text-xs font-semibold text-[#244536]">Day 3 / Morning</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#292D2A] font-medium leading-snug">
                    Ferry crossing to Capri, private cliffside walk through Ravello&apos;s lemon terraces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION A — EXPLORE INSPIRING DESTINATIONS */}
      <section id="destinations" className="py-20 lg:py-28 px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#244536]/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C78363]">
              Curated Destinations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#244536] font-normal tracking-tight">
              Places that invite you to wander
            </h2>
            <p className="text-sm sm:text-base text-[#5F6761] max-w-xl">
              Authentic journeys crafted around landscape, rhythm, and local culture. Select a destination to begin your itinerary.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePrimaryAction()}
            className="self-start md:self-auto rounded-xl border-[#244536]/25 text-[#244536] hover:bg-[#244536]/5"
          >
            Explore all guides
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              onClick={() => handleDestinationClick()}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#244536]/10 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[16/11] overflow-hidden bg-[#E7ECE5]">
                <img
                  src={dest.image}
                  alt={`${dest.name}, ${dest.country}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#244536] shadow-xs">
                  {dest.duration}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#C78363] font-medium mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{dest.country}</span>
                  </div>
                  <h3 className="font-serif text-xl text-[#244536] font-medium group-hover:text-[#C78363] transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5F6761] mt-2 line-clamp-2 leading-relaxed">
                    {dest.tagline}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#244536]/8 flex items-center justify-between text-xs text-[#5F6761]">
                  <span className="font-medium text-[#244536]">{dest.style}</span>
                  <span>{dest.season}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECTION B — HOW WANDER CANVAS WORKS */}
      <section id="how-it-works" className="py-20 lg:py-28 px-6 lg:px-12 bg-[#F0F3EF] border-y border-[#244536]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C78363]">
              The Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#244536] font-normal tracking-tight">
              Travel planning made simple and serene
            </h2>
            <p className="text-sm sm:text-base text-[#5F6761]">
              Three thoughtful steps from initial inspiration to a detailed day-by-day itinerary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-[#244536]/10 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-serif text-3xl font-normal text-[#C78363]">01</span>
                  <div className="w-10 h-10 rounded-xl bg-[#E7ECE5] flex items-center justify-center text-[#244536]">
                    <Compass className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-medium text-[#244536] mb-3">
                  Discover a destination
                </h3>
                <p className="text-sm text-[#5F6761] leading-relaxed">
                  Enter any place you dream of exploring. Set your preferred travel style—from cultural immersion to slow coastal leisure—along with your ideal duration and budget.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#244536]/8 text-xs text-[#244536] font-medium flex items-center gap-1">
                <span>Personalized inputs</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-[#244536]/10 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-serif text-3xl font-normal text-[#C78363]">02</span>
                  <div className="w-10 h-10 rounded-xl bg-[#E7ECE5] flex items-center justify-center text-[#244536]">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-medium text-[#244536] mb-3">
                  Create your itinerary
                </h3>
                <p className="text-sm text-[#5F6761] leading-relaxed">
                  WanderCanvas balances mornings, afternoons, and evenings so your days never feel rushed. Handpicked attractions and authentic local meals align naturally with your pace.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#244536]/8 text-xs text-[#244536] font-medium flex items-center gap-1">
                <span>Paced time blocks</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-[#244536]/10 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-serif text-3xl font-normal text-[#C78363]">03</span>
                  <div className="w-10 h-10 rounded-xl bg-[#E7ECE5] flex items-center justify-center text-[#244536]">
                    <Luggage className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-medium text-[#244536] mb-3">
                  Organize &amp; pack
                </h3>
                <p className="text-sm text-[#5F6761] leading-relaxed">
                  Generate visual mood boards, customized packing checklists, and local cultural etiquette tips. Save your boards or export a companion PDF to take with you.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#244536]/8 text-xs text-[#244536] font-medium flex items-center gap-1">
                <span>PDF export ready</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION C — SHOW THE ACTUAL PRODUCT (INTERACTIVE PREVIEW) */}
      <section id="product-preview" className="py-20 lg:py-28 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="space-y-4 mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C78363]">
            Product Preview
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#244536] font-normal tracking-tight">
            Designed for clarity, depth, and beauty
          </h2>
          <p className="text-sm sm:text-base text-[#5F6761]">
            Explore an authentic sample travel board generated for Positano &amp; the Amalfi Coast.
          </p>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-xl bg-white border border-[#244536]/10 shadow-xs gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => setActivePreviewTab('itinerary')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activePreviewTab === 'itinerary'
                  ? 'bg-[#244536] text-white shadow-xs'
                  : 'text-[#5F6761] hover:text-[#244536]'
              }`}
            >
              Daily Itinerary
            </button>
            <button
              onClick={() => setActivePreviewTab('moodboard')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activePreviewTab === 'moodboard'
                  ? 'bg-[#244536] text-white shadow-xs'
                  : 'text-[#5F6761] hover:text-[#244536]'
              }`}
            >
              Visual Mood Board
            </button>
            <button
              onClick={() => setActivePreviewTab('packing')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activePreviewTab === 'packing'
                  ? 'bg-[#244536] text-white shadow-xs'
                  : 'text-[#5F6761] hover:text-[#244536]'
              }`}
            >
              Packing Assistant
            </button>
            <button
              onClick={() => setActivePreviewTab('attractions')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activePreviewTab === 'attractions'
                  ? 'bg-[#244536] text-white shadow-xs'
                  : 'text-[#5F6761] hover:text-[#244536]'
              }`}
            >
              Attractions &amp; Dining
            </button>
          </div>
        </div>

        {/* Tab Content Display Canvas */}
        <div className="bg-white rounded-3xl border border-[#244536]/10 shadow-sm p-6 sm:p-10">
          {/* Header of the Preview Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#244536]/10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C78363]">
                  Sample Board
                </span>
                <span className="text-xs text-[#5F6761]">• 7-Day Coastal Odyssey</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#244536]">
                Amalfi Coast &amp; Capri
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#5F6761] bg-[#F0F3EF] px-3 py-1.5 rounded-lg border border-[#244536]/10">
                Daily Budget: $240 / day
              </span>
              <Button
                size="sm"
                onClick={() => handlePrimaryAction()}
                className="bg-[#244536] text-white hover:bg-[#1B3529] text-xs font-medium rounded-xl"
              >
                Plan your own
              </Button>
            </div>
          </div>

          {/* TAB 1: DAILY ITINERARY */}
          {activePreviewTab === 'itinerary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Day 1 */}
                <div className="rounded-2xl p-6 bg-[#F7F5EF] border border-[#244536]/10 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-serif text-lg font-medium text-[#244536]">Day 1 · Arrival in Positano</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-white border border-[#244536]/10 text-[#5F6761]">
                        Paced
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="flex items-start gap-3">
                        <Sunrise className="w-4 h-4 text-[#C78363] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#292D2A]">Morning</p>
                          <p className="text-[#5F6761] mt-0.5">Check-in at cliffside villa, espresso on private terrace overlooking Spiaggia Grande.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Sun className="w-4 h-4 text-[#244536] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#292D2A]">Afternoon</p>
                          <p className="text-[#5F6761] mt-0.5">Slow stroll through bougainvillea-lined alleys, visiting ceramic artisans and linen workshops.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Moon className="w-4 h-4 text-[#5F6761] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#292D2A]">Evening</p>
                          <p className="text-[#5F6761] mt-0.5">Candlelit dinner at Da Vincenzo with fresh handmade scialatielli ai frutti di mare.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day 2 */}
                <div className="rounded-2xl p-6 bg-[#F7F5EF] border border-[#244536]/10 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-serif text-lg font-medium text-[#244536]">Day 2 · Path of the Gods</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-white border border-[#244536]/10 text-[#5F6761]">
                        Scenic Trek
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="flex items-start gap-3">
                        <Sunrise className="w-4 h-4 text-[#C78363] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#292D2A]">Morning</p>
                          <p className="text-[#5F6761] mt-0.5">Early morning hike on Sentiero degli Dei with sweeping 360-degree views of the coastline.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Sun className="w-4 h-4 text-[#244536] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#292D2A]">Afternoon</p>
                          <p className="text-[#5F6761] mt-0.5">Rustic lunch in Nocelle featuring fresh buffalo mozzarella and local lemon granita.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Moon className="w-4 h-4 text-[#5F6761] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#292D2A]">Evening</p>
                          <p className="text-[#5F6761] mt-0.5">Sunset aperitivo at Franco&apos;s Bar overlooking the sparkling twilight coastline.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day 3 */}
                <div className="rounded-2xl p-6 bg-[#F7F5EF] border border-[#244536]/10 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-serif text-lg font-medium text-[#244536]">Day 3 · Capri &amp; The Blue Grotto</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-white border border-[#244536]/10 text-[#5F6761]">
                        Island Sail
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="flex items-start gap-3">
                        <Sunrise className="w-4 h-4 text-[#C78363] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#292D2A]">Morning</p>
                          <p className="text-[#5F6761] mt-0.5">Private gozzo wooden boat across to Capri, passing through the iconic Faraglioni rock arches.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Sun className="w-4 h-4 text-[#244536] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#292D2A]">Afternoon</p>
                          <p className="text-[#5F6761] mt-0.5">Chairlift up to Monte Solaro in Anacapri for panoramic island views and garden tea.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Moon className="w-4 h-4 text-[#5F6761] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#292D2A]">Evening</p>
                          <p className="text-[#5F6761] mt-0.5">Sunset ferry cruise back to Positano with limoncello tasting under the stars.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL MOOD BOARD */}
          {activePreviewTab === 'moodboard' && (
            <div className="space-y-8">
              {/* Destination Color Palette */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5F6761] mb-3">
                  Destination Color Palette
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#244536]/10 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#244536] border border-black/10" />
                    <div>
                      <p className="text-xs font-semibold text-[#292D2A]">Mediterranean Pine</p>
                      <p className="text-[10px] text-[#5F6761]">#244536</p>
                    </div>
                  </div>
                  <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#244536]/10 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#C78363] border border-black/10" />
                    <div>
                      <p className="text-xs font-semibold text-[#292D2A]">Terracotta Tile</p>
                      <p className="text-[10px] text-[#5F6761]">#C78363</p>
                    </div>
                  </div>
                  <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#244536]/10 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#A8B5A0] border border-black/10" />
                    <div>
                      <p className="text-xs font-semibold text-[#292D2A]">Olive Grove</p>
                      <p className="text-[10px] text-[#5F6761]">#A8B5A0</p>
                    </div>
                  </div>
                  <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#244536]/10 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#EAE2B7] border border-black/10" />
                    <div>
                      <p className="text-xs font-semibold text-[#292D2A]">Amalfi Lemon</p>
                      <p className="text-[10px] text-[#5F6761]">#EAE2B7</p>
                    </div>
                  </div>
                  <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#244536]/10 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#003049] border border-black/10" />
                    <div>
                      <p className="text-xs font-semibold text-[#292D2A]">Deep Tyrrhenian</p>
                      <p className="text-[10px] text-[#5F6761]">#003049</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Moodboard Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] relative group bg-[#E7ECE5]">
                  <img
                    src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80"
                    alt="Positano Architecture"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#244536]">
                    Architecture &amp; Vistas
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden aspect-[4/3] relative group bg-[#E7ECE5]">
                  <img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"
                    alt="Italian Coastal Cuisine"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#244536]">
                    Coastal Gastronomy
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden aspect-[4/3] relative group bg-[#E7ECE5]">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80"
                    alt="Crystal Clear Water"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#244536]">
                    Coves &amp; Private Shallows
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PACKING ASSISTANT */}
          {activePreviewTab === 'packing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#244536]/10">
                <p className="text-xs text-[#5F6761]">
                  Interactive checklist customized for coastal walking &amp; boat excursions.
                </p>
                <span className="text-xs font-semibold text-[#244536]">
                  {Object.values(checkedPackingItems).filter(Boolean).length} / 6 packed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: '1', title: 'Breathable linen shirts & trousers', category: 'Apparel' },
                  { id: '2', title: 'Sturdy tread footwear for cliffside stone steps', category: 'Footwear' },
                  { id: '3', title: 'UV polarized sunglasses & reef-safe sunscreen', category: 'Protection' },
                  { id: '4', title: 'Waterproof dry bag for boat excursions to Capri', category: 'Gear' },
                  { id: '5', title: 'EU Type C/F power adapter & portable battery', category: 'Electronics' },
                  { id: '6', title: 'Lightweight evening layer for breezy sea terraces', category: 'Apparel' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => togglePackingItem(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      checkedPackingItems[item.id]
                        ? 'bg-[#E7ECE5]/60 border-[#244536]/20'
                        : 'bg-[#F7F5EF] border-[#244536]/10 hover:border-[#244536]/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        checkedPackingItems[item.id]
                          ? 'bg-[#244536] text-white'
                          : 'border border-[#244536]/30 bg-white'
                      }`}>
                        {checkedPackingItems[item.id] && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs font-medium ${
                        checkedPackingItems[item.id] ? 'line-through text-[#5F6761]' : 'text-[#292D2A]'
                      }`}>
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5F6761] uppercase tracking-wider font-semibold">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ATTRACTIONS & DINING */}
          {activePreviewTab === 'attractions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Highlight Attraction */}
              <div className="bg-[#F7F5EF] p-6 rounded-2xl border border-[#244536]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#244536] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#C78363]" />
                    Featured Landmark
                  </span>
                  <span className="text-xs text-[#5F6761]">3-4 hours</span>
                </div>
                <h4 className="font-serif text-xl font-medium text-[#244536]">
                  Villa Cimbrone Gardens (Ravello)
                </h4>
                <p className="text-xs text-[#5F6761] leading-relaxed">
                  Perched on a high cliff over the sea, the famed Infinity Terrace features marble Roman busts framed against endless azure horizon.
                </p>
                <div className="pt-2 text-xs font-medium text-[#244536] flex items-center gap-1">
                  <span>Entry: €10 • Ideal visit at 10:00 AM</span>
                </div>
              </div>

              {/* Local Dining Recommendation */}
              <div className="bg-[#F7F5EF] p-6 rounded-2xl border border-[#244536]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#244536] flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-[#C78363]" />
                    Authentic Culinary Dish
                  </span>
                  <span className="text-xs text-[#5F6761]">Campania Tradition</span>
                </div>
                <h4 className="font-serif text-xl font-medium text-[#244536]">
                  Delizia al Limone &amp; Scialatielli
                </h4>
                <p className="text-xs text-[#5F6761] leading-relaxed">
                  Thick handmade pasta ribbon tossed with sea clams, followed by spongy dome pastry soaked in lemon liquor and velvety chantilly cream.
                </p>
                <div className="pt-2 text-xs font-medium text-[#244536] flex items-center gap-1">
                  <span>Recommended spot: Trattoria da Cumpa&apos; Cosimo</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. SECTION D — FINAL CALL TO ACTION */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 max-w-5xl mx-auto text-center">
        <div className="bg-[#244536] text-[#F7F5EF] rounded-3xl p-10 sm:p-16 relative overflow-hidden shadow-xl">
          {/* Subtle warm decorative ring */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C78363]">
              Start Your Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-tight">
              Begin your next story.
            </h2>
            <p className="text-sm sm:text-base text-[#E7ECE5]/80 font-normal leading-relaxed max-w-lg mx-auto">
              Turn the places you dream about into trips you&apos;ll remember. Plan your first journey with WanderCanvas in under two minutes.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => handlePrimaryAction()}
                className="w-full sm:w-auto bg-[#C78363] hover:bg-[#B37050] text-white rounded-xl px-8 text-sm font-medium shadow-md transition-all"
              >
                Plan your journey
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const elem = document.getElementById('destinations');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border-white/20 rounded-xl px-7 text-sm font-medium"
              >
                Browse destinations
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CLEAN EDITORIAL FOOTER */}
      <footer className="border-t border-[#244536]/10 py-12 px-6 lg:px-12 bg-[#F7F5EF]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#5F6761]">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg font-medium text-[#244536]">WanderCanvas</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C78363]" />
            <span className="ml-2 text-[#5F6761] hidden sm:inline">— Thoughtful travel planning</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#destinations" className="hover:text-[#244536] transition-colors">Destinations</a>
            <a href="#how-it-works" className="hover:text-[#244536] transition-colors">How it works</a>
            <Link href={isAuthenticated ? "/my-trips" : "/login"} className="hover:text-[#244536] transition-colors">
              My Trips
            </Link>
            <Link href="/login" className="hover:text-[#244536] transition-colors">
              Login
            </Link>
          </div>

          <p>© {new Date().getFullYear()} WanderCanvas. Curated with intention.</p>
        </div>
      </footer>
    </div>
  );
}
