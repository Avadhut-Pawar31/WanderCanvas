'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
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
  Car,
  Fuel,
  Hotel,
  Droplets,
  Zap,
  Navigation,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ExploreService } from '@/services/exploreService';
import { HierarchicalGeoService } from '@/services/hierarchicalGeoService';
import { GlobalHierarchicalSearch } from '@/components/search/GlobalHierarchicalSearch';
import { 
  GeoEntity, 
  GeoEntityType, 
  GeoPlaceCategory, 
  HierarchicalBrowseState 
} from '@/types/hierarchicalGeo';
import { ContinentId, CountryCategory, Country } from '@/types/geography';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=85';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation state (Hierarchical Entity Drill-Down)
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<GeoPlaceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [selectedDetailEntity, setSelectedDetailEntity] = useState<GeoEntity | null>(null);

  // Initialize search or entity from URL query parameters
  useEffect(() => {
    const entityId = searchParams.get('entityId');
    const q = searchParams.get('q');

    if (entityId) {
      setActiveEntityId(entityId);
    }
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Hierarchical browse state from HierarchicalGeoService
  const browseState: HierarchicalBrowseState = useMemo(() => {
    return HierarchicalGeoService.getBrowseState(activeEntityId || undefined);
  }, [activeEntityId]);

  // Current entity if selected
  const currentEntity = browseState.currentEntity;
  const breadcrumbs = browseState.breadcrumbs;

  // Filtered children based on active category
  const filteredLocalities = useMemo(() => {
    if (selectedCategoryFilter === 'all') return browseState.childLocalities;
    return browseState.childLocalities.filter((loc) => loc.category === selectedCategoryFilter);
  }, [browseState.childLocalities, selectedCategoryFilter]);

  const filteredAttractions = useMemo(() => {
    if (selectedCategoryFilter === 'all') return browseState.childAttractions;
    return browseState.childAttractions.filter((att) => att.category === selectedCategoryFilter);
  }, [browseState.childAttractions, selectedCategoryFilter]);

  const filteredBusinesses = useMemo(() => {
    if (selectedCategoryFilter === 'all') return browseState.childBusinesses;
    return browseState.childBusinesses.filter((b) => {
      if (selectedCategoryFilter === 'hotel') return b.category === 'hotel' || b.category === 'resort';
      if (selectedCategoryFilter === 'restaurant') return b.category === 'restaurant' || b.category === 'cafe';
      return b.category === selectedCategoryFilter;
    });
  }, [browseState.childBusinesses, selectedCategoryFilter]);

  // Direct search results if user searched for specific string
  const directSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return HierarchicalGeoService.search(searchQuery.trim(), { limit: 18 });
  }, [searchQuery]);

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

  const handleEntityDrillDown = (entity: GeoEntity) => {
    setActiveEntityId(entity.id);
    setSelectedCategoryFilter('all');
    setSearchQuery('');
    router.push(`/explore?entityId=${encodeURIComponent(entity.id)}&q=${encodeURIComponent(entity.canonicalName)}`, { scroll: false });
  };

  const handleBreadcrumbClick = (entityId: string | null) => {
    setActiveEntityId(entityId);
    setSelectedCategoryFilter('all');
    setSearchQuery('');
    if (entityId) {
      router.push(`/explore?entityId=${encodeURIComponent(entityId)}`, { scroll: false });
    } else {
      router.push('/explore', { scroll: false });
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#292D2A] pb-24">
      {/* ------------------------------------------------------------------------ */}
      {/* 1. EDITORIAL HEADER & PROMINENT HIERARCHICAL SEARCH */}
      {/* ------------------------------------------------------------------------ */}
      <section className="bg-white border-b border-[#244536]/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb Path */}
          <nav aria-label="Geographic Hierarchy Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs font-mono text-[#5F6761]">
            <button
              type="button"
              onClick={() => handleBreadcrumbClick(null)}
              className={`hover:text-[#244536] transition flex items-center gap-1.5 font-medium ${
                !currentEntity ? 'text-[#244536] font-bold' : ''
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#244536]" />
              <span>Global Catalogue</span>
            </button>

            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.id}>
                  <ChevronRight className="w-3.5 h-3.5 text-[#5F6761]/40 flex-shrink-0" />
                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(crumb.id)}
                    className={`hover:text-[#244536] transition font-medium ${
                      isLast ? 'text-[#244536] font-bold underline decoration-[#C78363] decoration-2' : ''
                    }`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Title and Tagline */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#244536]/8 text-xs font-mono font-semibold text-[#244536] mb-2">
                <Compass className="w-3.5 h-3.5 text-[#C78363]" />
                <span>DEEP GEOGRAPHIC CATALOGUE &amp; HIERARCHICAL DISCOVERY</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#244536]">
                {currentEntity ? currentEntity.canonicalName : 'Explore The World'}
              </h1>
              <p className="text-sm sm:text-base text-[#5F6761] max-w-2xl mt-1 leading-relaxed">
                {currentEntity
                  ? currentEntity.description
                  : 'Discover verified locations from continents down to districts, towns, villages, waterfalls, and local petrol pumps.'}
              </p>
            </div>

            {/* Catalogue Scale Metrics */}
            <div className="flex items-center gap-3 bg-[#FAF8F5] px-4 py-2.5 rounded-2xl border border-[#244536]/10 text-xs font-mono text-[#5F6761]">
              <div>
                <span className="font-bold text-[#244536]">{browseState.stats.totalContinents}</span> Continents
              </div>
              <span>•</span>
              <div>
                <span className="font-bold text-[#244536]">{browseState.stats.totalCountries}</span> Countries
              </div>
              <span>•</span>
              <div>
                <span className="font-bold text-[#244536]">{browseState.stats.totalAdministrativeAreas}</span> Admin Regions
              </div>
              <span>•</span>
              <div>
                <span className="font-bold text-[#244536]">{browseState.stats.totalCitiesLocalities}</span> Localities
              </div>
            </div>
          </div>

          {/* Hero Search Bar with Global Hierarchical Autocomplete */}
          <div className="pt-2">
            <GlobalHierarchicalSearch
              variant="hero"
              initialQuery={searchQuery}
              onSelectEntity={(entity) => handleEntityDrillDown(entity)}
              placeholder="Type any continent, state, town (e.g. 'Mahabaleshwar'), village (e.g. 'Bhilar'), or 'petrol pump in Mahabaleshwar'..."
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs no-scrollbar">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5F6761] mr-1 font-semibold whitespace-nowrap">
              Filter by Category:
            </span>
            {[
              { id: 'all', label: 'All Places', icon: Globe },
              { id: 'waterfall', label: 'Waterfalls & Natural', icon: Droplets },
              { id: 'heritage', label: 'Heritage & Forts', icon: Landmark },
              { id: 'viewpoint', label: 'Viewpoints', icon: Sparkles },
              { id: 'hotel', label: 'Hotels & Resorts', icon: Hotel },
              { id: 'restaurant', label: 'Dining & Cafes', icon: UtensilsCrossed },
              { id: 'petrol_pump', label: 'Petrol & EV Fuel', icon: Fuel },
              { id: 'washroom', label: 'Clean Washrooms', icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedCategoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#244536] text-white font-semibold shadow-xs'
                      : 'bg-[#F7F5EF] text-[#244536] hover:bg-[#244536]/10 border border-[#244536]/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* 2. DIRECT SEARCH RESULTS VIEW (When search query is active) */}
      {/* ------------------------------------------------------------------------ */}
      {searchQuery.trim() && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#244536]">
              Hierarchical Matches for &ldquo;{searchQuery}&rdquo;
            </h2>
            <span className="text-xs font-mono text-[#5F6761]">
              {directSearchResults.length} matching entities found
            </span>
          </div>

          {directSearchResults.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#244536]/15 space-y-4">
              <Compass className="w-10 h-10 text-[#C78363] mx-auto animate-bounce" />
              <h3 className="font-serif text-lg font-medium text-[#244536]">
                No hierarchical places matched &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className="text-xs text-[#5F6761] max-w-md mx-auto">
                Try searching for verified destinations across Maharashtra or international hubs:
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {[
                  'Maharashtra',
                  'Satara District',
                  'Mahabaleshwar',
                  'Bhilar',
                  'Lingmala Waterfall',
                  'Kaas Plateau',
                  'petrol pump in Mahabaleshwar',
                  'Tokyo',
                  'Paris',
                  'Amalfi Coast'
                ].map((term) => (
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {directSearchResults.map(({ entity, breadcrumbs, matchType, matchedQueryToken }) => {
                const isSaved = savedNames.includes(entity.canonicalName);

                return (
                  <motion.div
                    key={entity.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white rounded-2xl border border-[#244536]/15 hover:border-[#244536]/40 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative h-48 w-full overflow-hidden bg-[#E7ECE5]">
                        <img
                          src={entity.heroImage || FALLBACK_IMAGE}
                          alt={entity.canonicalName}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSave(entity.canonicalName)}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-xl text-[#292D2A]/60 hover:text-[#C78363] hover:bg-white shadow-xs transition"
                          title={isSaved ? 'Remove from saved' : 'Save place'}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C78363] text-[#C78363]' : ''}`} />
                        </button>

                        {/* Entity Type Badge */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl border border-[#244536]/15 shadow-sm text-[11px] font-mono font-bold text-[#244536] uppercase tracking-wider">
                          {entity.typeLabel || entity.entityType}
                        </div>

                        {/* Hygiene badge */}
                        {entity.metadata?.hygieneScore && (
                          <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-[#244536]/90 backdrop-blur-sm rounded-lg text-[10px] font-mono text-white flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Hygiene: {entity.metadata.hygieneScore}%</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        {/* Breadcrumbs */}
                        {breadcrumbs.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1 text-[11px] font-mono text-[#5F6761] line-clamp-1">
                            {breadcrumbs.map((crumb, idx) => (
                              <React.Fragment key={crumb.id}>
                                <span>{crumb.name}</span>
                                {idx < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 text-stone-400" />}
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        <h3 className="font-serif text-lg font-bold text-[#244536] group-hover:text-[#C78363] transition-colors">
                          {entity.canonicalName}
                        </h3>

                        <p className="text-xs text-[#5F6761] line-clamp-2 leading-relaxed">
                          {entity.description}
                        </p>

                        {entity.metadata?.address && (
                          <p className="text-[11px] text-[#5F6761] pt-1 truncate">
                            📍 {entity.metadata.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between">
                      <Link
                        href={
                          entity.entityType === 'attraction' || entity.entityType === 'business'
                            ? `/place/${encodeURIComponent(entity.id)}`
                            : `/destination/${encodeURIComponent(entity.id)}`
                        }
                        className="text-xs font-semibold text-[#5F6761] hover:text-[#244536] flex items-center gap-1"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Place Details</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleEntityDrillDown(entity)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#244536] group-hover:text-[#C78363] transition-colors"
                      >
                        <span>Explore Hierarchy</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------------ */}
      {/* 3. BROWSABLE HIERARCHY CONTENT (BROAD TO LOCAL) */}
      {/* ------------------------------------------------------------------------ */}
      {!searchQuery.trim() && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
          {/* Subdivisions / Countries / Continents */}
          {browseState.childSubdivisions.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#244536]/10 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#244536]" />
                  <h2 className="font-serif text-2xl font-bold text-[#244536]">
                    {!currentEntity
                      ? 'Browse Continents'
                      : currentEntity.entityType === 'continent'
                      ? `Sovereign Nations in ${currentEntity.canonicalName}`
                      : `Administrative Regions in ${currentEntity.canonicalName}`}
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#5F6761]">
                  {browseState.childSubdivisions.length} Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {browseState.childSubdivisions.map((sub) => (
                  <motion.div
                    key={sub.id}
                    whileHover={{ y: -3 }}
                    onClick={() => handleEntityDrillDown(sub)}
                    className="cursor-pointer group bg-white rounded-2xl border border-[#244536]/15 hover:border-[#244536]/40 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden bg-[#E7ECE5]">
                        <img
                          src={sub.heroImage || FALLBACK_IMAGE}
                          alt={sub.canonicalName}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl text-xs font-serif font-bold text-[#244536] shadow-xs">
                          {sub.canonicalName}
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-[#244536]/90 text-white rounded-md text-[10px] font-mono">
                          {sub.typeLabel || sub.entityType}
                        </div>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <p className="text-xs text-[#5F6761] line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between text-xs font-bold text-[#244536] group-hover:text-[#C78363]">
                      <span>Open Region &rarr;</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Cities, Towns, Villages & Localities */}
          {filteredLocalities.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#244536]/10 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C78363]" />
                  <h2 className="font-serif text-2xl font-bold text-[#244536]">
                    Cities, Towns &amp; Villages
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#5F6761]">
                  {filteredLocalities.length} Localities
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredLocalities.map((loc) => (
                  <motion.div
                    key={loc.id}
                    whileHover={{ y: -3 }}
                    onClick={() => router.push(`/destination/${encodeURIComponent(loc.id)}`)}
                    className="cursor-pointer group bg-white rounded-2xl border border-[#244536]/15 hover:border-[#244536]/40 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-40 w-full overflow-hidden bg-[#E7ECE5]">
                        <img
                          src={loc.heroImage || FALLBACK_IMAGE}
                          alt={loc.canonicalName}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl text-xs font-serif font-bold text-[#244536] shadow-xs">
                          {loc.canonicalName}
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-[#244536]/90 text-white rounded-md text-[10px] font-mono">
                          {loc.typeLabel || loc.entityType}
                        </div>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <p className="text-xs text-[#5F6761] line-clamp-2 leading-relaxed">
                          {loc.description}
                        </p>
                        {loc.alternateNames.length > 0 && (
                          <p className="text-[10px] text-stone-400 font-mono truncate">
                            Aliases: {loc.alternateNames.slice(0, 2).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between text-xs font-bold text-[#244536] group-hover:text-[#C78363]">
                      <span>Open Destination Guide &rarr;</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Curated Attractions & POIs */}
          {filteredAttractions.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#244536]/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <h2 className="font-serif text-2xl font-bold text-[#244536]">
                    Curated Attractions &amp; Landmarks
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#5F6761]">
                  {filteredAttractions.length} Attractions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAttractions.map((att) => {
                  const isSaved = savedNames.includes(att.canonicalName);
                  return (
                    <motion.div
                      key={att.id}
                      className="group bg-white rounded-2xl border border-[#244536]/15 hover:border-[#244536]/40 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-48 w-full overflow-hidden bg-[#E7ECE5]">
                          <img
                            src={att.heroImage || FALLBACK_IMAGE}
                            alt={att.canonicalName}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSave(att.canonicalName)}
                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-xl text-[#292D2A]/60 hover:text-[#C78363] hover:bg-white shadow-xs transition"
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C78363] text-[#C78363]' : ''}`} />
                          </button>
                          <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl text-xs font-mono font-bold text-[#244536] shadow-xs">
                            {att.typeLabel || att.category}
                          </div>
                          {att.metadata?.hygieneScore && (
                            <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-[#244536]/90 text-white rounded-md text-[10px] font-mono flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{att.metadata.hygieneScore}% Verified</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4 space-y-2">
                          <h3 className="font-serif text-lg font-bold text-[#244536]">
                            {att.canonicalName}
                          </h3>
                          <p className="text-xs text-[#5F6761] line-clamp-2 leading-relaxed">
                            {att.description}
                          </p>
                          {att.metadata?.tags && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {att.metadata.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-[#F7F5EF] text-[#244536] rounded text-[10px] font-mono"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between">
                        <Link
                          href={`/place/${encodeURIComponent(att.id)}`}
                          className="text-xs font-semibold text-[#244536] hover:underline flex items-center gap-1"
                        >
                          <span>View Full Attraction Dossier &rarr;</span>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Real Local Businesses & Facilities (Hotels, Dining, Fuel, Washrooms) */}
          {filteredBusinesses.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#244536]/10 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-serif text-2xl font-bold text-[#244536]">
                    Real Local Businesses &amp; Verified Facilities
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#5F6761]">
                  {filteredBusinesses.length} Verified Facilities
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBusinesses.map((biz) => {
                  const isSaved = savedNames.includes(biz.canonicalName);
                  return (
                    <motion.div
                      key={biz.id}
                      className="group bg-white rounded-2xl border border-[#244536]/15 hover:border-[#244536]/40 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-44 w-full overflow-hidden bg-[#E7ECE5]">
                          <img
                            src={biz.heroImage || FALLBACK_IMAGE}
                            alt={biz.canonicalName}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSave(biz.canonicalName)}
                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-xl text-[#292D2A]/60 hover:text-[#C78363] hover:bg-white shadow-xs transition"
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C78363] text-[#C78363]' : ''}`} />
                          </button>
                          <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl text-xs font-mono font-bold text-[#244536] shadow-xs">
                            {biz.typeLabel || biz.category}
                          </div>
                          {biz.metadata?.hygieneScore && (
                            <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-emerald-800 text-white rounded-md text-[10px] font-mono flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-300" />
                              <span>{biz.metadata.hygieneScore}% Verified Clean</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4 space-y-2">
                          <h3 className="font-serif text-base font-bold text-[#244536]">
                            {biz.canonicalName}
                          </h3>
                          <p className="text-xs text-[#5F6761] line-clamp-2 leading-relaxed">
                            {biz.description}
                          </p>

                          {biz.metadata?.address && (
                            <p className="text-[11px] text-[#5F6761] truncate">
                              📍 {biz.metadata.address}
                            </p>
                          )}

                          {biz.metadata?.fuelTypes && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {biz.metadata.fuelTypes.map((fuel) => (
                                <span
                                  key={fuel}
                                  className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-mono"
                                >
                                  ⛽ {fuel}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between">
                        <Link
                          href={`/place/${encodeURIComponent(biz.id)}`}
                          className="text-xs font-semibold text-[#244536] hover:underline flex items-center gap-1"
                        >
                          <span>View Facility Data &amp; Directions &rarr;</span>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------------ */}
      {/* 4. ENTITY DETAIL MODAL */}
      {/* ------------------------------------------------------------------------ */}
      <AnimatePresence>
        {selectedDetailEntity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#244536]/15 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="relative h-64 w-full bg-[#E7ECE5] shrink-0">
                <img
                  src={selectedDetailEntity.heroImage || FALLBACK_IMAGE}
                  alt={selectedDetailEntity.canonicalName}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDetailEntity(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-md rounded-xl text-xs font-mono font-bold text-[#244536]">
                  {selectedDetailEntity.typeLabel || selectedDetailEntity.entityType}
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#244536]">
                      {selectedDetailEntity.canonicalName}
                    </h3>
                    {selectedDetailEntity.alternateNames.length > 0 && (
                      <p className="text-xs text-[#5F6761] font-mono mt-0.5">
                        Also known as: {selectedDetailEntity.alternateNames.join(', ')}
                      </p>
                    )}
                  </div>
                  {selectedDetailEntity.metadata?.hygieneScore && (
                    <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono shrink-0">
                      Hygiene: {selectedDetailEntity.metadata.hygieneScore}%
                    </div>
                  )}
                </div>

                <p className="text-sm text-[#292D2A] leading-relaxed">
                  {selectedDetailEntity.description}
                </p>

                {/* GPS Coordinates & Administrative info */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#244536]/10 grid grid-cols-2 gap-2 text-xs font-mono text-[#5F6761]">
                  <div>
                    <span className="text-[#244536] font-semibold">GPS Coordinates:</span>{' '}
                    {selectedDetailEntity.coordinates.lat.toFixed(4)}° N,{' '}
                    {selectedDetailEntity.coordinates.lng.toFixed(4)}° E
                  </div>
                  <div>
                    <span className="text-[#244536] font-semibold">Country Code:</span>{' '}
                    {selectedDetailEntity.countryCode}
                  </div>
                  <div>
                    <span className="text-[#244536] font-semibold">Data Source:</span>{' '}
                    {selectedDetailEntity.sourceType}
                  </div>
                  <div>
                    <span className="text-[#244536] font-semibold">Status:</span>{' '}
                    {selectedDetailEntity.isVerified ? '✅ Verified Record' : 'Community'}
                  </div>
                </div>

                {selectedDetailEntity.metadata?.address && (
                  <div className="text-xs text-[#5F6761]">
                    <strong>Physical Address:</strong> {selectedDetailEntity.metadata.address}
                  </div>
                )}

                {selectedDetailEntity.metadata?.fuelTypes && (
                  <div>
                    <span className="text-xs font-semibold text-[#244536]">Dispensed Fuels:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedDetailEntity.metadata.fuelTypes.map((fuel) => (
                        <span
                          key={fuel}
                          className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-mono font-medium"
                        >
                          ⛽ {fuel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#FAF8F5] border-t border-[#244536]/10 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDetailEntity(null)}
                  className="rounded-xl"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleEntityDrillDown(selectedDetailEntity);
                    setSelectedDetailEntity(null);
                  }}
                  className="bg-[#244536] hover:bg-[#1B3529] text-white rounded-xl"
                >
                  Explore In Hierarchy &rarr;
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F5EF] p-8 text-center text-xs font-mono text-[#5F6761]">
          Loading WanderCanvas Hierarchical Explore...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
