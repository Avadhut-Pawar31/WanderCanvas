'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  ChevronRight,
  Sparkles,
  Building2,
  TreePine,
  Landmark,
  UtensilsCrossed,
  Fuel,
  Hotel,
  ShieldCheck,
  Zap,
  Droplets,
  Eye,
  Compass,
  X
} from 'lucide-react';
import { HierarchicalGeoService } from '@/services/hierarchicalGeoService';
import {
  GeoEntity,
  GeoEntityType,
  GeoPlaceCategory,
  HierarchicalSearchResult
} from '@/types/hierarchicalGeo';

interface GlobalHierarchicalSearchProps {
  onSelectEntity?: (entity: GeoEntity) => void;
  className?: string;
  placeholder?: string;
  initialQuery?: string;
  variant?: 'navbar' | 'hero' | 'standalone';
}

// Icon helper for entity types and categories
function getEntityIcon(entityType: GeoEntityType, category: GeoPlaceCategory) {
  if (category === 'petrol_pump') return <Fuel className="w-4 h-4 text-amber-600" />;
  if (category === 'ev_charging') return <Zap className="w-4 h-4 text-emerald-600" />;
  if (category === 'washroom') return <Droplets className="w-4 h-4 text-blue-600" />;
  if (category === 'hotel' || category === 'resort') return <Hotel className="w-4 h-4 text-indigo-600" />;
  if (category === 'restaurant' || category === 'cafe') return <UtensilsCrossed className="w-4 h-4 text-orange-600" />;
  if (category === 'waterfall') return <Droplets className="w-4 h-4 text-cyan-600" />;
  if (category === 'heritage') return <Landmark className="w-4 h-4 text-amber-700" />;
  if (category === 'viewpoint') return <Eye className="w-4 h-4 text-teal-600" />;
  if (category === 'nature_reserve') return <TreePine className="w-4 h-4 text-emerald-700" />;

  switch (entityType) {
    case 'continent':
    case 'country':
      return <Compass className="w-4 h-4 text-[#244536]" />;
    case 'state':
    case 'district':
      return <Building2 className="w-4 h-4 text-[#C78363]" />;
    case 'city':
    case 'town':
    case 'village':
    case 'locality':
    case 'suburb':
      return <MapPin className="w-4 h-4 text-[#244536]" />;
    case 'attraction':
      return <Sparkles className="w-4 h-4 text-amber-600" />;
    default:
      return <MapPin className="w-4 h-4 text-[#5F6761]" />;
  }
}

// Badge color for entity type
function getBadgeStyle(entityType: GeoEntityType) {
  switch (entityType) {
    case 'continent':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'country':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'state':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'district':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'city':
    case 'town':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'village':
    case 'locality':
      return 'bg-lime-100 text-lime-800 border-lime-200';
    case 'tourist_region':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'attraction':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'business':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-stone-100 text-stone-800 border-stone-200';
  }
}

