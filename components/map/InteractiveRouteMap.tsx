'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { RouteInfo, Place, Waypoint } from '@/types';
import { Navigation, Map as MapIcon, Layers, Compass, CheckCircle2 } from 'lucide-react';
import { HygieneService } from '@/services/hygieneService';
import toast from 'react-hot-toast';

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
  const leafletMapRef = useRef<HTMLDivElement>(null);
  const leafletInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [mapMode, setMapMode] = useState<'street' | 'satellite' | 'canvas'>('street');
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  // Initialize Free Interactive Map (Leaflet + OpenStreetMap & Esri Satellite)
  useEffect(() => {
    if (typeof window === 'undefined' || !leafletMapRef.current) return;
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !leafletMapRef.current) return;

      // Clean up previous instance if exists
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.remove();
        leafletInstanceRef.current = null;
      }

      const map = L.map(leafletMapRef.current, {
        center: [route.origin.coordinates.lat || 40.8518, route.origin.coordinates.lng || 14.2681],
        zoom: 11,
        zoomControl: false,
      });

      // Add zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Base Tile Layer (Street or Satellite)
      const tileUrl = mapMode === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        attribution: mapMode === 'satellite'
          ? 'Tiles &copy; Esri &mdash; High-Res Satellite'
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      const allLatLngs: [number, number][] = [];

      // 1. Draw Route Polyline with high-contrast dual casing for street & satellite
      const pathCoords: [number, number][] = route.coordinatesPath.map((coord) => [coord[0], coord[1]]);
      if (pathCoords.length > 0) {
        // Casing halo
        L.polyline(pathCoords, {
          color: '#FFFFFF',
          weight: 6,
          opacity: 0.85,
        }).addTo(map);

        // Core line
        L.polyline(pathCoords, {
          color: '#244536',
          weight: 4,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        allLatLngs.push(...pathCoords);
      }

      // 2. Origin Marker (A)
      const originIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: #244536; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
            A
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      L.marker([route.origin.coordinates.lat, route.origin.coordinates.lng], { icon: originIcon })
        .addTo(map)
        .bindPopup(`<b>Starting Point</b><br/>${route.origin.name}`);
      allLatLngs.push([route.origin.coordinates.lat, route.origin.coordinates.lng]);

      // 3. Destination Marker (B)
      const destIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: #C78363; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
            B
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      L.marker([route.destination.coordinates.lat, route.destination.coordinates.lng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>Destination</b><br/>${route.destination.name}`);
      allLatLngs.push([route.destination.coordinates.lat, route.destination.coordinates.lng]);

      // 4. Confirmed Stops Markers
      stops.forEach((stop, index) => {
        const stopIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="background-color: #244536; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.25);">
              ${index + 1}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        L.marker([stop.coordinates.lat, stop.coordinates.lng], { icon: stopIcon })
          .addTo(map)
          .bindPopup(`<b>Stop ${index + 1}: ${stop.name}</b><br/>${stop.address}`);
        allLatLngs.push([stop.coordinates.lat, stop.coordinates.lng]);
      });

      // 5. Candidate Stops Markers
      candidatePlaces.forEach((place) => {
        const isSelected = selectedPlace?.id === place.id;
        const candidateIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="background-color: ${isSelected ? '#244536' : '#FFFFFF'}; color: ${isSelected ? '#FFFFFF' : '#244536'}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; border: 2px solid #244536; box-shadow: 0 2px 6px rgba(0,0,0,0.25); cursor: pointer;">
              ${place.hygieneScore || '★'}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([place.coordinates.lat, place.coordinates.lng], { icon: candidateIcon }).addTo(map);
        marker.on('click', () => {
          onSelectPlace?.(place);
        });
        allLatLngs.push([place.coordinates.lat, place.coordinates.lng]);
      });

      // Fit map bounds neatly around route and stops
      if (allLatLngs.length > 0) {
        map.fitBounds(allLatLngs, { padding: [50, 50], maxZoom: 13 });
      }

      leafletInstanceRef.current = map;
      setIsLeafletReady(true);
    }).catch((err) => {
      console.warn('Leaflet map notice:', err);
    });

    return () => {
      isMounted = false;
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.remove();
        leafletInstanceRef.current = null;
      }
    };
  }, [route, stops, candidatePlaces, selectedPlace, onSelectPlace]);

  // Dynamically swap tiles when switching between Street and Satellite
  useEffect(() => {
    if (leafletInstanceRef.current && tileLayerRef.current) {
      if (mapMode === 'satellite') {
        tileLayerRef.current.setUrl('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
      } else if (mapMode === 'street') {
        tileLayerRef.current.setUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
      }
      setTimeout(() => {
        leafletInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [mapMode]);

  // Schematic vector projection calculation
  const allCoordinates: [number, number][] = [
    [route.origin.coordinates.lat, route.origin.coordinates.lng],
    [route.destination.coordinates.lat, route.destination.coordinates.lng],
    ...route.coordinatesPath,
    ...stops.map((s) => [s.coordinates.lat, s.coordinates.lng] as [number, number]),
    ...candidatePlaces.map((p) => [p.coordinates.lat, p.coordinates.lng] as [number, number]),
  ];

  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  allCoordinates.forEach(([lat, lng]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  const latSpan = Math.max(0.08, maxLat - minLat);
  const lngSpan = Math.max(0.08, maxLng - minLng);
  const paddedMinLat = minLat - latSpan * 0.15;
  const paddedMaxLat = maxLat + latSpan * 0.15;
  const paddedMinLng = minLng - lngSpan * 0.15;
  const paddedMaxLng = maxLng + lngSpan * 0.15;

  const projectPoint = useCallback((lat: number, lng: number) => {
    const x = ((lng - paddedMinLng) / (paddedMaxLng - paddedMinLng)) * 100;
    const y = ((paddedMaxLat - lat) / (paddedMaxLat - paddedMinLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  }, [paddedMaxLat, paddedMaxLng, paddedMinLat, paddedMinLng]);

  const pathD = route.coordinatesPath
    .map((coord, index) => {
      const pt = projectPoint(coord[0], coord[1]);
      return `${index === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
    })
    .join(' ');

  const originPoint = projectPoint(route.origin.coordinates.lat, route.origin.coordinates.lng);
  const destPoint = projectPoint(route.destination.coordinates.lat, route.destination.coordinates.lng);

  return (
    <div className="relative w-full h-[540px] rounded-3xl overflow-hidden bg-[#F2EFE9] border border-[#244536]/15 shadow-inner flex flex-col justify-between">
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

        {/* 3-Way Mode Switcher: Street / Satellite / Canvas */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-[#244536]/10 shadow-sm flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMapMode('street')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                mapMode === 'street'
                  ? 'bg-[#244536] text-white shadow-xs'
                  : 'text-[#5F6761] hover:text-[#244536]'
              }`}
            >
              Street
            </button>
            <button
              type="button"
              onClick={() => setMapMode('satellite')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                mapMode === 'satellite'
                  ? 'bg-[#244536] text-white shadow-xs'
                  : 'text-[#5F6761] hover:text-[#244536]'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapMode('canvas')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                mapMode === 'canvas'
                  ? 'bg-[#244536] text-white shadow-xs'
                  : 'text-[#5F6761] hover:text-[#244536]'
              }`}
            >
              Canvas
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#244536]/10 shadow-sm flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#244536] animate-pulse" />
            <span className="text-[#244536] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#244536]" />
              <span>
                {mapMode === 'satellite'
                  ? 'Free High-Res Satellite View'
                  : mapMode === 'street'
                  ? 'Free OpenStreetMap View'
                  : 'WanderCanvas Route Engine'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Layer 1: Free Interactive Leaflet Viewport (Street & Satellite) */}
      <div
        ref={leafletMapRef}
        className={`w-full h-full z-10 ${mapMode === 'street' || mapMode === 'satellite' ? 'block' : 'hidden'}`}
      />

      {/* Layer 2: Bespoke Canvas Schematic Viewport */}
      <div
        ref={containerRef}
        className={`relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center ${
          mapMode === 'canvas' ? 'block' : 'hidden'
        }`}
      >
        {/* Background Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#244536 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Route Corridor */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#244536" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#C78363" stopOpacity="0.85" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#244536" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Route buffer halo */}
          <path d={pathD} fill="none" stroke="#244536" strokeWidth="8" strokeOpacity="0.08" strokeLinecap="round" strokeLinejoin="round" />

          {/* Main Route line */}
          <path d={pathD} fill="none" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="6,4" filter="url(#glow)" />
        </svg>

        {/* Origin Node A */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
          style={{ left: `${originPoint.x}%`, top: `${originPoint.y}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-[#244536] border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-serif font-bold">
            A
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-medium text-[#244536] border border-[#244536]/10 shadow-xs whitespace-nowrap">
            {route.origin.name}
          </span>
        </div>

        {/* Destination Node B */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
          style={{ left: `${destPoint.x}%`, top: `${destPoint.y}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-[#C78363] border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-serif font-bold">
            B
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-medium text-[#C78363] border border-[#C78363]/20 shadow-xs whitespace-nowrap">
            {route.destination.name}
          </span>
        </div>

        {/* Confirmed Stops */}
        {stops.map((stop, index) => {
          const pt = projectPoint(stop.coordinates.lat, stop.coordinates.lng);
          const matchedPlace = candidatePlaces.find((p) => p.id === stop.placeId);
          return (
            <div
              key={stop.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              onClick={() => {
                if (matchedPlace) onSelectPlace?.(matchedPlace);
              }}
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-[#244536] text-white flex items-center justify-center text-xs font-medium border-2 border-white shadow-md">
                  {index + 1}
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#759587] text-[9px] text-white font-bold flex items-center justify-center border border-white">
                  ✓
                </div>
              </div>
              <span className="mt-1 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-medium text-[#292D2A] border border-[#244536]/10 shadow-xs max-w-[120px] truncate">
                {stop.name}
              </span>
            </div>
          );
        })}

        {/* Candidate Stops Layer */}
        <div className="absolute inset-0 pointer-events-auto">
          {candidatePlaces.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            const pt = projectPoint(place.coordinates.lat, place.coordinates.lng);
            const badge = HygieneService.getStatusBadge(place.hygieneStatus);

            return (
              <button
                key={place.id}
                type="button"
                onClick={() => onSelectPlace?.(place)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-hidden group"
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`relative p-1.5 rounded-full transition-all duration-200 border-2 ${
                      isSelected
                        ? 'bg-[#244536] text-white border-white scale-125 shadow-lg z-20'
                        : 'bg-white text-[#244536] border-[#244536]/30 hover:scale-110 shadow-sm'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      {place.category === 'washroom' ? (
                        <span className="text-[10px]">🚻</span>
                      ) : place.category === 'hotel' ? (
                        <span className="text-[10px]">🏨</span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#244536]">
                          {place.hygieneScore}
                        </span>
                      )}
                    </div>
                    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white ${badge.dotColor}`} />
                  </div>
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

      {/* Selected Place Overlay Card */}
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
                  type="button"
                  onClick={() => onAddStop(selectedPlace)}
                  className="px-4 py-2 rounded-xl bg-[#244536] text-white text-xs font-medium hover:bg-[#1B3529] transition-colors shadow-xs"
                >
                  Add to Route
                </button>
              )}
              {userRole !== 'viewer' && onSuggestStop && (
                <button
                  type="button"
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
