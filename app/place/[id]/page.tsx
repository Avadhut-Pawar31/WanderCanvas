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
  Phone,
  Clock,
  Navigation,
  Share2,
  Building2,
  TreePine,
  Landmark,
  UtensilsCrossed,
  Fuel,
  Hotel,
  Zap,
  Droplets,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { HierarchicalGeoService } from '@/services/hierarchicalGeoService';
import { CollaborationService } from '@/services/collaborationService';
import { GeoEntity, GeoEntityType, GeoPlaceCategory } from '@/types/hierarchicalGeo';
import { CollaborativeTrip } from '@/types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85';

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const placeId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [userTrips, setUserTrips] = useState<CollaborativeTrip[]>([]);

  // Fetch entity and breadcrumbs
  const place: GeoEntity | null = useMemo(() => {
    if (!placeId) return null;
    return HierarchicalGeoService.getEntityById(placeId);
  }, [placeId]);

  const breadcrumbs = useMemo(() => {
    if (!placeId) return [];
    return HierarchicalGeoService.getBreadcrumbs(placeId);
  }, [placeId]);

  // Load user trips for "Add to Trip" action
  useEffect(() => {
    const trips = CollaborationService.getAllTrips();
    setUserTrips(trips);
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success('Place link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      toast.success(`Saved ${place?.canonicalName} to your saved places!`);
    } else {
      toast.success(`Removed from saved places`);
    }
  };

  const handleOpenGoogleDirections = () => {
    if (!place) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&destination_place_id=${place.metadata?.googlePlaceId || ''}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddPlaceToTrip = (tripId: string) => {
    if (!place) return;
    const targetTrip = userTrips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    // Create a new waypoint stop
    const newStop = {
      id: `stop-${Date.now()}`,
      name: place.canonicalName,
      address: place.metadata?.address || `${place.canonicalName}, ${place.countryCode}`,
      coordinates: place.coordinates,
      category: place.category as any,
      detourKm: 1.0,
      detourMinutes: 5,
      order: targetTrip.stops.length + 1,
      suggestedBy: 'You'
    };

    targetTrip.stops.push(newStop);
    CollaborationService.saveTrips(userTrips);
    setIsAddToTripModalOpen(false);
    toast.success(`Added ${place.canonicalName} to ${targetTrip.name}!`);
    router.push(`/workspace/${targetTrip.id}`);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNote.trim()) return;
    toast.success('Thank you! Your verified geographic report was submitted for review.');
    setIsReportModalOpen(false);
    setReportNote('');
  };

  if (!place) {
    return (
      <main className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#244536]/15 shadow-lg space-y-4">
          <Compass className="w-12 h-12 text-[#C78363] mx-auto animate-spin" />
          <h2 className="font-serif text-2xl font-bold text-[#244536]">Place Record Not Found</h2>
          <p className="text-xs text-[#5F6761] leading-relaxed">
            The place identifier &ldquo;{placeId}&rdquo; was not found in the verified catalogue.
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
      {/* 1. EDITORIAL HEADER & BREADCRUMBS */}
      {/* ------------------------------------------------------------------------ */}
      <section className="bg-white border-b border-[#244536]/10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Breadcrumb Path */}
          <nav aria-label="Geographic Lineage" className="flex items-center flex-wrap gap-2 text-xs font-mono text-[#5F6761]">
            <Link href="/explore" className="hover:text-[#244536] transition flex items-center gap-1 font-medium">
              <Globe className="w-3.5 h-3.5 text-[#244536]" />
              <span>Global Catalogue</span>
            </Link>

            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.id}>
                  <ChevronRight className="w-3.5 h-3.5 text-[#5F6761]/40 shrink-0" />
                  {isLast ? (
                    <span className="text-[#244536] font-bold">{crumb.name}</span>
                  ) : (
                    <Link
                      href={
                        crumb.entityType === 'attraction' || crumb.entityType === 'business'
                          ? `/place/${encodeURIComponent(crumb.id)}`
                          : `/destination/${encodeURIComponent(crumb.id)}`
                      }
                      className="hover:text-[#244536] transition"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* 2. PLACE HERO & MEDIA SHOWCASE */}
      {/* ------------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative h-96 sm:h-[460px] w-full rounded-3xl overflow-hidden shadow-xl border border-[#244536]/15 bg-[#E7ECE5]">
              <img
                src={place.heroImage || FALLBACK_IMAGE}
                alt={place.canonicalName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-md rounded-xl text-xs font-mono font-bold text-[#244536] shadow-sm uppercase tracking-wider">
                {place.typeLabel || place.entityType}
              </div>

              {place.metadata?.hygieneScore && (
                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-emerald-900/90 text-white rounded-xl text-xs font-mono flex items-center gap-1.5 shadow-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Hygiene Score: {place.metadata.hygieneScore}% Verified Clean</span>
                </div>
              )}
            </div>

            {/* Micro Gallery / Context Snippets */}
            <div className="p-4 bg-white rounded-2xl border border-[#244536]/10 flex items-center justify-between text-xs text-[#5F6761]">
              <span className="font-mono text-[11px]">
                Source Attribution: <strong>{place.sourceType}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs font-semibold text-[#C78363] hover:underline flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Suggest Correction</span>
              </button>
            </div>
          </div>

          {/* Dossier & Actions Column */}
          <div className="lg:col-span-5 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#244536]/15 shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#C78363] font-semibold">
                  {place.category}
                </span>
                {place.metadata?.starRating && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-md border border-amber-200 text-amber-800 text-xs font-mono font-bold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{place.metadata.starRating}</span>
                  </div>
                )}
              </div>

              <h1 className="font-serif text-3xl font-bold text-[#244536] leading-tight">
                {place.canonicalName}
              </h1>

              {place.alternateNames.length > 0 && (
                <p className="text-xs text-[#5F6761] font-mono mt-1">
                  Aliases: {place.alternateNames.join(' · ')}
                </p>
              )}
            </div>

            <p className="text-sm text-[#292D2A] leading-relaxed">
              {place.description}
            </p>

            {/* Core Attributes */}
            <div className="space-y-3 pt-3 border-t border-[#244536]/10 text-xs">
              {place.metadata?.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#C78363] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#244536] block">Physical Address</span>
                    <span className="text-[#5F6761]">{place.metadata.address}</span>
                  </div>
                </div>
              )}

              {place.metadata?.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#244536] shrink-0" />
                  <div>
                    <span className="font-semibold text-[#244536]">Contact:</span>{' '}
                    <span className="text-[#5F6761] font-mono">{place.metadata.phone}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5 font-mono text-[11px] text-[#5F6761]">
                <Globe className="w-4 h-4 text-[#244536] shrink-0" />
                <span>
                  GPS: {place.coordinates.lat.toFixed(4)}° N, {place.coordinates.lng.toFixed(4)}° E
                </span>
              </div>

              {place.metadata?.fuelTypes && (
                <div className="pt-2">
                  <span className="font-semibold text-[#244536] block mb-1.5">Dispensed Fuels &amp; Energy:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {place.metadata.fuelTypes.map((fuel) => (
                      <span
                        key={fuel}
                        className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-mono font-medium flex items-center gap-1"
                      >
                        <Fuel className="w-3 h-3 text-amber-700" />
                        <span>{fuel}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {place.metadata?.admissionPrice && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#244536]/10 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#244536]">Admission Fee</span>
                  <span className="font-mono font-bold text-[#C78363]">
                    {place.metadata.admissionPrice.amount === 0
                      ? 'FREE PUBLIC ACCESS'
                      : `${place.metadata.admissionPrice.currency} ${place.metadata.admissionPrice.amount}`}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#244536]/10 space-y-2.5">
              <Button
                onClick={() => setIsAddToTripModalOpen(true)}
                className="w-full bg-[#244536] hover:bg-[#1B3529] text-white rounded-xl py-3 font-semibold shadow-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Collaborative Trip</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleOpenGoogleDirections}
                  className="rounded-xl border-[#244536]/20 text-[#244536] hover:bg-[#244536]/5 text-xs flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleToggleSave}
                  className="rounded-xl border-[#244536]/20 text-[#244536] hover:bg-[#244536]/5 text-xs flex items-center justify-center gap-1.5"
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#C78363] text-[#C78363]' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save Place'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* 3. INTERACTIVE MINI MAP */}
      {/* ------------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white rounded-3xl border border-[#244536]/15 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#244536]">
                Geographic Pinpoint &amp; Surroundings
              </h2>
              <p className="text-xs text-[#5F6761]">
                Precise coordinates: ({place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)})
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenGoogleDirections}
              className="text-xs rounded-xl border-[#244536]/20 text-[#244536] flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </Button>
          </div>

          <div className="relative h-80 w-full rounded-2xl overflow-hidden border border-[#244536]/10 bg-stone-100">
            <iframe
              title={`${place.canonicalName} Map`}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${place.coordinates.lng - 0.03}%2C${place.coordinates.lat - 0.03}%2C${place.coordinates.lng + 0.03}%2C${place.coordinates.lat + 0.03}&layer=mapnik&marker=${place.coordinates.lat}%2C${place.coordinates.lng}`}
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------ */}
      {/* MODAL: ADD PLACE TO COLLABORATIVE TRIP */}
      {/* ------------------------------------------------------------------------ */}
      <AnimatePresence>
        {isAddToTripModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#244536]/15 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#244536]/10 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#C78363]" />
                  <h3 className="font-serif text-lg font-bold text-[#244536]">
                    Add to Collaborative Trip
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddToTripModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-[#292D2A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#5F6761]">
                Select which active trip to add <strong>{place.canonicalName}</strong> into:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userTrips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => handleAddPlaceToTrip(trip.id)}
                    className="w-full text-left p-3 rounded-xl border border-[#244536]/10 hover:border-[#244536]/40 hover:bg-[#FAF8F5] transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#244536]">{trip.name}</h4>
                      <p className="text-[11px] text-[#5F6761]">{trip.stops.length} Stops · {trip.travelMode}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#C78363]" />
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[#244536]/10 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsAddToTripModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => router.push('/home')}
                  className="bg-[#244536] text-white rounded-xl text-xs"
                >
                  + Create New Trip
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------------ */}
      {/* MODAL: REPORT CORRECTION */}
      {/* ------------------------------------------------------------------------ */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#244536]/15 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#244536]/10 pb-3">
                <h3 className="font-serif text-lg font-bold text-[#244536]">
                  Suggest Verification Update
                </h3>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-[#292D2A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-3">
                <p className="text-xs text-[#5F6761]">
                  Found a discrepancy in coordinates, operating hours, fuel types, or washroom hygiene for{' '}
                  <strong>{place.canonicalName}</strong>? Submit details below:
                </p>

                <textarea
                  rows={4}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Describe updated details (e.g., fuel pump relocated 200m north, clean restroom verified)..."
                  className="w-full p-3 rounded-xl border border-[#244536]/20 text-xs text-[#292D2A] outline-none focus:border-[#244536]"
                  required
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsReportModalOpen(false)}
                    className="rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#244536] text-white rounded-xl text-xs"
                  >
                    Submit Report
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
