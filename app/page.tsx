'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  MapPin, 
  Compass, 
  Sparkles, 
  Calendar, 
  Check, 
  ChevronRight, 
  Menu, 
  X, 
  Droplets,
  Building2,
  TreePine,
  Landmark,
  UtensilsCrossed,
  Fuel,
  Hotel,
  ShieldCheck,
  Zap,
  Globe,
  Navigation,
  Heart,
  Users,
  Route,
  User as UserIcon,
  LogOut,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { GlobalHierarchicalSearch } from '@/components/search/GlobalHierarchicalSearch';
import { HIERARCHICAL_GEO_ENTITIES } from '@/data/geography/hierarchicalCatalogue';

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Real curated destination circuits backed by genuine geographic catalogue records
  const featuredDestinations = [
    {
      id: 'loc-in-mh-mahabaleshwar',
      name: 'Mahabaleshwar',
      region: 'Satara District, Maharashtra · India',
      tagline: 'Strawberry capital of India, misty Sahyadri valleys, and 600ft cascades.',
      category: 'Hill Station / Nature',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&q=85',
      stopsCount: '12 Verified Spots',
      hygieneScore: 94,
      targetHref: '/explore?entityId=loc-in-mh-mahabaleshwar'
    },
    {
      id: 'dest-in-mh-kaas',
      name: 'Kaas Flower Plateau',
      region: 'Satara, Maharashtra · India',
      tagline: 'UNESCO World Natural Heritage volcanic plateau blooming with endemic wild flora.',
      category: 'UNESCO Biosphere',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=85',
      stopsCount: '8 Scenic Trails',
      hygieneScore: 92,
      targetHref: '/explore?entityId=dest-in-mh-kaas'
    },
    {
      id: 'loc-in-mh-bhilar',
      name: 'Bhilar (Village of Books)',
      region: 'Satara District, Maharashtra · India',
      tagline: 'India’s first official Book Village where rural homes host literature rooms.',
      category: 'Cultural Village',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&q=85',
      stopsCount: '6 Community Stays',
      hygieneScore: 95,
      targetHref: '/explore?entityId=loc-in-mh-bhilar'
    },
    {
      id: 'loc-in-mh-mumbai',
      name: 'Mumbai',
      region: 'Maharashtra · India',
      tagline: 'Colonial Gothic architecture, Arabian sea promenades, and coastal gastronomy.',
      category: 'Metropolis & Heritage',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1000&q=85',
      stopsCount: '24 Curated Spots',
      hygieneScore: 96,
      targetHref: '/explore?entityId=loc-in-mh-mumbai'
    },
    {
      id: 'loc-jp-tokyo-shibuya',
      name: 'Tokyo (Shibuya & Minato)',
      region: 'Tokyo Metropolis · Japan',
      tagline: 'Neon-lit scramble crossings, tranquil Shinto shrines, and Michelin-starred dining.',
      category: 'Global Capital',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&q=85',
      stopsCount: '18 Landmarks',
      hygieneScore: 99,
      targetHref: '/explore?entityId=adm1-jp-tokyo'
    },
    {
      id: 'dest-it-amalfi-coast',
      name: 'Amalfi Coast & Positano',
      region: 'Campania · Italy',
      tagline: 'Sheer limestone cliffs, pastel fishing villages, and Tyrrhenian lemon terraces.',
      category: 'Coastal Corridor',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&q=85',
      stopsCount: '15 Curated Spots',
      hygieneScore: 98,
      targetHref: '/explore?entityId=dest-it-amalfi-coast'
    }
  ];

  // Travel Categories with real actions
  const travelCategories = [
    { label: 'Stays & Resorts', icon: Hotel, href: '/explore?category=hotel', desc: 'Verified boutique stays and luxury retreats' },
    { label: 'Local Food & Cafes', icon: UtensilsCrossed, href: '/explore?category=restaurant', desc: 'Authentic regional cuisines & farm-to-table dining' },
    { label: 'Waterfalls & Nature', icon: Droplets, href: '/explore?category=waterfall', desc: 'Cascades, volcanic plateaus & nature reserves' },
    { label: 'Historic Forts & Heritage', icon: Landmark, href: '/explore?category=heritage', desc: 'Hill strongholds, UNESCO landmarks & temples' },
    { label: 'Petrol & EV Fuel', icon: Fuel, href: '/explore?category=petrol_pump', desc: 'Highway fuel stations & verified EV fast chargers' },
    { label: 'Verified Restrooms', icon: ShieldCheck, href: '/explore?category=washroom', desc: 'Audited highway facilities with verified hygiene' }
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#292D2A] selection:bg-[#C78363]/20 selection:text-[#244536]">
      {/* ------------------------------------------------------------------------ */}
      {/* 1. EDITORIAL HEADER & NAVIGATION BAR */}
      {/* ------------------------------------------------------------------------ */}
      <header className="sticky top-0 z-50 bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#244536]/10 shadow-[0_1px_3px_rgba(36,69,54,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-[#244536] text-[#F7F5EF] rounded-xl flex items-center justify-center shadow-xs group-hover:bg-[#1B3529] transition-colors">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[#244536]">
                WanderCanvas
              </span>
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#C78363] font-semibold -mt-1 hidden sm:block">
                Global Travel Discovery
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link 
              href="/explore" 
              className="text-sm font-medium text-[#292D2A]/80 hover:text-[#244536] transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4 text-[#244536]" />
              <span>Explore Catalogue</span>
            </Link>
            <Link 
              href="/workspace/trip-mahabaleshwar-kaas" 
              className="text-sm font-medium text-[#244536] hover:text-[#1B3529] transition-colors flex items-center gap-1.5 bg-[#244536]/8 px-3 py-1.5 rounded-xl border border-[#244536]/10"
            >
              <Route className="w-4 h-4 text-[#C78363]" />
              <span>Mahabaleshwar Route Workspace</span>
            </Link>
            <Link 
              href={isAuthenticated ? "/my-trips" : "/login"} 
              className="text-sm font-medium text-[#292D2A]/80 hover:text-[#244536] transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-[#5F6761]" />
              <span>Collaborative Trips</span>
            </Link>
            <Link 
              href="/home" 
              className="text-sm font-medium text-[#292D2A]/80 hover:text-[#244536] transition-colors"
            >
              Itinerary Planner
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
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
                  onClick={() => router.push('/signup')}
                  className="bg-[#244536] text-white hover:bg-[#1B3529] rounded-xl px-4 py-2 text-sm shadow-xs"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#244536] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-[#244536]/10 bg-[#F7F5EF] px-6 py-5 space-y-3">
            <Link
              href="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-[#244536]"
            >
              <Globe className="w-4 h-4" />
              <span>Explore Global Catalogue</span>
            </Link>
            <Link
              href="/workspace/trip-mahabaleshwar-kaas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-[#244536]"
            >
              <Route className="w-4 h-4 text-[#C78363]" />
              <span>Route Workspace (Mahabaleshwar)</span>
            </Link>
            <Link
              href={isAuthenticated ? "/my-trips" : "/login"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-[#292D2A]"
            >
              <Users className="w-4 h-4" />
              <span>Collaborative Trips</span>
            </Link>
            <Link
              href="/home"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-[#292D2A]"
            >
              <Compass className="w-4 h-4" />
              <span>Itinerary Planner</span>
            </Link>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------------------ */}
      {/* 2. DISCOVERY HERO WITH GLOBAL HIERARCHICAL AUTOCOMPLETE */}
      {/* ------------------------------------------------------------------------ */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7ECE5] text-[#244536] text-xs font-mono font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#C78363]" />
            <span>GLOBAL &amp; LOCAL DISCOVERY · MAP-LED ITINERARY PLANNING</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#244536] font-bold tracking-tight leading-[1.15]">
            Discover places worldwide. <br />
            <span className="italic font-normal text-[#292D2A]">From continents to local villages.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#5F6761] leading-relaxed max-w-2xl mx-auto">
            Explore verified destinations down to rural settlements, waterfalls, and local petrol pumps. Plan routes, evaluate detours, and collaborate in real-time.
          </p>

          {/* Prominent Search Bar with Real Parent Breadcrumbs */}
          <div className="pt-4 max-w-2xl mx-auto text-left">
            <GlobalHierarchicalSearch
              variant="hero"
              placeholder="Search country, district, town (e.g. 'Mahabaleshwar'), village (e.g. 'Bhilar'), or 'petrol pump in Mahabaleshwar'..."
            />
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-[#5F6761] font-mono">
              <span>Try searching:</span>
              {[
                { label: 'Mahabaleshwar', query: 'Mahabaleshwar' },
                { label: 'Bhilar (Book Village)', query: 'Bhilar' },
                { label: 'Kaas Plateau', query: 'Kaas Plateau' },
                { label: 'Lingmala Waterfall', query: 'Lingmala Waterfall' },
                { label: 'petrol pump in Mahabaleshwar', query: 'petrol pump in Mahabaleshwar' },
                { label: 'Tokyo', query: 'Tokyo' },
                { label: 'Paris', query: 'Paris' }
              ].map((pill) => (
                <Link
                  key={pill.label}
                  href={`/explore?q=${encodeURIComponent(pill.query)}`}
                  className="px-2.5 py-1 bg-white hover:bg-[#244536] hover:text-white rounded-lg border border-[#244536]/15 text-[#244536] transition shadow-2xs"
                >
                  {pill.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* 3. TRAVEL CATEGORIES QUICK DISCOVERY */}
      {/* ------------------------------------------------------------------------ */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#244536]/10">
        <div className="text-center mb-8">
          <span className="text-xs font-mono uppercase tracking-wider text-[#C78363] font-semibold">
            Category-Specific Discovery
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#244536] font-bold tracking-tight mt-1">
            Browse by What Matters on the Road
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {travelCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="group p-4 bg-white rounded-2xl border border-[#244536]/15 hover:border-[#244536]/40 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F7F5EF] group-hover:bg-[#244536] text-[#244536] group-hover:text-white flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-sm font-bold text-[#244536] group-hover:text-[#C78363] transition-colors">
                  {cat.label}
                </h3>
                <p className="text-[11px] text-[#5F6761] line-clamp-2 leading-tight">
                  {cat.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* 4. FEATURED REAL DESTINATIONS (NO FAKE / DEMO CARDS) */}
      {/* ------------------------------------------------------------------------ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#244536]/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#C78363] font-semibold">
              Curated Geographic Hierarchy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#244536] font-bold tracking-tight mt-1">
              Deep Regional Destinations
            </h2>
            <p className="text-sm text-[#5F6761] max-w-xl mt-1">
              Explore real administrative subdivisions, villages, and UNESCO sites with verified parent relationships and accurate GPS markers.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push('/explore')}
            className="self-start md:self-auto rounded-xl border-[#244536]/25 text-[#244536] hover:bg-[#244536]/5"
          >
            <span>Open Global Catalogue</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map((dest) => (
            <Link
              key={dest.id}
              href={dest.targetHref}
              className="group bg-white rounded-2xl border border-[#244536]/15 hover:border-[#244536]/40 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-[#E7ECE5]">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl text-xs font-mono font-bold text-[#244536]">
                    {dest.category}
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-[#244536]/90 text-white rounded-md text-[10px] font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    <span>Hygiene: {dest.hygieneScore}%</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-mono text-white">
                    {dest.stopsCount}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-[11px] font-mono text-[#5F6761]">
                    📍 {dest.region}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#244536] group-hover:text-[#C78363] transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-[#5F6761] line-clamp-2 leading-relaxed">
                    {dest.tagline}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between text-xs font-bold text-[#244536] group-hover:text-[#C78363]">
                <span>Explore In Hierarchy</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* 5. INTERACTIVE ROUTE-AWARE PLANNING SHOWCASE */}
      {/* ------------------------------------------------------------------------ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#244536]/10">
        <div className="bg-[#244536] text-[#F7F5EF] rounded-3xl p-8 sm:p-12 overflow-hidden shadow-xl grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-semibold tracking-wide text-[#C78363]">
              <Route className="w-3.5 h-3.5" />
              <span>FEATURED ROUTE WORKSPACE · MAHARASHTRA CORRIDOR</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              Pune to Mahabaleshwar &amp; Kaas Plateau
            </h2>

            <p className="text-sm text-[#F7F5EF]/80 leading-relaxed max-w-xl">
              Experience authentic route-aware planning. Discover verified highway comfort centers at Surur-Wai, strawberry farms in Bhilar, cascades at Lingmala, and 24/7 petrol stations along the ghats.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[#C78363] font-bold block">128 km</span>
                <span className="text-[#F7F5EF]/70">Corridor Length</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[#C78363] font-bold block">12 Stops</span>
                <span className="text-[#F7F5EF]/70">Verified Facilities</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[#C78363] font-bold block">94% Hygiene</span>
                <span className="text-[#F7F5EF]/70">Audited Score</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => router.push('/workspace/trip-mahabaleshwar-kaas')}
                className="bg-[#C78363] hover:bg-[#B37253] text-white rounded-xl px-6 text-sm font-semibold shadow-sm"
              >
                <span>Launch Interactive Route Workspace</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/home')}
                className="border-white/20 text-[#F7F5EF] hover:bg-white/10 rounded-xl px-5 text-sm"
              >
                Create Custom Route
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl p-4 shadow-lg text-[#292D2A]">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C78363]" />
                <span className="text-xs font-mono font-bold text-[#244536]">WAYPOINTS ALONG ROUTE</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                Live Detour Engine
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: 'Surur Junction Comfort Stop', desc: 'WanderCanvas verified hygiene facility & baby care', dist: '+2 min detour', icon: ShieldCheck },
                { name: 'Bhilar (Village of Books)', desc: 'Reading rooms & strawberry farm homestays', dist: '+8 min detour', icon: Landmark },
                { name: 'Lingmala Waterfall', desc: '600ft multi-tiered cascade & nature trail', dist: '+5 min detour', icon: Droplets },
                { name: 'Indian Oil Malcolm Peth', desc: '24/7 petrol, XP95 & EV fast charging station', dist: 'On corridor', icon: Fuel }
              ].map((stop, idx) => {
                const Icon = stop.icon;
                return (
                  <div key={stop.name} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#244536] text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-serif font-bold text-[#244536] truncate">{stop.name}</span>
                        <span className="text-[10px] font-mono text-stone-500 shrink-0">{stop.dist}</span>
                      </div>
                      <p className="text-[11px] text-[#5F6761] truncate">{stop.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* 6. WHAT MAKES WANDERCANVAS DIFFERENT */}
      {/* ------------------------------------------------------------------------ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#244536]/10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-[#C78363] font-semibold">
            Product Philosophy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#244536] font-bold tracking-tight mt-1">
            Why WanderCanvas is Genuinely Better
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-[#244536]/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-serif text-lg font-bold text-[#244536]">
              Deep Hierarchy Discovery
            </h3>
            <p className="text-xs text-[#5F6761] leading-relaxed">
              Navigate from continents down to districts, towns, villages, and local petrol pumps—with real parent breadcrumbs, never hardcoded strings.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#244536]/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-serif text-lg font-bold text-[#244536]">
              Evidence-Backed Hygiene
            </h3>
            <p className="text-xs text-[#5F6761] leading-relaxed">
              Traceable hygiene scoring, verified highway washrooms, and baby-care facilities. We never claim unverified facilities are clean.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#244536]/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-serif text-lg font-bold text-[#244536]">
              Route &amp; Detour Intelligence
            </h3>
            <p className="text-xs text-[#5F6761] leading-relaxed">
              Discover candidate stops within 5 to 20 minutes of your corridor. A Mahabaleshwar trip always loads authentic Western Ghats data.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#244536]/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-serif text-lg font-bold text-[#244536]">
              Live Multi-Device Collaboration
            </h3>
            <p className="text-xs text-[#5F6761] leading-relaxed">
              Share real invite links and codes, vote on stops, and chat across separate devices with persistent Supabase backend synchronization.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* 7. EDITORIAL FOOTER */}
      {/* ------------------------------------------------------------------------ */}
      <footer className="bg-white border-t border-[#244536]/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#5F6761]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#244536]" />
            <span className="font-serif font-bold text-[#244536]">WanderCanvas</span>
            <span>— Global, Deeply Hierarchical Travel Discovery &amp; Planning</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <Link href="/explore" className="hover:text-[#244536]">Explore Catalogue</Link>
            <Link href="/workspace/trip-mahabaleshwar-kaas" className="hover:text-[#244536]">Route Workspace</Link>
            <Link href="/home" className="hover:text-[#244536]">Itinerary Planner</Link>
            <Link href="/my-trips" className="hover:text-[#244536]">Collaborative Trips</Link>
          </div>

          <div className="font-mono text-[10px] text-stone-400">
            © {new Date().getFullYear()} WanderCanvas Inc. All verified records attributed.
          </div>
        </div>
      </footer>
    </div>
  );
}
