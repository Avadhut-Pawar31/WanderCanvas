import { RouteInfo, Waypoint, Place, TravelMode, PlaceCategory } from '@/types';
import { HygieneService } from './hygieneService';

export class MapRouteService {
  /**
   * Calculate distance between two coordinates using the Haversine formula (in kilometers).
   */
  static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Calculate minimum distance from a point to a route polyline path (in kilometers).
   */
  static distanceToPath(
    point: { lat: number; lng: number },
    path: [number, number][]
  ): number {
    if (path.length === 0) return 0;
    if (path.length === 1) {
      return this.calculateHaversineDistance(point.lat, point.lng, path[0][0], path[0][1]);
    }

    let minDistance = Infinity;

    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];
      const d = this.distToSegment(point, { lat: p1[0], lng: p1[1] }, { lat: p2[0], lng: p2[1] });
      if (d < minDistance) {
        minDistance = d;
      }
    }

    return minDistance;
  }

  private static distToSegment(
    p: { lat: number; lng: number },
    v: { lat: number; lng: number },
    w: { lat: number; lng: number }
  ): number {
    const l2 = Math.pow(v.lat - w.lat, 2) + Math.pow(v.lng - w.lng, 2);
    if (l2 === 0) return this.calculateHaversineDistance(p.lat, p.lng, v.lat, v.lng);

    // Consider the line extending the segment, parameterized as v + t (w - v).
    // Projection of point p onto line
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p.lat - v.lat) * (w.lat - v.lat) + (p.lng - v.lng) * (w.lng - v.lng)) / l2
      )
    );

    const projectionLat = v.lat + t * (w.lat - v.lat);
    const projectionLng = v.lng + t * (w.lng - v.lng);

    return this.calculateHaversineDistance(p.lat, p.lng, projectionLat, projectionLng);
  }

  /**
   * Estimate detour distance and time in minutes to visit a place from a route.
   */
  static estimateDetour(
    placeCoords: { lat: number; lng: number },
    routePath: [number, number][],
    travelMode: TravelMode = 'driving'
  ): { detourKm: number; detourMinutes: number } {
    const directDistKm = this.distanceToPath(placeCoords, routePath);
    // Road factor: driving to and from the route typically incurs ~1.8x - 2.2x the direct perpendicular distance
    const detourKm = Math.round(directDistKm * 2.2 * 10) / 10;

    let speedKmH = 65; // driving speed default on regional roads
    if (travelMode === 'walking') speedKmH = 4.5;
    if (travelMode === 'bicycling') speedKmH = 15;
    if (travelMode === 'transit') speedKmH = 35;

    const detourMinutes = Math.max(1, Math.round((detourKm / speedKmH) * 60 + 2)); // +2 mins for turnoffs

    return { detourKm, detourMinutes };
  }

  /**
   * Standard route calculation between origin and destination with real corridor support.
   */
  static async calculateRoute(params: {
    origin: string;
    destination: string;
    travelMode?: TravelMode;
    waypoints?: Waypoint[];
  }): Promise<RouteInfo> {
    const travelMode = params.travelMode || 'driving';
    const waypoints = params.waypoints || [];

    // Pre-defined corridor coordinates for popular routes, or calculated geodetic paths
    const corridorData = this.getCorridorCoordinates(params.origin, params.destination);

    // Calculate cumulative distance and duration
    let totalDistanceKm = corridorData.baseDistanceKm;
    let totalDurationMinutes = corridorData.baseDurationMinutes;

    // Adjust for travel mode
    if (travelMode === 'walking') {
      totalDurationMinutes = Math.round((totalDistanceKm / 4.5) * 60);
    } else if (travelMode === 'bicycling') {
      totalDurationMinutes = Math.round((totalDistanceKm / 16) * 60);
    } else if (travelMode === 'transit') {
      totalDurationMinutes = Math.round((totalDistanceKm / 45) * 60 + 20);
    }

    // Add detour distances and times for each intermediate waypoint
    waypoints.forEach(wp => {
      const { detourKm, detourMinutes } = this.estimateDetour(wp.coordinates, corridorData.path, travelMode);
      totalDistanceKm += detourKm;
      totalDurationMinutes += detourMinutes;
    });

    const routeInfo: RouteInfo = {
      origin: {
        name: corridorData.originName || params.origin,
        address: corridorData.originAddress || `${params.origin}, Region`,
        coordinates: corridorData.originCoords,
      },
      destination: {
        name: corridorData.destinationName || params.destination,
        address: corridorData.destinationAddress || `${params.destination}, Region`,
        coordinates: corridorData.destinationCoords,
      },
      distanceKm: Math.round(totalDistanceKm * 10) / 10,
      durationMinutes: Math.round(totalDurationMinutes),
      coordinatesPath: corridorData.path,
      travelMode,
      summary: corridorData.summary,
      waypoints,
      alternativeRoutes: corridorData.alternativeRoutes,
    };

    return routeInfo;
  }

  /**
   * Discover candidate hotels, clean washrooms, restaurants, rest stops along the active route.
   */
  static findStopsAlongRoute(
    route: RouteInfo,
    options: {
      category?: PlaceCategory | 'all';
      maxDetourMinutes?: number;
      minHygieneStatus?: 'all' | 'verified_only' | 'inspected_only';
      requireAccessible?: boolean;
      requireSoap?: boolean;
      requireWater?: boolean;
    } = {}
  ): Place[] {
    const seedPlaces = HygieneService.getSeedPlaces();

    // Calculate real detour distance and minutes for each place relative to the current route polyline
    const placesWithRouteDetour = seedPlaces.map(place => {
      const { detourKm, detourMinutes } = this.estimateDetour(place.coordinates, route.coordinatesPath, route.travelMode);
      return {
        ...place,
        detourKm,
        detourMinutes,
      };
    });

    // CRITICAL GEOGRAPHIC PROXIMITY ISOLATION:
    // Only return places within an 80 km corridor radius of the actual polyline.
    // This strictly prevents Italian stops (e.g. Autogrill in Bologna/Amalfi) from appearing on Indian or global routes!
    const corridorPlaces = placesWithRouteDetour.filter(p => (p.detourKm || 0) <= 80);

    return HygieneService.filterPlaces(corridorPlaces, options);
  }

  /**
   * Internal corridor coordinates generator for deterministic real-world routes
   */
  private static getCorridorCoordinates(origin: string, destination: string) {
    const origLower = origin.toLowerCase();
    const destLower = destination.toLowerCase();

    // Corridor 1: Naples / Sorrento / Positano to Amalfi Coast (Preserved Reference)
    if (origLower.includes('nap') || origLower.includes('sorrento') || origLower.includes('posi') || destLower.includes('amal') || destLower.includes('posi') || destLower.includes('ravello')) {
      const path: [number, number][] = [
        [40.8518, 14.2681], // Naples
        [40.8250, 14.3400], // Portici
        [40.7500, 14.4850], // Pompeii
        [40.6720, 14.4870], // Castellammare di Stabia
        [40.6263, 14.3758], // Sorrento
        [40.6120, 14.4450], // Sant'Agata
        [40.6281, 14.4850], // Positano
        [40.6150, 14.5300], // Praiano
        [40.6180, 14.5700], // Furore Fjord
        [40.6300, 14.5900], // Conca dei Marini
        [40.6340, 14.6027], // Amalfi
        [40.6492, 14.6115], // Ravello
      ];

      return {
        originName: origin || 'Naples Central',
        originAddress: 'Piazza Garibaldi, Naples, Italy',
        originCoords: { lat: 40.8518, lng: 14.2681 },
        destinationName: destination || 'Amalfi Coast (Amalfi & Ravello)',
        destinationAddress: 'Piazza Duomo, Amalfi (SA), Italy',
        destinationCoords: { lat: 40.6492, lng: 14.6115 },
        baseDistanceKm: 62.4,
        baseDurationMinutes: 78,
        summary: 'Via Autostrada A3 and SS163 Amalfitana Scenic Highway',
        path,
        alternativeRoutes: [
          {
            summary: 'Via SS145 Panoramica and Agerola Mountain Pass',
            distanceKm: 58.2,
            durationMinutes: 85,
            coordinatesPath: [
              [40.8518, 14.2681],
              [40.7500, 14.4850],
              [40.6382, 14.5428],
              [40.6492, 14.6115],
            ] as [number, number][],
          },
        ],
      };
    }

    // Corridor 2: Pune / Mumbai to Mahabaleshwar & Kaas Plateau (Maharashtra Western Ghats)
    if (
      origLower.includes('mahaba') || destLower.includes('mahaba') ||
      origLower.includes('panchg') || destLower.includes('panchg') ||
      ((origLower.includes('pune') || origLower.includes('mumbai') || origLower.includes('satara')) && (destLower.includes('mahaba') || destLower.includes('satara') || destLower.includes('kaas') || destLower.includes('pratapgad')))
    ) {
      const isFromMumbai = origLower.includes('mumbai') || origLower.includes('bombay');
      const originName = isFromMumbai ? 'Mumbai' : 'Pune';
      const originAddress = isFromMumbai ? 'Nariman Point, Mumbai, Maharashtra' : 'Swargate / Deccan, Pune, Maharashtra';
      const originCoords = isFromMumbai ? { lat: 18.9220, lng: 72.8347 } : { lat: 18.5204, lng: 73.8567 };

      const path: [number, number][] = isFromMumbai
        ? [
            [18.9220, 72.8347], // Mumbai
            [19.0330, 73.0297], // Navi Mumbai
            [18.7500, 73.4000], // Khandala Ghat
            [18.5204, 73.8567], // Pune
            [18.4485, 73.8580], // Katraj Tunnel
            [18.1365, 74.0322], // Shirwal NH48
            [17.9940, 74.0205], // Surur Phata
            [17.9490, 73.8920], // Wai
            [17.9350, 73.8400], // Pasarni Ghat
            [17.9242, 73.8051], // Panchgani
            [17.9228, 73.7467], // Gureghar / Mapro Garden
            [17.9255, 73.6644], // Venna Lake
            [17.9237, 73.6586], // Mahabaleshwar
          ]
        : [
            [18.5204, 73.8567], // Pune Swargate
            [18.4485, 73.8580], // Katraj Tunnel NH48
            [18.1365, 74.0322], // Shirwal NH48
            [17.9940, 74.0205], // Surur Phata (Wai Turnoff)
            [17.9490, 73.8920], // Wai Krishna Valley
            [17.9350, 73.8400], // Pasarni Ghat Scenic Overlook
            [17.9242, 73.8051], // Panchgani Table Land
            [17.9228, 73.7467], // Gureghar / Mapro Garden
            [17.9255, 73.6644], // Venna Lake Promenade
            [17.9237, 73.6586], // Mahabaleshwar Center
          ];

      const baseDistance = isFromMumbai ? 230.0 : 121.5;
      const baseDuration = isFromMumbai ? 310 : 175;

      return {
        originName,
        originAddress,
        originCoords,
        destinationName: destination || 'Mahabaleshwar & Kaas Plateau',
        destinationAddress: 'Mahabaleshwar, Satara District, Maharashtra, India',
        destinationCoords: { lat: 17.9237, lng: 73.6586 },
        baseDistanceKm: baseDistance,
        baseDurationMinutes: baseDuration,
        summary: 'Via NH48 Highway and SH72 Wai-Panchgani Ghat Scenic Corridor',
        path,
        alternativeRoutes: [
          {
            summary: 'Via Bhor Ghat and Medha Scenic Mountain Pass',
            distanceKm: baseDistance + 18.0,
            durationMinutes: baseDuration + 35,
            coordinatesPath: [
              path[0],
              [18.0500, 73.8500],
              [17.9237, 73.6586],
            ] as [number, number][],
          },
        ],
      };
    }

    // Corridor 3: Delhi to Agra (Yamuna Expressway)
    if (
      (origLower.includes('delhi') || origLower.includes('noida') || origLower.includes('gurgaon')) &&
      (destLower.includes('agra') || destLower.includes('taj') || destLower.includes('fatehpur'))
    ) {
      const path: [number, number][] = [
        [28.6139, 77.2090], // Delhi Center
        [28.4595, 77.0266], // Greater Noida
        [28.1800, 77.5500], // Jewar Toll
        [27.8000, 77.8200], // Mathura Bypass
        [27.3500, 77.9500], // Khandauli
        [27.1751, 78.0421], // Agra / Taj Mahal
      ];

      return {
        originName: 'Delhi',
        originAddress: 'Connaught Place, New Delhi, India',
        originCoords: { lat: 28.6139, lng: 77.2090 },
        destinationName: destination || 'Agra (Taj Mahal)',
        destinationAddress: 'Tajganj, Agra, Uttar Pradesh, India',
        destinationCoords: { lat: 27.1751, lng: 78.0421 },
        baseDistanceKm: 215.0,
        baseDurationMinutes: 195,
        summary: 'Via Yamuna Expressway and Taj Express Highway',
        path,
      };
    }

    // Corridor 4: Tokyo to Kyoto / Osaka (Golden Route)
    if (origLower.includes('tokyo') || destLower.includes('kyoto') || destLower.includes('tokyo')) {
      const path: [number, number][] = [
        [35.6812, 139.7671], // Tokyo Station
        [35.4437, 139.6380], // Yokohama
        [35.2500, 139.1500], // Odawara
        [35.1000, 138.8600], // Numazu / Mt Fuji view
        [34.9700, 138.3800], // Shizuoka
        [34.7100, 137.7200], // Hamamatsu
        [35.1815, 136.9066], // Nagoya
        [35.3000, 136.1500], // Hikone / Lake Biwa
        [35.0116, 135.7681], // Kyoto
      ];

      return {
        originName: 'Tokyo',
        originAddress: 'Marunouchi, Chiyoda City, Tokyo, Japan',
        originCoords: { lat: 35.6812, lng: 139.7671 },
        destinationName: 'Kyoto',
        destinationAddress: 'Shimogyo Ward, Kyoto, Japan',
        destinationCoords: { lat: 35.0116, lng: 135.7681 },
        baseDistanceKm: 458.0,
        baseDurationMinutes: 320,
        summary: 'Tomei & Meishin Expressway Corridor',
        path,
      };
    }

    // Dynamic Geolocation Resolver for any arbitrary origin and destination
    const KNOWN_COORDS: Record<string, { lat: number; lng: number; address: string }> = {
      paris: { lat: 48.8566, lng: 2.3522, address: 'Paris, Île-de-France, France' },
      london: { lat: 51.5074, lng: -0.1278, address: 'London, United Kingdom' },
      rome: { lat: 41.9028, lng: 12.4964, address: 'Rome, Lazio, Italy' },
      mumbai: { lat: 19.0760, lng: 72.8777, address: 'Mumbai, Maharashtra, India' },
      pune: { lat: 18.5204, lng: 73.8567, address: 'Pune, Maharashtra, India' },
      delhi: { lat: 28.6139, lng: 77.2090, address: 'New Delhi, India' },
      jaipur: { lat: 26.9124, lng: 75.7873, address: 'Jaipur, Rajasthan, India' },
      bangalore: { lat: 12.9716, lng: 77.5946, address: 'Bengaluru, Karnataka, India' },
      zurich: { lat: 47.3769, lng: 8.5417, address: 'Zürich, Switzerland' },
      zermatt: { lat: 45.9763, lng: 7.7491, address: 'Zermatt, Valais, Switzerland' },
      cairo: { lat: 30.0444, lng: 31.2357, address: 'Cairo, Egypt' },
      sydney: { lat: -33.8688, lng: 151.2093, address: 'Sydney, NSW, Australia' },
      cusco: { lat: -13.5319, lng: -71.9675, address: 'Cusco, Peru' },
      machu: { lat: -13.1631, lng: -72.5450, address: 'Machu Picchu Sanctuary, Peru' },
      petra: { lat: 30.3285, lng: 35.4444, address: 'Petra, Ma\'an, Jordan' },
      bali: { lat: -8.4095, lng: 115.1889, address: 'Bali, Indonesia' },
    };

    let originCoords = { lat: 18.5204, lng: 73.8567 }; // Pune baseline
    let originAddress = `${origin}, Region`;
    for (const [k, v] of Object.entries(KNOWN_COORDS)) {
      if (origLower.includes(k)) {
        originCoords = { lat: v.lat, lng: v.lng };
        originAddress = v.address;
        break;
      }
    }

    let destCoords = { lat: 17.9237, lng: 73.6586 }; // Mahabaleshwar baseline
    let destAddress = `${destination}, Region`;
    for (const [k, v] of Object.entries(KNOWN_COORDS)) {
      if (destLower.includes(k)) {
        destCoords = { lat: v.lat, lng: v.lng };
        destAddress = v.address;
        break;
      }
    }

    const steps = 8;
    const path: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      const lat = originCoords.lat + (destCoords.lat - originCoords.lat) * fraction;
      const jitter = Math.sin(fraction * Math.PI) * 0.04;
      const lng = originCoords.lng + (destCoords.lng - originCoords.lng) * fraction + jitter;
      path.push([lat, lng]);
    }

    const dist = this.calculateHaversineDistance(originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng);

    return {
      originName: origin,
      originAddress,
      originCoords,
      destinationName: destination,
      destinationAddress: destAddress,
      destinationCoords: destCoords,
      baseDistanceKm: Math.max(12, Math.round(dist * 1.25)),
      baseDurationMinutes: Math.max(20, Math.round((dist * 1.25 / 65) * 60)),
      summary: `Direct Regional Highway Route from ${origin} to ${destination}`,
      path,
    };
  }
}

