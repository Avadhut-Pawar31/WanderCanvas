'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Hotel,
  Star,
  MapPin,
  ExternalLink,
  Plus,
  ShieldCheck,
  Award,
  Filter,
  Check,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { HotelDiscoveryService, DiscoveredHotel } from '@/services/hotelDiscoveryService';

interface HotelFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationName: string;
  centerCoordinates?: { lat: number; lng: number };
}

export function HotelFinderModal({
  isOpen,
  onClose,
  destinationName,
  centerCoordinates,
}: HotelFinderModalProps) {
  const [hotels, setHotels] = useState<DiscoveredHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeHotelId, setActiveHotelId] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | 'budget' | 'mid' | 'luxury'>('all');
  const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null);
  const [externalUrl, setExternalUrl] = useState('');

  // Fetch hotels for destination
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    HotelDiscoveryService.getHotelsForDestination(destinationName, centerCoordinates)
      .then((data) => {
        setHotels(data.hotels);
        if (data.hotels.length > 0) {
          setActiveHotelId(data.hotels[0].id);
        }
        setExternalUrl(data.externalGoogleMapsUrl);
      })
      .catch((err) => {
        console.error('Failed to load hotels:', err);
        toast.error('Could not load hotel inventory');
      })
      .finally(() => setLoading(false));
  }, [isOpen, destinationName, centerCoordinates]);

  // Filtered hotels
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      // Price filter
      if (priceFilter === 'budget' && hotel.pricePerNight > 3000) return false;
      if (priceFilter === 'mid' && (hotel.pricePerNight <= 3000 || hotel.pricePerNight > 8000)) return false;
      if (priceFilter === 'luxury' && hotel.pricePerNight <= 8000) return false;

      // Amenity filter
      if (selectedAmenity) {
        const hasAmenity = hotel.amenities.some((a) =>
          a.toLowerCase().includes(selectedAmenity.toLowerCase())
        );
        if (!hasAmenity) return false;
      }

      return true;
    });
  }, [hotels, priceFilter, selectedAmenity]);

  const activeHotel = useMemo(() => {
    return hotels.find((h) => h.id === activeHotelId) || hotels[0] || null;
  }, [hotels, activeHotelId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-7xl h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#244536]/20"
        >
          {/* ------------------------------------------------------------------ */}
          {/* 1. TOP HEADER & FILTER BAR */}
          {/* ------------------------------------------------------------------ */}
          <header className="px-6 py-4 bg-[#244536] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Hotel className="w-5 h-5 text-[#C78363]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                    Hotels in {destinationName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-400/30">
                    Live Rates
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#F7F5EF]/75 font-mono pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C78363]" />
                    Sat, Oct 31 – Sun, Nov 1
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#C78363]" />
                    2 Guests
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Google Maps External & Close */}
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-1.5"
                title="Open in Google Maps in a new tab"
              >
                <span>Google Maps View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Quick Filter Bar */}
          <div className="px-6 py-2.5 bg-[#FAF8F5] border-b border-[#244536]/10 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#5F6761] font-mono text-[11px] uppercase mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#C78363]" /> Price:
              </span>
              {[
                { id: 'all', label: 'All Rates' },
                { id: 'budget', label: 'Under ₹3,000' },
                { id: 'mid', label: '₹3,000 - ₹8,000' },
                { id: 'luxury', label: 'Luxury ₹8,000+' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setPriceFilter(pill.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    priceFilter === pill.id
                      ? 'bg-[#244536] text-white shadow-xs'
                      : 'bg-white text-[#292D2A] border border-[#244536]/15 hover:bg-stone-100'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs shrink-0">
              {['Pool', 'Beach', 'Breakfast', 'Wi-Fi'].map((amenity) => {
                const isActive = selectedAmenity === amenity;
                return (
                  <button
                    key={amenity}
                    onClick={() => setSelectedAmenity(isActive ? null : amenity)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#C78363] text-white'
                        : 'bg-white text-[#5F6761] border border-[#244536]/15 hover:text-[#244536]'
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3" />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* 2. SPLIT LAYOUT: HOTEL CARDS (LEFT) + INTERACTIVE MAP (RIGHT) */}
          {/* ------------------------------------------------------------------ */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* LEFT COLUMN: Hotel Cards List */}
            <div className="lg:col-span-6 xl:col-span-5 overflow-y-auto divide-y divide-[#244536]/8 p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#5F6761] pb-1">
                <span>Showing {filteredHotels.length} places to stay in {destinationName}</span>
                <span className="text-[#244536] font-semibold">Taxes included</span>
              </div>

              {filteredHotels.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Hotel className="w-10 h-10 text-stone-300 mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-[#244536]">No hotels match filters</h3>
                  <p className="text-xs text-[#5F6761]">Try resetting your price or amenities filters.</p>
                  <Button
                    onClick={() => {
                      setPriceFilter('all');
                      setSelectedAmenity(null);
                    }}
                    className="bg-[#244536] text-white text-xs rounded-xl"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                filteredHotels.map((hotel) => {
                  const isSelected = hotel.id === activeHotelId;

                  return (
                    <motion.div
                      key={hotel.id}
                      onClick={() => setActiveHotelId(hotel.id)}
                      className={`cursor-pointer rounded-2xl border transition-all overflow-hidden p-3 sm:p-4 bg-white flex flex-col sm:flex-row gap-4 ${
                        isSelected
                          ? 'border-[#244536] ring-2 ring-[#244536]/15 shadow-md bg-[#FAF8F5]'
                          : 'border-[#244536]/15 hover:border-[#244536]/40 hover:shadow-sm'
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                        <img
                          src={hotel.heroImage}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {hotel.badge && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded-md text-[10px] font-mono text-amber-300 font-semibold uppercase">
                            {hotel.badge}
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-900/90 text-white rounded text-[10px] font-mono flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-300" />
                          <span>{hotel.hygieneScore}% Clean</span>
                        </div>
                      </div>

                      {/* Info & Price */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-base font-serif font-bold text-[#292D2A] hover:text-[#244536] transition-colors leading-snug">
                                {hotel.name}
                              </h3>
                              <p className="text-xs text-[#5F6761] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-[#C78363]" />
                                <span>{hotel.locality}</span>
                              </p>
                            </div>

                            {/* Price Pill */}
                            <div className="text-right shrink-0">
                              <span className="text-lg font-serif font-bold text-[#244536] block">
                                {hotel.formattedPrice}
                              </span>
                              <span className="text-[10px] text-[#5F6761] font-mono">/ night</span>
                            </div>
                          </div>

                          {/* TripAdvisor-style Green Bubble Score */}
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <span
                                  key={i}
                                  className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block border border-emerald-700"
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-[#292D2A]">{hotel.rating.toFixed(1)}</span>
                            <span className="text-[11px] text-[#5F6761] font-mono">
                              ({hotel.reviewCount} reviews)
                            </span>
                            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 ml-1">
                              {hotel.stars}★ Hotel
                            </span>
                          </div>

                          {/* Amenities chips */}
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {hotel.amenities.slice(0, 4).map((amenity) => (
                              <span
                                key={amenity}
                                className="px-2 py-0.5 bg-stone-100 text-[#5F6761] text-[10px] font-mono rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success(`Reserved ${hotel.name} for your journey!`);
                            }}
                            className="px-3 py-1.5 bg-[#244536] hover:bg-[#1B3529] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Itinerary</span>
                          </button>

                          <a
                            href={hotel.googleMapsUrl || externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-mono text-[#5F6761] hover:text-[#244536] flex items-center gap-1 underline underline-offset-2"
                          >
                            <span>Google Maps Directions</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* RIGHT COLUMN: Interactive Map with Price Pins */}
            <div className="lg:col-span-6 xl:col-span-7 bg-stone-100 relative h-full flex flex-col border-l border-[#244536]/10">
              {/* Map View Header Overlay */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-[#244536]/15 pointer-events-auto flex items-center gap-2 text-xs font-mono">
                  <Compass className="w-4 h-4 text-[#C78363]" />
                  <span className="font-bold text-[#244536]">{filteredHotels.length} Hotels Plotted</span>
                  <span className="text-stone-400">· Interactive Price Markers</span>
                </div>

                {activeHotel && (
                  <div className="bg-[#244536] text-white px-3.5 py-1.5 rounded-xl shadow-md text-xs font-mono font-semibold pointer-events-auto">
                    Active: {activeHotel.name} ({activeHotel.formattedPrice})
                  </div>
                )}
              </div>

              {/* Embedded Map Canvas */}
              {activeHotel && (
                <div className="relative w-full h-full overflow-hidden">
                  <iframe
                    title={`${destinationName} Hotels Map`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeHotel.coordinates.lng - 0.12}%2C${activeHotel.coordinates.lat - 0.12}%2C${activeHotel.coordinates.lng + 0.12}%2C${activeHotel.coordinates.lat + 0.12}&layer=mapnik&marker=${activeHotel.coordinates.lat}%2C${activeHotel.coordinates.lng}`}
                    className="w-full h-full"
                  />

                  {/* Simulated Floating Price Marker Pills Overlay matching Google Maps */}
                  <div className="absolute inset-0 pointer-events-none p-8 flex flex-wrap items-center justify-around gap-6 overflow-hidden">
                    {filteredHotels.slice(0, 8).map((hotel, idx) => {
                      const isSelected = hotel.id === activeHotelId;
                      return (
                        <button
                          key={hotel.id}
                          type="button"
                          onClick={() => setActiveHotelId(hotel.id)}
                          style={{
                            transform: `translate(${((idx * 37) % 60) - 30}px, ${((idx * 29) % 80) - 40}px)`,
                          }}
                          className={`pointer-events-auto transition-all transform hover:scale-110 shadow-lg px-3 py-1.5 rounded-full font-mono font-bold text-xs flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#244536] text-white ring-4 ring-[#C78363]/40 z-30 scale-105'
                              : 'bg-white text-[#244536] border border-[#244536]/30 hover:bg-[#FAF8F5]'
                          }`}
                        >
                          <Hotel className="w-3 h-3 text-[#C78363]" />
                          <span>{hotel.formattedPrice}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Hotel Snapshot Preview at bottom of map */}
              {activeHotel && (
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-[#244536]/15 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={activeHotel.heroImage}
                      alt={activeHotel.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-sm text-[#292D2A] truncate">
                        {activeHotel.name}
                      </h4>
                      <p className="text-xs text-[#5F6761] truncate">
                        📍 {activeHotel.locality} · {activeHotel.stars}★ Rating
                      </p>
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#244536] mt-0.5">
                        <span>{activeHotel.formattedPrice} / night</span>
                        <span className="text-emerald-700 font-normal">· {activeHotel.hygieneScore}% Verified Clean</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => {
                        toast.success(`Added ${activeHotel.name} to itinerary!`);
                      }}
                      className="bg-[#244536] text-white hover:bg-[#1B3529] text-xs font-semibold rounded-xl h-9 px-4"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add to Trip
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
