'use client';

import { useRef } from 'react';
import { RouteInfo, Place, Waypoint } from '@/types';
import { Navigation } from 'lucide-react';
import { HygieneService } from '@/services/hygieneService';

interface InteractiveRouteMapProps {
  route: RouteInfo;
  stops: Waypoint[];
  candidatePlaces?: Place[];
  selectedPlace?: Place | null;
  onSelectPlace?: (place: Place) => void;
  onAddStop?: (place: Place) => void;
  onSuggestStop?: (place: Place) => void;
  userRole?: 'owner' | 'editor' | 'viewer';
}

export function InteractiveRouteMap({
  route,
  stops,
  candidatePlaces = [],
  selectedPlace,
  onSelectPlace,
  onAddStop,
  onSuggestStop,
  userRole = 'editor',
}: InteractiveRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const googleMapsKeyPresent = Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY'
  );

  // Compute bounding box for projection
  const allCoordinates: [number, number][] = [
    ...route.coordinatesPath,
    ...stops.map(s => [s.coordinates.lat, s.coordinates.lng] as [number, number]),
    ...candidatePlaces.map(p => [p.coordinates.lat, p.coordinates.lng] as [number, number]),
  ];

  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  allCoordinates.forEach(([lat, lng]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  // Add 15% padding
  const latSpan = Math.max(0.08, maxLat - minLat);
  const lngSpan = Math.max(0.08, maxLng - minLng);
  const paddedMinLat = minLat - latSpan * 0.15;
  const paddedMaxLat = maxLat + latSpan * 0.15;
  const paddedMinLng = minLng - lngSpan * 0.15;
  const paddedMaxLng = maxLng + lngSpan * 0.15;

  // Project lat/lng to SVG percentage coordinates (0-100)
  const projectPoint = (lat: number, lng: number) => {
    const x = ((lng - paddedMinLng) / (paddedMaxLng - paddedMinLng)) * 100;
    const y = ((paddedMaxLat - lat) / (paddedMaxLat - paddedMinLat)) * 100; // Inverted Y for screen coords
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  // Generate SVG path string from route coordinates
  const pathD = route.coordinatesPath
    .map((coord, index) => {
      const pt = projectPoint(coord[0], coord[1]);
      return `${index === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
    })
    .join(' ');

  const originPoint = projectPoint(route.origin.coordinates.lat, route.origin.coordinates.lng);
  const destPoint = projectPoint(route.destination.coordinates.lat, route.destination.coordinates.lng);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden bg-[#F2EFE9] border border-[#244536]/15 shadow-inner flex flex-col justify-between">
      {/* Top Map Status Banner */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Route info chip */}
        <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#244536]/10 shadow-sm pointer-events-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#E7ECE5] flex items-center justify-center text-[#244536]">
            <Navigation className="w-4 h-4 transform rotate-45" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#244536] flex items-center gap-1.5">
              <span>{route.origin.name}</span>
              <span className="text-[#5F6761]">→</span>
              <span>{route.destination.name}</span>
            </div>
            <div className="text-[11px] text-[#5F6761] mt-0.5">
              {route.distanceKm} km · ~{Math.round(route.durationMinutes / 60)}h {route.durationMinutes % 60}m ({route.travelMode})
            </div>
          </div>
        </div>

        {/* Google Maps / Geospatial Engine indicator */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#244536]/10 shadow-sm pointer-events-auto flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#244536] animate-pulse" />
          <span className="text-[#244536] font-medium">
            {googleMapsKeyPresent ? 'Google Maps Connected' : 'Geospatial Route Engine'}
          </span>
          <span className="text-[10px] text-[#5F6761] bg-[#F7F5EF] px-2 py-0.5 rounded-md border border-[#244536]/10">
            Live
          </span>
        </div>
      </div>

      {/* Main Interactive Geospatial Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center"
      >
        {/* Subtle topographical grid */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#244536 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Route Visualization Layer */}
        <svg 
          className="absolute inset-0 w-full h-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#244536" />
              <stop offset="100%" stopColor="#C78363" />
            </linearGradient>
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Route path shadow / outline */}
          <path
            d={pathD}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active primary route line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-700"
          />

          {/* Detour connect lines for candidate places */}
          {candidatePlaces.map(place => {
            const pt = projectPoint(place.coordinates.lat, place.coordinates.lng);
            return (
              <line
                key={`detour-line-${place.id}`}
                x1={pt.x}
                y1={pt.y}
                x2={pt.x + 0.1}
                y2={pt.y + 0.1}
                stroke="#C78363"
                strokeWidth="0.5"
                strokeDasharray="1,1"
                opacity="0.6"
              />
            );
          })}
        </svg>

        {/* HTML Markers Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Origin Marker */}
          <div
            style={{ left: `${originPoint.x}%`, top: `${originPoint.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10 group"
          >
            <div className="relative flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#244536] text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold ring-4 ring-[#244536]/20">
                A
              </div>
              <span className="mt-1 px-2 py-0.5 rounded-md bg-white/95 text-[10px] font-semibold text-[#244536] shadow-sm whitespace-nowrap border border-[#244536]/10">
                {route.origin.name}
              </span>
            </div>
          </div>

          {/* Destination Marker */}
          <div
            style={{ left: `${destPoint.x}%`, top: `${destPoint.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10 group"
          >
            <div className="relative flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#C78363] text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold ring-4 ring-[#C78363]/25">
                B
              </div>
              <span className="mt-1 px-2 py-0.5 rounded-md bg-white/95 text-[10px] font-semibold text-[#244536] shadow-sm whitespace-nowrap border border-[#244536]/10">
                {route.destination.name}
              </span>
            </div>
          </div>

          {/* Confirmed Stops Markers */}
          {stops.map((stop, idx) => {
            const pt = projectPoint(stop.coordinates.lat, stop.coordinates.lng);
            return (
              <div
                key={stop.id}
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20 group"
              >
                <div className="relative flex flex-col items-center cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-[#244536] text-white flex items-center justify-center shadow-md border-2 border-white text-xs font-semibold">
                    {idx + 1}
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-md bg-white/95 text-[10px] font-medium text-[#292D2A] shadow-xs whitespace-nowrap border border-black/5">
                    {stop.name}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Candidate Place Markers with Hygiene Status Badges */}
          {candidatePlaces.map(place => {
            const pt = projectPoint(place.coordinates.lat, place.coordinates.lng);
            const isSelected = selectedPlace?.id === place.id;
            const badge = HygieneService.getStatusBadge(place.hygieneStatus);

            return (
              <button
                key={place.id}
                onClick={() => onSelectPlace && onSelectPlace(place)}
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10 transition-transform duration-200 focus:outline-none ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
                title={`${place.name} · ${place.category} · ${badge.label}`}
              >
                <div className="relative flex flex-col items-center">
                  <div className={`p-2 rounded-xl shadow-md border-2 transition-all ${
                    isSelected 
                      ? 'bg-[#244536] text-white border-white ring-4 ring-[#244536]/30' 
                      : 'bg-white text-[#292D2A] border-[#244536]/20 hover:border-[#244536]'
                  }`}>
                    {/* Category icon or indicator */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs">
                        {place.category === 'washroom' ? '🚻' :
                         place.category === 'hotel' ? '🏨' :
                         place.category === 'restaurant' ? '🍽️' :
                         place.category === 'fuel' ? '⛽' : '☕'}
                      </span>
                      {place.hygieneScore && (
                        <span className="text-[10px] font-bold text-[#244536]">
                          {place.hygieneScore}
                        </span>
                      )}
                    </div>

                    {/* Hygiene status dot indicator */}
                    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white ${badge.dotColor}`} />
                  </div>

                  {/* Micro label */}
                  {isSelected && (
                    <span className="mt-1 px-2 py-0.5 rounded-md bg-[#244536] text-white text-[10px] font-medium shadow-sm whitespace-nowrap">
                      {place.name}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Place Overlay Card (Bottom of Map) */}
      {selectedPlace && (
        <div className="absolute bottom-4 left-4 right-4 z-30 bg-white/98 backdrop-blur-md p-4 rounded-2xl border border-[#244536]/15 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#F0F3EF] text-[#244536] text-[11px] font-medium capitalize">
                  {selectedPlace.category}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${HygieneService.getStatusBadge(selectedPlace.hygieneStatus).color}`}>
                  {HygieneService.getStatusBadge(selectedPlace.hygieneStatus).label}
                </span>
                {selectedPlace.hygieneScore && (
                  <span className="text-xs font-bold text-[#244536]">
                    Score: {selectedPlace.hygieneScore}/100
                  </span>
                )}
              </div>

              <h4 className="font-serif text-base sm:text-lg font-medium text-[#244536]">
                {selectedPlace.name}
              </h4>
              <p className="text-xs text-[#5F6761] line-clamp-1">
                {selectedPlace.address} · <span className="text-[#C78363] font-medium">+{selectedPlace.detourKm || 0.8} km detour (~{selectedPlace.detourMinutes || 3} min)</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              {userRole !== 'viewer' && onAddStop && (
                <button
                  onClick={() => onAddStop(selectedPlace)}
                  className="px-4 py-2 rounded-xl bg-[#244536] text-white text-xs font-medium hover:bg-[#1B3529] transition-colors shadow-xs"
                >
                  Add to Route
                </button>
              )}
              {userRole !== 'viewer' && onSuggestStop && (
                <button
                  onClick={() => onSuggestStop(selectedPlace)}
                  className="px-3.5 py-2 rounded-xl border border-[#C78363] text-[#C78363] hover:bg-[#C78363]/10 text-xs font-medium transition-colors"
                >
                  Suggest for Vote
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
