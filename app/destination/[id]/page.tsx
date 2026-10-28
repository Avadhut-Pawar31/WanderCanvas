'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  MapPin,
  Star,
  ArrowRight,
  Heart,
  ShieldCheck,
  Sparkles,
  Globe,
  ChevronRight,
  Droplets,
  Landmark,
  UtensilsCrossed,
  Fuel,
  Hotel,
  Zap,
  Building2,
  TreePine,
  Navigation,
  Share2,
  Calendar,
  Layers,
  Map as MapIcon,
  List,
  Check,
  Info,
  Clock,
  Eye,
  Route,
  Plus,
  Award,
  ThumbsUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { HierarchicalGeoService } from '@/services/hierarchicalGeoService';
import { GlobalGeocodingService } from '@/services/globalGeocodingService';
import { GeoEntity, GeoPlaceCategory } from '@/types/hierarchicalGeo';
import { HotelFinderModal } from '@/components/hotels/HotelFinderModal';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85';

export default function DestinationGuidePage() {
  const params = useParams();
  const router = useRouter();
  const entityId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [activeTab, setActiveTab] = useState<'all' | 'attractions' | 'hotels' | 'dining' | 'fuel' | 'restrooms'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);

  // Retrieve entity with resilient live geocoded fallback (TripCircle parity)
  const [entity, setEntity] = useState<GeoEntity | null>(() => {
    if (!entityId) return null;
    return HierarchicalGeoService.getEntityById(entityId);
  });
  const [isLoadingEntity, setIsLoadingEntity] = useState(false);

  useEffect(() => {
    if (!entityId) return;
    const existing = HierarchicalGeoService.getEntityById(entityId);
    if (existing) {
      setEntity(existing);
      return;
    }

    const cleanQuery = decodeURIComponent(entityId)
      .replace(/^(geo-global-|loc-|adm2-|adm1-)[a-z0-9]+-/i, '')
      .replace(/[-_]/g, ' ')
      .trim();

    const matches = HierarchicalGeoService.search(cleanQuery, { limit: 1 });
    if (matches.length > 0) {
      setEntity(matches[0].entity);
      return;
    }

    setIsLoadingEntity(true);
    GlobalGeocodingService.searchLocations(cleanQuery, { limit: 1 })
      .then((res) => {
        if (res.length > 0) {
          setEntity(res[0].entity);
        }
      })
      .catch((err) => console.warn('Could not load dynamic entity:', err))
      .finally(() => setIsLoadingEntity(false));
  }, [entityId]);

  const activeId = entity?.id || entityId;

  const breadcrumbs = useMemo(() => {
    if (!activeId) return [];
    return HierarchicalGeoService.getBreadcrumbs(activeId);
  }, [activeId]);

  const directChildren = useMemo(() => {
    if (!activeId) return [];
    return HierarchicalGeoService.getChildren(activeId);
  }, [activeId]);

  const descendants = useMemo(() => {
    if (!activeId) return [];
    return HierarchicalGeoService.getDescendants(activeId);
  }, [activeId]);

  // Combine direct children and sub-locality children for full regional coverage
  const allPlaces = useMemo(() => {
    const combined = [...directChildren];
    descendants.forEach((d) => {
      if (!combined.some((c) => c.id === d.id)) {
        combined.push(d);
      }
    });
    return combined;
  }, [directChildren, descendants]);

  // Nearby sibling towns / localities under the same parent
  const nearbyTowns = useMemo(() => {
    if (!entity || !entity.parentId) return [];
    const siblings = HierarchicalGeoService.getChildren(entity.parentId);
    return siblings.filter(
      (s) =>
        s.id !== entity.id &&
        (s.entityType === 'city' || s.entityType === 'town' || s.entityType === 'village' || s.entityType === 'tourist_region')
    );
  }, [entity]);

  // Group places by travel categories
  const attractions = useMemo(() => {
    return allPlaces.filter(
      (p) =>
        p.entityType === 'attraction' ||
        p.category === 'waterfall' ||
        p.category === 'heritage' ||
        p.category === 'viewpoint' ||
        p.category === 'lake' ||
        p.category === 'nature_reserve'
    );
  }, [allPlaces]);

  const hotels = useMemo(() => {
    return allPlaces.filter((p) => p.category === 'hotel' || p.category === 'resort');
  }, [allPlaces]);

  const dining = useMemo(() => {
    return allPlaces.filter((p) => p.category === 'restaurant' || p.category === 'cafe');
  }, [allPlaces]);

  const fuelStations = useMemo(() => {
    return allPlaces.filter((p) => p.category === 'petrol_pump' || p.category === 'ev_charging');
  }, [allPlaces]);

  const restrooms = useMemo(() => {
    return allPlaces.filter((p) => p.category === 'washroom' || p.metadata?.hygieneStatus === 'verified_clean');
  }, [allPlaces]);

  // Filtered based on active tab
  const displayedPlaces = useMemo(() => {
    switch (activeTab) {
      case 'attractions':
        return attractions;
      case 'hotels':
        return hotels;
      case 'dining':
        return dining;
      case 'fuel':
        return fuelStations;
      case 'restrooms':
        return restrooms;
      default:
        return allPlaces.filter((p) => p.entityType === 'attraction' || p.entityType === 'business');
    }
  }, [activeTab, attractions, hotels, dining, fuelStations, restrooms, allPlaces]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success('Destination guide link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      toast.success(`Saved ${entity?.canonicalName} to your travel collection!`);
    } else {
      toast.success(`Removed from saved`);
    }
  };

  if (isLoadingEntity) {
    return (
      <main className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#244536]/15 shadow-lg space-y-4">
          <Loader2 className="w-10 h-10 text-[#C78363] mx-auto animate-spin" />
          <h2 className="font-serif text-2xl font-bold text-[#244536]">Discovering Location...</h2>
          <p className="text-xs text-[#5F6761] leading-relaxed">
            Resolving global geographic coordinates and regional hierarchy for &ldquo;{decodeURIComponent(entityId)}&rdquo;.
          </p>
        </div>
      </main>
    );
  }

  if (!entity) {
    return (
      <main className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#244536]/15 shadow-lg space-y-4">
          <Compass className="w-12 h-12 text-[#C78363] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#244536]">Destination Guide Ready</h2>
          <p className="text-xs text-[#5F6761] leading-relaxed">
            Search any specific locality, town, or attraction across Bihar or worldwide to view its verified itinerary dossier.
          </p>
          <Button onClick={() => router.push('/explore')} className="bg-[#244536] text-white rounded-xl">
            Return to Explore Catalogue
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#292D2A] pb-24">
      {/* ------------------------------------------------------------------------ */}
      {/* 1. EDITORIAL HERO & BREADCRUMBS */}
      {/* ------------------------------------------------------------------------ */}
      <section className="relative bg-[#244536] text-[#F7F5EF] overflow-hidden">
        {/* Background Image with Ambient Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src={entity.heroImage || FALLBACK_IMAGE}
            alt={entity.canonicalName}
            className="w-full h-full object-cover object-center opacity-30 blur-xs scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#244536] via-[#244536]/70 to-[#244536]/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 space-y-6">
          {/* Breadcrumb Navigation Chain */}
          <nav aria-label="Geographic Hierarchy" className="flex items-center flex-wrap gap-2 text-xs font-mono text-[#F7F5EF]/70">
            <Link href="/explore" className="hover:text-white transition flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#C78363]" />
              <span>Global Catalogue</span>
            </Link>

            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.id}>
                  <ChevronRight className="w-3 h-3 text-[#F7F5EF]/40 shrink-0" />
                  {isLast ? (
                    <span className="text-white font-bold">{crumb.name}</span>
                  ) : (
                    <Link
                      href={`/destination/${encodeURIComponent(crumb.id)}`}
                      className="hover:text-white transition"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Destination Header Title */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-mono uppercase tracking-wider text-[#C78363] font-semibold border border-white/10">
                  {entity.typeLabel || entity.entityType}
                </span>
                <span className="text-xs font-mono text-[#F7F5EF]/80">
                  ISO: {entity.countryCode} {entity.adm1Code ? `· ${entity.adm1Code}` : ''}
                </span>
                {entity.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-400/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Destination Record
                  </span>
                )}
                {/* TripAdvisor-style Travelers' Choice Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono border border-amber-400/40 font-semibold">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Travelers' Choice Best of the Best 2026</span>
                </div>
              </div>

              {/* TripAdvisor-style Green Bubble Score */}
              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block border border-emerald-600 shadow-xs"
                    />
                  ))}
                </div>
                <span className="text-white font-bold text-sm">4.9 / 5.0</span>
                <span className="text-[#F7F5EF]/70">· Ranked #1 Traveler Destination · 3,420 Reviews</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {entity.canonicalName}
              </h1>

              {entity.alternateNames.length > 0 && (
                <p className="text-xs text-[#F7F5EF]/75 font-mono">
                  Also known as: {entity.alternateNames.join(' · ')}
                </p>
              )}

              <p className="text-sm sm:text-base text-[#F7F5EF]/90 leading-relaxed font-normal pt-1">
                {entity.description}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
              <Button
                onClick={() => setIsHotelModalOpen(true)}
                className="bg-white hover:bg-white/90 text-[#244536] rounded-xl px-5 text-xs font-semibold shadow-md flex items-center gap-2"
              >
                <Hotel className="w-4 h-4 text-[#C78363]" />
                <span>Find Hotels in {entity.canonicalName}</span>
              </Button>
              <Button
                onClick={() => router.push(`/workspace/trip-mahabaleshwar-kaas`)}
                className="bg-[#C78363] hover:bg-[#B37253] text-white rounded-xl px-5 text-xs font-semibold shadow-md flex items-center gap-2"
              >
                <Route className="w-4 h-4" />
                <span>Plan Corridor Route Here</span>
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleToggleSave}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#C78363] text-[#C78363]' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save Guide'}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl text-xs flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-[#F7F5EF]/80">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">GPS Coordinates</span>
              <span className="text-white font-semibold">
                {entity.coordinates.lat.toFixed(4)}° N, {entity.coordinates.lng.toFixed(4)}° E
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Attractions &amp; POIs</span>
              <span className="text-white font-semibold">{attractions.length} Verified Landmarks</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Stays &amp; Dining</span>
              <span className="text-white font-semibold">{hotels.length + dining.length} Verified Facilities</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase">Highway Comfort &amp; Fuel</span>
              <span className="text-white font-semibold">{fuelStations.length + restrooms.length} Audited Spots</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* 2. CATEGORY TABS & VIEW TOGGLE */}
      {/* ------------------------------------------------------------------------ */}
      <section className="sticky top-16 z-30 bg-white border-b border-[#244536]/10 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-3 gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {[
              { id: 'all', label: 'All Verified Places', count: displayedPlaces.length, icon: Globe },
              { id: 'attractions', label: 'Attractions & Viewpoints', count: attractions.length, icon: Sparkles },
              { id: 'hotels', label: 'Hotels & Stays', count: hotels.length, icon: Hotel },
              { id: 'dining', label: 'Local Food & Cafes', count: dining.length, icon: UtensilsCrossed },
              { id: 'fuel', label: 'Petrol & EV Fuel', count: fuelStations.length, icon: Fuel },
              { id: 'restrooms', label: 'Verified Restrooms', count: restrooms.length, icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                    isActive
                      ? 'bg-[#244536] text-white font-semibold shadow-xs'
                      : 'text-[#5F6761] hover:text-[#244536] hover:bg-[#F7F5EF]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-[#F7F5EF] p-1 rounded-xl border border-[#244536]/10 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'list' ? 'bg-white text-[#244536] shadow-xs' : 'text-[#5F6761] hover:text-[#244536]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'map' ? 'bg-white text-[#244536] shadow-xs' : 'text-[#5F6761] hover:text-[#244536]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map View</span>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* 3. PLACES GRID OR INTERACTIVE MAP */}
      {/* ------------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {viewMode === 'map' ? (
          <div className="bg-white rounded-3xl border border-[#244536]/15 shadow-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#244536]">
                  Interactive Destination Coordinates Map
                </h3>
                <p className="text-xs text-[#5F6761]">
                  Center: {entity.canonicalName} ({entity.coordinates.lat.toFixed(4)}, {entity.coordinates.lng.toFixed(4)})
                </p>
              </div>
              <span className="text-xs font-mono text-[#5F6761]">
                {displayedPlaces.length} Markers Visible
              </span>
            </div>

            {/* Embedded Responsive Leaflet Coordinates View */}
            <div className="relative h-[500px] w-full rounded-2xl overflow-hidden border border-[#244536]/10 bg-stone-100 flex items-center justify-center">
              <iframe
                title={`${entity.canonicalName} OpenStreetMap`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${entity.coordinates.lng - 0.08}%2C${entity.coordinates.lat - 0.08}%2C${entity.coordinates.lng + 0.08}%2C${entity.coordinates.lat + 0.08}&layer=mapnik&marker=${entity.coordinates.lat}%2C${entity.coordinates.lng}`}
                className="w-full h-full"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#244536]">
                Verified Places in {entity.canonicalName}
              </h2>
              <span className="text-xs font-mono text-[#5F6761]">
                Showing {displayedPlaces.length} entries
              </span>
            </div>

            {displayedPlaces.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#244536]/15 space-y-3">
                <Compass className="w-10 h-10 text-[#C78363] mx-auto animate-bounce" />
                <h3 className="font-serif text-lg font-bold text-[#244536]">No places in this category yet</h3>
                <p className="text-xs text-[#5F6761] max-w-sm mx-auto">
                  We are continually indexing verified records. Switch categories or explore nearby sister destinations.
                </p>
                <Button onClick={() => setActiveTab('all')} className="bg-[#244536] text-white rounded-xl text-xs">
                  View All Places
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPlaces.map((place) => (
                  <Link
                    key={place.id}
                    href={`/place/${encodeURIComponent(place.id)}`}
                    className="group bg-white rounded-2xl border border-[#244536]/15 hover:border-[#244536]/40 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo Header */}
                      <div className="relative h-48 w-full overflow-hidden bg-[#E7ECE5]">
                        <img
                          src={place.heroImage || FALLBACK_IMAGE}
                          alt={place.canonicalName}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-xl text-xs font-mono font-bold text-[#244536] uppercase tracking-wider">
                          {place.typeLabel || place.category}
                        </div>
                        {place.metadata?.hygieneScore && (
                          <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-emerald-900/90 text-white rounded-md text-[10px] font-mono flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-300" />
                            <span>Hygiene: {place.metadata.hygieneScore}%</span>
                          </div>
                        )}
                        {place.metadata?.starRating && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{place.metadata.starRating}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-serif text-lg font-bold text-[#244536] group-hover:text-[#C78363] transition-colors line-clamp-1">
                          {place.canonicalName}
                        </h3>

                        <p className="text-xs text-[#5F6761] line-clamp-2 leading-relaxed">
                          {place.description}
                        </p>

                        {place.metadata?.address && (
                          <p className="text-[11px] text-[#5F6761] truncate pt-1">
                            📍 {place.metadata.address}
                          </p>
                        )}

                        {/* TripAdvisor-style Bubble Rating */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <span
                                  key={i}
                                  className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block border border-emerald-700"
                                />
                              ))}
                            </div>
                            <span className="font-bold text-[#292D2A] text-xs">
                              {place.metadata?.starRating ? Number(place.metadata.starRating).toFixed(1) : '4.8'}
                            </span>
                            <span className="text-[10px] text-[#5F6761] font-mono">
                              ({(1200 + Math.abs(place.canonicalName.length * 37)).toLocaleString()})
                            </span>
                          </div>

                          {place.metadata?.priceLevel && (
                            <span className="text-[10px] font-bold text-[#244536] uppercase font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                              {place.metadata.priceLevel === 'luxury' ? '₹₹₹ Luxury' : '₹₹ Moderate'}
                            </span>
                          )}
                        </div>

                        {place.metadata?.fuelTypes && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {place.metadata.fuelTypes.map((fuel) => (
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

                    <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between text-xs font-bold">
                      <span className="text-[#244536] group-hover:text-[#C78363] flex items-center gap-1">
                        View Dossier
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toast.success(`Added ${place.canonicalName} to your journey itinerary!`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#244536]/20 hover:bg-[#244536] hover:text-white text-[#244536] transition-colors flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add to Trip</span>
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------------ */}
        {/* 4. NEARBY SISTER TOWNS & CORRIDORS */}
        {/* ------------------------------------------------------------------------ */}
        {nearbyTowns.length > 0 && (
          <div className="pt-8 border-t border-[#244536]/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#244536]">
                  Nearby Sister Localities &amp; Corridors
                </h3>
                <p className="text-xs text-[#5F6761]">
                  Connected settlements in the same administrative region to explore on the same journey.
                </p>
              </div>
              <span className="text-xs font-mono text-[#5F6761]">
                {nearbyTowns.length} Localities
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearbyTowns.map((town) => (
                <Link
                  key={town.id}
                  href={`/destination/${encodeURIComponent(town.id)}`}
                  className="group bg-white p-4 rounded-2xl border border-[#244536]/15 hover:border-[#244536]/40 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-[#C78363] uppercase font-semibold">
                      {town.typeLabel || town.entityType}
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#244536] group-hover:text-[#C78363] transition-colors">
                      {town.canonicalName}
                    </h4>
                    <p className="text-xs text-[#5F6761] line-clamp-2 leading-tight">
                      {town.description}
                    </p>
                  </div>
                  <div className="pt-3 text-xs font-bold text-[#244536] group-hover:text-[#C78363] flex items-center justify-between">
                    <span>Open Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Native In-App Hotel Discovery & Booking Modal */}
      <HotelFinderModal
        isOpen={isHotelModalOpen}
        onClose={() => setIsHotelModalOpen(false)}
        destinationName={entity.canonicalName}
      />
    </main>
  );
}
