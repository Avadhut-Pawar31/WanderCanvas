/**
 * Global Geocoding & Local Area Discovery Service
 * Provides universal location search down to the smallest village, street, and local neighborhood
 * using Google Places Autocomplete (client) + OpenStreetMap Photon / Nominatim (server fallback).
 */

import { GeoEntity, GeoEntityType, GeoPlaceCategory, HierarchicalSearchResult } from '@/types/hierarchicalGeo';
import { HierarchicalGeoService } from './hierarchicalGeoService';

export interface GlobalGeocodeItem {
  id: string;
  name: string;
  displayName: string;
  entityType: GeoEntityType;
  typeLabel: string;
  category: GeoPlaceCategory;
  coordinates: {
    lat: number;
    lng: number;
  };
  countryCode: string;
  countryName: string;
  state?: string;
  district?: string;
  locality?: string;
  hierarchyBreadcrumbs: string[];
  source: 'verified_catalogue' | 'google_places' | 'osm_photon';
}

export class GlobalGeocodingService {
  /**
   * Universal search: Combines verified catalogue with live global geocoding
   * so every village, town, and local area across Bihar, India, and the world is discoverable.
   */
  static async searchLocations(
    query: string,
    options: {
      limit?: number;
      countryFilter?: string;
    } = {}
  ): Promise<HierarchicalSearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    const limit = options.limit || 10;

    // 1. First priority: Exact or partial matches from Verified Catalogue
    const localResults = HierarchicalGeoService.search(q, { limit: Math.min(limit, 8) });

    // If we have enough verified matches, return them immediately
    if (localResults.length >= limit) {
      return localResults.slice(0, limit);
    }

    // 2. Fetch live global geocoded places for any local area not yet in static catalogue
    const globalItems = await this.fetchPhotonGeocode(q, {
      limit: limit - localResults.length + 3,
      countryFilter: options.countryFilter || 'IN',
    });

    // 3. Convert global items into HierarchicalSearchResult format and merge without duplicates
    const seenNames = new Set<string>(
      localResults.map((r) => r.entity.canonicalName.toLowerCase().trim())
    );

    const mergedResults: HierarchicalSearchResult[] = [...localResults];

    for (const item of globalItems) {
      const lower = item.name.toLowerCase().trim();
      if (seenNames.has(lower)) continue;
      seenNames.add(lower);

      const dynamicEntity = this.convertToGeoEntity(item);

      // Register dynamically into in-memory catalogue so navigation to /destination/[id] or /place/[id] works!
      HierarchicalGeoService.registerDynamicEntity(dynamicEntity);

      const breadcrumbs = HierarchicalGeoService.getBreadcrumbs(dynamicEntity.id);

      mergedResults.push({
        entity: dynamicEntity,
        matchType: 'fuzzy_substring',
        matchedQueryToken: q,
        breadcrumbs,
      });

      if (mergedResults.length >= limit) break;
    }