export function GlobalHierarchicalSearch({
  onSelectEntity,
  className = '',
  placeholder = 'Search places, districts, towns, waterfalls, petrol pumps...',
  initialQuery = '',
  variant = 'navbar'
}: GlobalHierarchicalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  // Click outside to close autocomplete
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live search matches with HierarchicalGeoService
  const results: HierarchicalSearchResult[] = useMemo(() => {
    if (!query.trim()) return [];
    return HierarchicalGeoService.search(query.trim(), { limit: 8 });
  }, [query]);

  const handleSelect = (entity: GeoEntity) => {
    setIsFocused(false);
    if (onSelectEntity) {
      onSelectEntity(entity);
    } else {
      if (entity.entityType === 'attraction' || entity.entityType === 'business') {
        router.push(`/place/${encodeURIComponent(entity.id)}`);
      } else {
        router.push(`/destination/${encodeURIComponent(entity.id)}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (results.length > 0) {
      handleSelect(results[0].entity);
    } else {
      setIsFocused(false);
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Container */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-3 transition-all duration-200 ${
          isHero
            ? 'px-5 py-3.5 bg-white rounded-2xl shadow-xl border border-[#244536]/15 hover:border-[#244536]/40 focus-within:border-[#244536] focus-within:ring-2 focus-within:ring-[#244536]/10'
            : 'px-3.5 py-1.5 bg-white rounded-xl shadow-xs border border-[#244536]/15 hover:border-[#244536]/30 focus-within:border-[#244536]'
        }`}
      >
        <Search
          className={`flex-shrink-0 text-[#292D2A]/50 ${
            isHero ? 'w-5 h-5 text-[#244536]' : 'w-4 h-4'
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isFocused) setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={`w-full bg-transparent border-none outline-none text-[#292D2A] placeholder-[#292D2A]/40 font-sans ${
            isHero ? 'text-base font-medium' : 'text-xs'
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1 rounded-full text-[#292D2A]/40 hover:text-[#292D2A] hover:bg-stone-100 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown with Parent Breadcrumbs */}
      <AnimatePresence>
        {isFocused && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#244536]/15 overflow-hidden z-50 ${
              isHero ? 'max-w-2xl' : 'w-[420px] max-w-[90vw]'
            }`}
          >
            {/* Header info */}
            <div className="px-4 py-2.5 bg-[#F7F5EF] border-b border-[#244536]/10 flex items-center justify-between text-[11px] font-mono text-[#5F6761]">
              <span className="flex items-center gap-1.5 font-semibold text-[#244536]">
                <Compass className="w-3.5 h-3.5 text-[#C78363]" />
                GEOGRAPHIC CATALOGUE MATCHES
              </span>
              <span>{results.length} results</span>
            </div>

            {results.length === 0 ? (
              <div className="p-5 text-center space-y-2">
                <p className="text-xs text-[#5F6761]">
                  No exact hierarchical place found for &ldquo;{query}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
                  className="text-xs font-semibold text-[#244536] hover:underline"
                >
                  Search live on Explore Map &rarr;
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#244536]/8 max-h-[440px] overflow-y-auto">
                {results.map(({ entity, matchType, breadcrumbs, matchedQueryToken }) => {
                  const isBusiness = entity.entityType === 'business';
                  const isAttraction = entity.entityType === 'attraction';

                  return (
                    <button
                      key={entity.id}
                      type="button"
                      onClick={() => handleSelect(entity)}
                      className="w-full text-left p-3.5 hover:bg-[#FAF8F5] transition flex items-start gap-3 group"
                    >
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 mt-0.5 border border-stone-200/60 group-hover:bg-[#244536]/10 transition-colors">
                        {getEntityIcon(entity.entityType, entity.category)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title & Badge */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-[#292D2A] group-hover:text-[#244536] transition-colors">
                            {entity.canonicalName}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md border font-medium ${getBadgeStyle(
                              entity.entityType
                            )}`}
                          >
                            {entity.typeLabel || entity.entityType}
                          </span>

                          {entity.metadata?.hygieneStatus === 'verified_clean' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Clean 95%+
                            </span>
                          )}
                        </div>

                        {/* Breadcrumbs: Asia → India → Maharashtra → Satara → Mahabaleshwar */}
                        {breadcrumbs.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1 text-[11px] text-[#5F6761] font-mono leading-tight">
                            {breadcrumbs.map((crumb, idx) => (
                              <React.Fragment key={crumb.id}>
                                <span
                                  className={
                                    idx === breadcrumbs.length - 1
                                      ? 'text-[#244536] font-semibold'
                                      : 'hover:text-[#292D2A]'
                                  }
                                >
                                  {crumb.name}
                                </span>
                                {idx < breadcrumbs.length - 1 && (
                                  <ChevronRight className="w-3 h-3 text-stone-400 flex-shrink-0" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {/* Alternate names snippet or business address */}
                        {entity.alternateNames.length > 0 && (
                          <div className="text-[10px] text-stone-400 mt-1 truncate">
                            Also known as: {entity.alternateNames.slice(0, 3).join(', ')}
                          </div>
                        )}

                        {entity.metadata?.address && (
                          <div className="text-[10px] text-stone-500 mt-0.5 truncate">
                            📍 {entity.metadata.address}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Suggestions Footer */}
            <div className="px-4 py-2.5 bg-stone-50 border-t border-[#244536]/10 flex items-center justify-between text-[11px] text-[#5F6761]">
              <span className="font-mono text-[10px]">
                Tip: Direct search any village, attraction, or &ldquo;petrol pump in Mahabaleshwar&rdquo;
              </span>
              <span className="font-mono text-[10px] text-[#C78363] font-semibold">
                WanderCanvas Global
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
