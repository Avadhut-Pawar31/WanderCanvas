'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  MapPin, 
  Star, 
  ArrowRight, 
  Heart, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  ChevronRight, 
  ChevronDown,
  ArrowLeft,
  X,
  Layers,
  Building2,
  TreePine,
  Landmark,
  UtensilsCrossed,
  Palette,
  MountainSnow,
  Car
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ExploreService } from '@/services/exploreService';
import { ContinentId, CountryCategory, Country } from '@/types/geography';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=85';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation state (Nested Hierarchy: Continent -> Country -> Administrative Subdivision)
  const [expandedContinentId, setExpandedContinentId] = useState<ContinentId | null>('asia');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedSubdivisionId, setSelectedSubdivisionId] = useState<string | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CountryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedNames, setSavedNames] = useState<string[]>([]);

  // Initialize search from URL query parameter (e.g. from Navbar search or direct links)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      setSelectedCountryId(null);
      setSelectedSubdivisionId('all');
      setSelectedCategory('all');
    }
  }, [searchParams]);

  // Metadata retrieval
  const continents = useMemo(() => ExploreService.getContinents(), []);
  
  const activeCountry = useMemo(() => {
    if (!selectedCountryId) return null;
    return ExploreService.getCountryById(selectedCountryId);
  }, [selectedCountryId]);

  const activeContinent = useMemo(() => {
    if (activeCountry) {
      return ExploreService.getContinentById(activeCountry.continentId);
    }
    if (expandedContinentId) {
      return ExploreService.getContinentById(expandedContinentId);
    }
    return null;
  }, [activeCountry, expandedContinentId]);

  // Filtered destinations for the active country/continent view
  const filteredDestinations = useMemo(() => {
    return ExploreService.getDestinations({
      continentId: activeCountry ? activeCountry.continentId : (expandedContinentId || undefined),
      countryId: selectedCountryId || undefined,
      subdivisionId: selectedSubdivisionId,
      category: selectedCategory,
      searchQuery: searchQuery.trim() || undefined,
    });
  }, [activeCountry, expandedContinentId, selectedCountryId, selectedSubdivisionId, selectedCategory, searchQuery]);

  // Global search destinations across all continents when search query is typed
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return ExploreService.getDestinations({
      searchQuery: searchQuery.trim(),
    });
  }, [searchQuery]);

  // Global derived stats
  const stats = useMemo(() => ExploreService.getStats(), []);

  // Save / Bookmark handler
  const toggleSave = (name: string) => {
    const exists = savedNames.includes(name);
    if (exists) {
      setSavedNames((prev) => prev.filter((n) => n !== name));
      toast.success(`Removed ${name} from saved`);
    } else {
      setSavedNames((prev) => [...prev, name]);
      toast.success(`Saved ${name} to your collection!`);
    }
  };

  // Category Icon helper
  const getCategoryIcon = (cat: CountryCategory) => {
    switch (cat) {
      case 'regions-cities': return <Building2 className="w-3.5 h-3.5" />;
      case 'natural-attractions': return <TreePine className="w-3.5 h-3.5" />;
      case 'heritage-history': return <Landmark className="w-3.5 h-3.5" />;
      case 'regional-cuisine': return <UtensilsCrossed className="w-3.5 h-3.5" />;
      case 'arts-architecture': return <Palette className="w-3.5 h-3.5" />;
      case 'adventure-outdoors': return <MountainSnow className="w-3.5 h-3.5" />;
      case 'road-trips': return <Car className="w-3.5 h-3.5" />;
      default: return <Compass className="w-3.5 h-3.5" />;
    }
  };

  // All destinations for the currently selected country
  const countryDestinations = useMemo(() => {
    if (!selectedCountryId) return [];
    return ExploreService.getDestinations({ countryId: selectedCountryId });
  }, [selectedCountryId]);

  // Destinations within the current subdivision scope
  const activeScopeDestinations = useMemo(() => {
    if (!selectedCountryId) return [];
    if (selectedSubdivisionId === 'all') return countryDestinations;
    return countryDestinations.filter((d) => d.subdivisionId === selectedSubdivisionId);
  }, [countryDestinations, selectedCountryId, selectedSubdivisionId]);

  const handleSubdivisionSelect = (subId: string) => {
    setSelectedSubdivisionId(subId);
    if (selectedCategory !== 'all') {
      const exists = countryDestinations.some(
        (d) => (subId === 'all' || d.subdivisionId === subId) && d.category === selectedCategory
      );
      if (!exists) {
        setSelectedCategory('all');
      }
    }
  };

  const handleContinentToggle = (continentId: ContinentId) => {
    if (expandedContinentId === continentId) {
      setExpandedContinentId(null);
    } else {
      setExpandedContinentId(continentId);
    }
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountryId(country.id);
    setExpandedContinentId(country.continentId);
    setSelectedSubdivisionId('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const handleBackToCatalogue = () => {
    setSelectedCountryId(null);
    setSelectedSubdivisionId('all');
    setSelectedCategory('all');
  };

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#292D2A] pb-24">
      {/* ------------------------------------------------------------------------ */}
      {/* HEADER & BREADCRUMB NAVIGATION */}
      {/* ------------------------------------------------------------------------ */}
      <section className="bg-white border-b border-[#244536]/10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Breadcrumb Path */}
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs font-mono text-[#5F6761]">
            <button
              type="button"
              onClick={() => {
                setSelectedCountryId(null);
                setSelectedSubdivisionId('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="hover:text-[#244536] transition flex items-center gap-1.5 font-medium"
            >
              <Globe className="w-3.5 h-3.5 text-[#244536]" />
              <span>Explore Catalogue</span>
            </button>

            {activeContinent && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#5F6761]/40" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCountryId(null);
                    setSelectedSubdivisionId('all');
                    setSelectedCategory('all');
                    setExpandedContinentId(activeContinent.id);
                  }}
                  className={`hover:text-[#244536] transition font-medium ${
                    !activeCountry ? 'text-[#244536] font-bold' : ''
                  }`}
                >
                  {activeContinent.name}
                </button>
              </>
            )}

            {activeCountry && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#5F6761]/40" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubdivisionId('all');
                    setSelectedCategory('all');
                  }}
                  className={`hover:text-[#244536] transition font-medium ${
                    selectedSubdivisionId === 'all' ? 'text-[#244536] font-bold' : ''
                  }`}
                >
                  {activeCountry.flag} {activeCountry.name} ({activeCountry.isoCode})
                </button>
              </>
            )}

            {activeCountry && selectedSubdivisionId !== 'all' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#5F6761]/40" />
                <span className="text-[#244536] font-bold">
                  {activeCountry.subdivisions.find((s) => s.id === selectedSubdivisionId)?.name || selectedSubdivisionId}
                </span>
              </>
            )}
          </nav>

          {/* Dynamic Editorial Title & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {activeCountry ? (
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#244536]/10 text-[#244536] text-xs font-mono uppercase tracking-wider mb-2">
                    <span>{activeCountry.flag}</span>
                    <span>{activeCountry.continentId.toUpperCase()} • ISO {activeCountry.isoCode} • {activeCountry.capital}</span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#244536]">
                    {activeCountry.name}
                  </h1>
                  <p className="text-sm sm:text-base text-[#5F6761] mt-1.5 max-w-2xl leading-relaxed">
                    {activeCountry.description}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#244536]/10 text-[#244536] text-xs font-mono uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#C78363]" />
                    <span>Nested Geographic Catalogue</span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#244536] tracking-tight">
                    Explore the World by Continent &amp; Country
                  </h1>
                  <p className="text-sm sm:text-base text-[#5F6761] mt-1.5 max-w-2xl leading-relaxed">
                    A balanced global travel discovery system. Discover world wonders like the Taj Mahal, Eiffel Tower, and Colosseum, alongside authentic local hill circuits and cultural sanctuaries.
                  </p>
                </div>
              )}
            </div>

            {/* Global Search Bar */}
            <div className="relative w-full md:w-96">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#244536]/50 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Eiffel, Taj Mahal, Mahabaleshwar, 7 Wonders..."
                className="w-full pl-10 pr-9 py-2.5 bg-[#F7F5EF] rounded-xl border border-[#244536]/15 text-xs text-[#292D2A] placeholder:text-[#5F6761]/60 focus:outline-hidden focus:border-[#244536] focus:bg-white transition shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5F6761]/60 hover:text-[#292D2A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Trending Discovery Quick Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#244536]/8">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5F6761] mr-1 font-semibold">
              Popular Circuits:
            </span>
            {[
              { label: '🏛️ The 7 Wonders', query: '7 Wonders' },
              { label: '🗼 Eiffel Tower', query: 'Eiffel Tower' },
              { label: '🕌 Taj Mahal', query: 'Taj Mahal' },
              { label: '🍓 Mahabaleshwar', query: 'Mahabaleshwar' },
              { label: '🏺 Colosseum', query: 'Colosseum' },
              { label: '🪨 Petra', query: 'Petra' },
              { label: '⛰️ Machu Picchu', query: 'Machu Picchu' },
              { label: '🧗 Mont Blanc', query: 'Mont Blanc' },
              { label: '🌿 Living Root Bridges', query: 'Living Root Bridge' },
              { label: '🎭 Regional Heritage', query: 'heritage' },
            ].map((pill) => (
              <button
                key={pill.query}
                type="button"
                onClick={() => {
                  setSelectedCountryId(null);
                  setSelectedSubdivisionId('all');
                  setSelectedCategory('all');
                  setSearchQuery(pill.query);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  searchQuery.toLowerCase() === pill.query.toLowerCase()
                    ? 'bg-[#244536] text-white font-semibold shadow-xs'
                    : 'bg-[#F7F5EF] text-[#244536] hover:bg-[#244536]/10 border border-[#244536]/10'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* SEARCH RESULTS VIEW (When query is active) */}
      {/* ------------------------------------------------------------------------ */}
      {searchQuery.trim() ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#244536]">
              Search Results for &ldquo;{searchQuery}&rdquo;
            </h2>
            <span className="text-xs font-mono text-[#5F6761]">
              {searchResults.length} {searchResults.length === 1 ? 'place' : 'places'} found
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#244536]/15 space-y-4">
              <Compass className="w-8 h-8 text-[#C78363] mx-auto animate-bounce" />
              <h3 className="font-serif text-lg font-medium text-[#244536]">No destinations matched &ldquo;{searchQuery}&rdquo;</h3>
              <p className="text-xs text-[#5F6761] max-w-md mx-auto">
                Try searching for world icons and regional highlights:
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {['Eiffel Tower', 'Taj Mahal', 'Mahabaleshwar', 'Colosseum', 'Machu Picchu', 'Petra', 'Great Wall', 'Zermatt'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSearchQuery(term)}
                    className="px-3 py-1 bg-[#F7F5EF] hover:bg-[#244536] hover:text-white text-[#244536] rounded-lg text-xs font-mono transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-4 py-2 bg-[#244536] text-white rounded-xl text-xs font-medium"
                >
                  Clear Search Query
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((destination) => {
                const isSaved = savedNames.includes(destination.name);
                const country = ExploreService.getCountryById(destination.countryId);
                const subdivision = country?.subdivisions.find((s) => s.id === destination.subdivisionId);

                return (
                  <motion.div
                    key={destination.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white rounded-2xl border border-[#244536]/10 hover:border-[#244536]/30 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-52 w-full overflow-hidden bg-[#E7ECE5]">
                        <img
                          src={destination.image}
                          alt={destination.name}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSave(destination.name)}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-xl text-[#292D2A]/60 hover:text-[#C78363] hover:bg-white shadow-xs transition"
                          title={isSaved ? 'Remove from saved' : 'Save destination'}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C78363] text-[#C78363]' : ''}`} />
                        </button>
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl border border-[#244536]/15 shadow-sm flex items-center gap-1 text-[11px] font-bold text-[#244536]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#244536]" />
                          <span>{destination.hygieneScore}/100</span>
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
                          {country && (
                            <span className="px-2 py-0.5 bg-[#C78363]/95 backdrop-blur-sm rounded-lg text-[10px] font-mono uppercase tracking-wider text-white font-medium">
                              {country.flag} {country.name}
                            </span>
                          )}
                          {subdivision && (
                            <span className="px-2 py-0.5 bg-[#244536]/90 backdrop-blur-sm rounded-lg text-[10px] font-mono uppercase tracking-wider text-white font-medium">
                              {subdivision.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-base font-bold text-[#292D2A] group-hover:text-[#244536] transition-colors line-clamp-1">
                            {destination.name}
                          </h3>
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 rounded-md border border-amber-200/60 text-amber-800 text-[11px] font-semibold shrink-0">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{destination.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#5F6761] line-clamp-2 leading-relaxed">
                          {destination.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (country) {
                            handleSelectCountry(country);
                            if (subdivision) {
                              setSelectedSubdivisionId(subdivision.id);
                            }
                            setSearchQuery('');
                          }
                        }}
                        className="text-xs font-mono text-[#244536] hover:underline"
                      >
                        Explore {country?.name || 'Country'}
                      </button>
                      <Button
                        onClick={() => router.push(`/home?destination=${encodeURIComponent(destination.name)}`)}
                        className="bg-[#244536] text-white hover:bg-[#1B3529] rounded-xl px-3 py-1 text-xs font-medium gap-1 shadow-xs"
                      >
                        <span>Plan Route</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      ) : activeCountry ? (
        /* ------------------------------------------------------------------------ */
        /* LEVEL 3 & 4: DEDICATED COUNTRY LEVEL DISCOVERY WORKSPACE */
        /* ------------------------------------------------------------------------ */
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          {/* Back button & Country Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBackToCatalogue}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#244536]/15 hover:border-[#244536] text-xs font-medium text-[#244536] transition shadow-xs self-start"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {activeContinent?.name || 'Continent'}</span>
            </button>

            <div className="flex items-center gap-4 text-xs font-mono text-[#5F6761]">
              <span>Currency: <strong className="text-[#244536]">{activeCountry.currency}</strong></span>
              <span>•</span>
              <span>Capital: <strong className="text-[#244536]">{activeCountry.capital}</strong></span>
              <span>•</span>
              <span>ISO: <strong className="text-[#244536]">{activeCountry.isoCode}</strong></span>
            </div>
          </div>

          {/* Level 3: Administrative Subdivisions Bar */}
          <div className="bg-white rounded-3xl border border-[#244536]/15 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#244536] font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C78363]" />
                <span>{activeCountry.subdivisionLabel} ({activeCountry.subdivisions.length})</span>
              </h2>
              {selectedSubdivisionId !== 'all' && (
                <button
                  type="button"
                  onClick={() => handleSubdivisionSelect('all')}
                  className="text-xs text-[#C78363] hover:underline"
                >
                  Show All {activeCountry.subdivisionLabel}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => handleSubdivisionSelect('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedSubdivisionId === 'all'
                    ? 'bg-[#244536] text-white font-semibold shadow-xs'
                    : 'bg-[#F7F5EF] text-[#292D2A] hover:bg-[#244536]/10'
                }`}
              >
                <span>All {activeCountry.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  selectedSubdivisionId === 'all' ? 'bg-white/20' : 'bg-black/5'
                }`}>
                  {countryDestinations.length}
                </span>
              </button>

              {activeCountry.subdivisions.map((sub) => {
                const isSelected = selectedSubdivisionId === sub.id;
                const subCount = countryDestinations.filter((d) => d.subdivisionId === sub.id).length;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSubdivisionSelect(sub.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#244536] text-white font-semibold shadow-xs'
                        : 'bg-[#F7F5EF] text-[#292D2A] hover:bg-[#244536]/10'
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20' : 'bg-black/5'
                    }`}>
                      {subCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level 4: Country-Specific Discovery Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-[#C78363] text-white font-semibold shadow-xs'
                  : 'bg-white text-[#292D2A] border border-[#244536]/15 hover:bg-[#244536]/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Highlights</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                selectedCategory === 'all' ? 'bg-white/20' : 'bg-black/5'
              }`}>
                {activeScopeDestinations.length}
              </span>
            </button>

            {activeCountry.supportedCategories.map((catKey) => {
              const meta = ExploreService.getCategoryMeta(catKey);
              const isSelected = selectedCategory === catKey;
              const count = activeScopeDestinations.filter((d) => d.category === catKey).length;
              if (count === 0 && selectedCategory !== catKey) return null;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#C78363] text-white font-semibold shadow-xs'
                      : 'bg-white text-[#292D2A] border border-[#244536]/15 hover:bg-[#244536]/5'
                  }`}
                >
                  {getCategoryIcon(catKey)}
                  <span>{meta.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20' : 'bg-black/5'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Destination Cards Grid for Country */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-[#244536]">
                {selectedSubdivisionId === 'all'
                  ? `Curated Itineraries in ${activeCountry.name}`
                  : `${activeCountry.subdivisions.find((s) => s.id === selectedSubdivisionId)?.name} Corridors`}
              </h3>
              <span className="text-xs font-mono text-[#5F6761]">
                {filteredDestinations.length} {filteredDestinations.length === 1 ? 'place' : 'places'} found
              </span>
            </div>

            {filteredDestinations.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-[#244536]/15 space-y-3">
                <Compass className="w-7 h-7 text-[#C78363] mx-auto animate-bounce" />
                <h4 className="font-serif text-base font-medium text-[#244536]">No destinations matched the selected category</h4>
                <p className="text-xs text-[#5F6761] max-w-sm mx-auto">
                  Try switching back to &ldquo;All Highlights&rdquo; or selecting another administrative subdivision.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubdivisionId('all');
                    setSelectedCategory('all');
                  }}
                  className="px-3.5 py-1.5 bg-[#244536] text-white rounded-xl text-xs font-medium"
                >
                  Show All {activeCountry.name} Places
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map((destination, index) => {
                  const isSaved = savedNames.includes(destination.name);
                  const subdivision = activeCountry.subdivisions.find((s) => s.id === destination.subdivisionId);

                  return (
                    <motion.div
                      key={destination.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      className="group bg-white rounded-2xl border border-[#244536]/10 hover:border-[#244536]/30 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-56 w-full overflow-hidden bg-[#E7ECE5]">
                          <img
                            src={destination.image}
                            alt={destination.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSave(destination.name)}
                            className="absolute top-3.5 right-3.5 p-2 bg-white/90 backdrop-blur-md rounded-xl text-[#292D2A]/60 hover:text-[#C78363] hover:bg-white shadow-xs transition"
                            title={isSaved ? 'Remove from saved' : 'Save destination'}
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C78363] text-[#C78363]' : ''}`} />
                          </button>
                          <div className="absolute top-3.5 left-3.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl border border-[#244536]/15 shadow-sm flex items-center gap-1 text-[11px] font-bold text-[#244536]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#244536]" />
                            <span>{destination.hygieneScore}/100</span>
                          </div>
                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-1 bg-[#244536]/90 backdrop-blur-sm rounded-lg text-[10px] font-mono uppercase tracking-wider text-white font-medium flex items-center gap-1">
                              {getCategoryIcon(destination.category)}
                              <span>{destination.categoryLabel || destination.category}</span>
                            </span>
                            {subdivision && (
                              <span className="px-2 py-1 bg-[#C78363]/90 backdrop-blur-sm rounded-lg text-[10px] font-mono uppercase tracking-wider text-white font-medium">
                                {subdivision.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-serif text-lg font-bold text-[#292D2A] group-hover:text-[#244536] transition-colors line-clamp-1">
                                {destination.name}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs text-[#292D2A]/60 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-[#C78363] shrink-0" />
                                <span className="truncate">{subdivision?.name || activeCountry.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-200/60 text-amber-800 text-xs font-semibold shrink-0">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{destination.rating}</span>
                            </div>
                          </div>

                          <p className="text-xs text-[#292D2A]/70 line-clamp-2 leading-relaxed">
                            {destination.description}
                          </p>

                          <div className="flex items-center justify-between text-[11px] pt-1 text-[#5F6761]">
                            <span>Best time: <strong className="text-[#244536]">{destination.bestSeason}</strong></span>
                            <span className="text-emerald-700 font-medium">✓ {destination.hygieneStatus}</span>
                          </div>

                          <div className="pt-2 border-t border-[#244536]/8 flex flex-wrap gap-1.5">
                            {destination.highlights.map((h) => (
                              <span key={h} className="text-[10px] px-2 py-0.5 bg-[#F7F5EF] text-[#244536] rounded-md font-mono">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between gap-3">
                        <div className="text-[11px] text-[#292D2A]/50 font-mono">
                          {destination.reviews.toLocaleString()} reviews
                        </div>
                        <Button
                          onClick={() => router.push(`/home?destination=${encodeURIComponent(destination.name)}`)}
                          className="bg-[#244536] text-white hover:bg-[#1B3529] rounded-xl px-4 py-1.5 text-xs font-medium gap-1.5 shadow-xs"
                        >
                          <span>Plan Route</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ) : (
        /* ------------------------------------------------------------------------ */
        /* PRIMARY EXPLORE CATALOGUE: NESTED CONTINENT CARDS HIERARCHY */
        /* ------------------------------------------------------------------------ */
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#C78363]" />
              <h2 className="font-serif text-2xl font-bold text-[#244536]">
                Global Geographic Catalogue
              </h2>
            </div>
            <span className="text-xs font-mono text-[#5F6761]">
              {stats.continentsCount} Continents · {stats.countriesCount} Countries · {stats.destinationsCount} Verified Places
            </span>
          </div>

          {/* Accordion / Nested Stack of Continent Cards */}
          <div className="space-y-6">
            {continents.map((continent) => {
              const isExpanded = expandedContinentId === continent.id;
              const countriesInContinent = ExploreService.getCountries(continent.id);
              const destinationsInContinent = ExploreService.getDestinations({ continentId: continent.id });

              return (
                <div
                  key={continent.id}
                  className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs ${
                    isExpanded 
                      ? 'border-[#244536]/40 shadow-md ring-1 ring-[#244536]/10' 
                      : 'border-[#244536]/15 hover:border-[#244536]/30'
                  }`}
                >
                  {/* CONTINENT CARD BANNER / HEADER */}
                  <div
                    onClick={() => handleContinentToggle(continent.id)}
                    className="cursor-pointer relative overflow-hidden"
                  >
                    <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#244536]">
                      <img
                        src={continent.heroImage}
                        alt={continent.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                          isExpanded ? 'scale-105 opacity-40' : 'opacity-50 hover:scale-102'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#244536] via-[#244536]/60 to-transparent" />

                      {/* Content Overlay */}
                      <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between text-white">
                        <div className="flex items-start justify-between">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-mono tracking-wider">
                            <span>CODE: {continent.code}</span>
                            <span>•</span>
                            <span>{countriesInContinent.length} {countriesInContinent.length === 1 ? 'Country' : 'Countries'}</span>
                          </div>

                          {/* Expand/Collapse Toggle Button */}
                          <div
                            role="button"
                            tabIndex={0}
                            aria-expanded={isExpanded}
                            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${continent.name}`}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#244536] text-xs font-semibold shadow-sm hover:bg-[#FAF8F5] transition"
                          >
                            <span>{isExpanded ? 'Collapse Countries' : 'Explore Countries'}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        <div>
                          <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span>{continent.name}</span>
                          </h3>
                          <p className="text-xs sm:text-sm text-white/85 line-clamp-1 sm:line-clamp-2 mt-1 max-w-2xl leading-relaxed">
                            {continent.description}
                          </p>
                          <div className="text-[11px] font-mono text-[#C78363] mt-2 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{destinationsInContinent.length} Curated Destination Corridors &amp; Circuits</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ------------------------------------------------------------------------ */}
                  {/* NESTED CONTENT: COUNTRIES DIRECTLY INSIDE CONTINENT CARD */}
                  {/* ------------------------------------------------------------------------ */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="bg-[#FAF8F5] border-t border-[#244536]/15 p-5 sm:p-7 space-y-5"
                      >
                        <div className="flex items-center justify-between border-b border-[#244536]/10 pb-3">
                          <div className="flex items-center gap-2">
                            <Compass className="w-4 h-4 text-[#C78363]" />
                            <h4 className="font-serif text-lg font-bold text-[#244536]">
                              Countries &amp; Regions in {continent.name}
                            </h4>
                          </div>
                          <span className="text-xs font-mono text-[#5F6761]">
                            {countriesInContinent.length} Represented
                          </span>
                        </div>

                        {/* Responsive Grid of Country Cards Nested Inside Continent */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {countriesInContinent.map((country) => {
                            const countryDestinationsCount = ExploreService.getDestinations({ countryId: country.id }).length;

                            return (
                              <motion.div
                                key={country.id}
                                whileHover={{ y: -3 }}
                                className="group bg-white rounded-2xl border border-[#244536]/15 hover:border-[#244536]/40 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                              >
                                <div>
                                  {/* Country Card Photo */}
                                  <div className="relative h-40 w-full overflow-hidden bg-[#E7ECE5]">
                                    <img
                                      src={country.heroImage}
                                      alt={country.name}
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                                      }}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                    {/* Country Flag & Name Badge */}
                                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl text-xs font-medium text-[#244536] shadow-xs flex items-center gap-1.5">
                                      <span className="text-base">{country.flag}</span>
                                      <span className="font-serif font-bold">{country.name}</span>
                                      <span className="text-[10px] font-mono text-[#5F6761]">[{country.isoCode}]</span>
                                    </div>

                                    {/* Subdivisions count badge */}
                                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-[#244536]/90 text-white rounded-md text-[10px] font-mono">
                                      {country.subdivisions.length} {country.subdivisionLabel}
                                    </div>
                                  </div>

                                  {/* Country Card Info */}
                                  <div className="p-4 space-y-2">
                                    <h5 className="font-serif text-sm font-bold text-[#244536] group-hover:text-[#C78363] transition-colors line-clamp-1">
                                      {country.tagline}
                                    </h5>
                                    <p className="text-xs text-[#5F6761] line-clamp-2 leading-relaxed">
                                      {country.description}
                                    </p>
                                    <div className="text-[11px] font-mono text-[#5F6761] pt-1">
                                      Currency: <strong>{country.currency}</strong> · Capital: <strong>{country.capital}</strong>
                                    </div>
                                  </div>
                                </div>

                                {/* Country Card Footer Action */}
                                <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-mono text-[#5F6761]">
                                    {countryDestinationsCount} places
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectCountry(country)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#244536] group-hover:text-[#C78363] transition-colors"
                                  >
                                    <span>Explore {country.name}</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F5EF] p-8 text-center text-xs font-mono text-[#5F6761]">Loading WanderCanvas Explore...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