    return mergedResults;
  }

  /**
   * Query Photon geocoder (OpenStreetMap-powered, worldwide, fast, free, no rate limiting).
   */
  private static async fetchPhotonGeocode(
    query: string,
    options: { limit?: number; countryFilter?: string }
  ): Promise<GlobalGeocodeItem[]> {
    try {
      const limit = options.limit || 8;
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=${limit}`;

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WanderCanvas-TravelApp/1.0',
        },
        next: { revalidate: 3600 }, // Cache 1 hour
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      if (!data || !Array.isArray(data.features)) {
        return [];
      }

      const items: GlobalGeocodeItem[] = [];

      for (const feature of data.features) {
        const props = feature.properties || {};
        const coords = feature.geometry?.coordinates; // [lng, lat]
        if (!coords || coords.length < 2) continue;

        const lng = coords[0];
        const lat = coords[1];

        const name = props.name || props.street || props.city || props.district || query;
        const countryCode = (props.countrycode || props.country || 'IN').toUpperCase();
        const countryName = props.country || (countryCode === 'IN' ? 'India' : 'International');
        const state = props.state;
        const district = props.district || props.county;
        const city = props.city || props.town || props.village;
        const locality = props.locality || props.suburb || props.neighbourhood;

        // Determine Entity Type
        let entityType: GeoEntityType = 'locality';
        let typeLabel = 'Local Area / Settlement';
        let category: GeoPlaceCategory = 'administrative';

        const osmValue = props.osm_value || props.type || '';
        if (osmValue === 'country') {
          entityType = 'country';
          typeLabel = 'Country';
        } else if (osmValue === 'state' || osmValue === 'province') {
          entityType = 'state';
          typeLabel = 'State / Province';
        } else if (osmValue === 'district' || osmValue === 'county') {
          entityType = 'district';
          typeLabel = 'District / County';
        } else if (osmValue === 'city') {
          entityType = 'city';
          typeLabel = 'City';
        } else if (osmValue === 'town') {
          entityType = 'town';
          typeLabel = 'Town';
        } else if (osmValue === 'village' || osmValue === 'hamlet') {
          entityType = 'village';
          typeLabel = 'Village';
        } else if (['suburb', 'neighbourhood', 'locality', 'quarter'].includes(osmValue)) {
          entityType = 'suburb';
          typeLabel = 'Neighborhood / Local Area';
        } else if (['monument', 'memorial', 'castle', 'ruins', 'archaeological'].includes(osmValue)) {
          entityType = 'attraction';
          typeLabel = 'Heritage & Monument';
          category = 'heritage';
        } else if (['viewpoint', 'peak', 'waterfall', 'nature_reserve'].includes(osmValue)) {
          entityType = 'attraction';
          typeLabel = 'Scenic Natural Landmark';
          category = 'nature_reserve';
        }

        // Build hierarchical path items
        const breadcrumbsList: string[] = [];
        if (countryName) breadcrumbsList.push(countryName);
        if (state && state !== countryName) breadcrumbsList.push(state);
        if (district && district !== state && district !== name) breadcrumbsList.push(district);
        if (city && city !== district && city !== name) breadcrumbsList.push(city);
        if (locality && locality !== name) breadcrumbsList.push(locality);
        breadcrumbsList.push(name);

        const cleanId = `geo-global-${countryCode.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.round(lat * 100)}-${Math.round(lng * 100)}`;

        items.push({
          id: cleanId,
          name,
          displayName: [name, locality, city, district, state, countryName].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', '),
          entityType,
          typeLabel,
          category,
          coordinates: { lat, lng },
          countryCode,
          countryName,
          state,
          district,
          locality: locality || city,
          hierarchyBreadcrumbs: breadcrumbsList,
          source: 'osm_photon',
        });
      }

      return items;
    } catch (err) {
      console.warn('Photon geocoding fallback warning:', err);
      return [];
    }
  }

  /**
   * Convert dynamic geocoded place into a standard GeoEntity
   */
  private static convertToGeoEntity(item: GlobalGeocodeItem): GeoEntity {
    // Attempt to map to a parent state or country in our catalogue
    let parentId = 'country-in';
    if (item.countryCode === 'IN') {
      if (item.state && /bihar/i.test(item.state)) {
        parentId = 'adm1-in-br';
      } else if (item.state && /maharashtra/i.test(item.state)) {
        parentId = 'adm1-in-mh';
      }
    } else {
      parentId = `country-${item.countryCode.toLowerCase()}`;
    }

    const heroImages = [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=80'
    ];
    const heroImage = heroImages[Math.abs(item.name.length) % heroImages.length];

    return {
      id: item.id,
      canonicalName: item.name,
      entityType: item.entityType,
      typeLabel: item.typeLabel,
      parentId,
      countryCode: item.countryCode,
      adm1Code: item.state?.substring(0, 2).toUpperCase() || 'IN',
      alternateNames: [item.displayName],
      coordinates: item.coordinates,
      category: item.category,
      description: `${item.name} is a vibrant ${item.typeLabel.toLowerCase()} in ${[item.district, item.state, item.countryName].filter(Boolean).join(', ')}. Discovered via WanderCanvas global live location engine.`,
      heroImage,
      hierarchyPath: ['cont-asia', parentId, item.id],
      sourceType: 'osm_derived',
      isVerified: false,
      metadata: {
        address: item.displayName,
        tags: [item.typeLabel, item.state || 'Local Region', item.countryName],
      },
    };
  }
}
