/**
 * ==============================================================================
 * WANDERCANVAS — HIERARCHICAL GEOGRAPHIC DISCOVERY SERVICE
 * ==============================================================================
 * Core search and navigation engine providing:
 *   - Flexible recursive parent-child hierarchy navigation
 *   - Global search with typo tolerance, alternate names & multilingual aliases
 *   - Category-in-location intent parsing ("petrol pump in Mahabaleshwar")
 *   - Real dynamic breadcrumb resolution (Asia -> India -> Maharashtra -> Satara -> ...)
 *   - Ambiguity disambiguation (Satara District vs Satara City)
 * ==============================================================================
 */

import { HIERARCHICAL_GEO_ENTITIES } from '@/data/geography/hierarchicalCatalogue';
import {
  GeoBreadcrumbItem,
  GeoEntity,
  GeoEntityType,
  GeoPlaceCategory,
  HierarchicalBrowseState,
  HierarchicalSearchResult,
  LocationHierarchyNode
} from '@/types/hierarchicalGeo';

// Category alias dictionary for intent parsing
const CATEGORY_INTENT_MAP: Record<string, GeoPlaceCategory> = {
  // Fuel / Petrol
  'petrol pump': 'petrol_pump',
  'petrol pumps': 'petrol_pump',
  'fuel station': 'petrol_pump',
  'fuel stations': 'petrol_pump',
  'gas station': 'petrol_pump',
  'gas stations': 'petrol_pump',
  'petrol': 'petrol_pump',
  'diesel': 'petrol_pump',
  'cng': 'petrol_pump',
  // EV
  'ev charging': 'ev_charging',
  'ev charger': 'ev_charging',
  'ev chargers': 'ev_charging',
  'electric vehicle': 'ev_charging',
  // Restrooms
  'washroom': 'washroom',
  'washrooms': 'washroom',
  'restroom': 'washroom',
  'restrooms': 'washroom',
  'toilet': 'washroom',
  'toilets': 'washroom',
  'comfort point': 'washroom',
  'clean toilet': 'washroom',
  'clean washroom': 'washroom',
  // Hotels / Resorts
  'hotel': 'hotel',
  'hotels': 'hotel',
  'resort': 'resort',
  'resorts': 'resort',
  'stay': 'hotel',
  'stays': 'hotel',
  'accommodation': 'hotel',
  'accommodations': 'hotel',
  // Restaurants / Cafes
  'restaurant': 'restaurant',
  'restaurants': 'restaurant',
  'cafe': 'cafe',
  'cafes': 'cafe',
  'food': 'restaurant',
  'dining': 'restaurant',
  'eatery': 'restaurant',
  'eateries': 'restaurant',
  // Attractions / POIs
  'waterfall': 'waterfall',
  'waterfalls': 'waterfall',
  'falls': 'waterfall',
  'fort': 'heritage',
  'forts': 'heritage',
  'heritage': 'heritage',
  'lake': 'lake',
  'lakes': 'lake',
  'viewpoint': 'viewpoint',
  'viewpoints': 'viewpoint',
  'point': 'viewpoint',
  'points': 'viewpoint',
  'temple': 'temple',
  'temples': 'temple',
  'plateau': 'nature_reserve'
};

export class HierarchicalGeoService {
  private static entitiesById: Map<string, GeoEntity> = new Map();
  private static childrenByParentId: Map<string, GeoEntity[]> = new Map();
  private static initialized = false;

  private static ensureInitialized() {
    if (this.initialized) return;

    this.entitiesById.clear();
    this.childrenByParentId.clear();

    for (const entity of HIERARCHICAL_GEO_ENTITIES) {
      this.entitiesById.set(entity.id, entity);

      const parentKey = entity.parentId || '__ROOT__';
      if (!this.childrenByParentId.has(parentKey)) {
        this.childrenByParentId.set(parentKey, []);
      }
      this.childrenByParentId.get(parentKey)!.push(entity);
    }

    this.initialized = true;
  }

  /**
   * Fetch single entity by ID.
   */
  static getEntityById(id: string): GeoEntity | null {
    this.ensureInitialized();
    return this.entitiesById.get(id) || null;
  }

  /**
   * Fetch all registered entities.
   */
  static getAllEntities(): GeoEntity[] {
    this.ensureInitialized();
    return Array.from(this.entitiesById.values());
  }

  /**
   * Get direct children of a given parent ID.
   * If parentId is null or '__ROOT__', returns all Continents.
   */
  static getChildren(parentId: string | null): GeoEntity[] {
    this.ensureInitialized();
    const key = parentId || '__ROOT__';
    return this.childrenByParentId.get(key) || [];
  }

  /**
   * Recursively reconstruct actual parent breadcrumbs up to the root continent.
   * Uses real parent-child graph relationships.
   */
  static getBreadcrumbs(entityId: string): GeoBreadcrumbItem[] {
    this.ensureInitialized();
    const breadcrumbs: GeoBreadcrumbItem[] = [];
    const visited = new Set<string>();

    let current = this.entitiesById.get(entityId);

    while (current && !visited.has(current.id)) {
      visited.add(current.id);

      breadcrumbs.unshift({
        id: current.id,
        name: current.canonicalName,
        entityType: current.entityType,
        typeLabel: current.typeLabel || current.entityType
      });

      if (!current.parentId) break;
      current = this.entitiesById.get(current.parentId);
    }

    return breadcrumbs;
  }

  /**
   * Get all descendants under an entity (children, grandchildren, etc.)
   */
  static getDescendants(entityId: string): GeoEntity[] {
    this.ensureInitialized();
    const descendants: GeoEntity[] = [];
    const queue = [...this.getChildren(entityId)];

    while (queue.length > 0) {
      const item = queue.shift()!;
      descendants.push(item);
      const subChildren = this.getChildren(item.id);
      queue.push(...subChildren);
    }

    return descendants;
  }

  /**
   * Get complete hierarchical browsing state for the Explore interface.
   */
  static getBrowseState(currentEntityId?: string): HierarchicalBrowseState {
    this.ensureInitialized();

    const allEntities = Array.from(this.entitiesById.values());
    const stats = {
      totalContinents: allEntities.filter((e) => e.entityType === 'continent').length,
      totalCountries: allEntities.filter((e) => e.entityType === 'country').length,
      totalAdministrativeAreas: allEntities.filter((e) => e.entityType === 'state' || e.entityType === 'district').length,
      totalCitiesLocalities: allEntities.filter(
        (e) => e.entityType === 'city' || e.entityType === 'town' || e.entityType === 'village' || e.entityType === 'locality'
      ).length,
      totalAttractions: allEntities.filter((e) => e.entityType === 'attraction' || e.entityType === 'tourist_region').length,
      totalBusinesses: allEntities.filter((e) => e.entityType === 'business').length
    };

    if (!currentEntityId) {
      // Root level: return continents as child subdivisions
      const continents = this.getChildren(null);
      return {
        currentEntityId: '__ROOT__',
        breadcrumbs: [],
        currentEntity: null,
        childSubdivisions: continents,
        childLocalities: [],
        childAttractions: [],
        childBusinesses: [],
        stats
      };
    }

    const currentEntity = this.getEntityById(currentEntityId);
    if (!currentEntity) {
      return this.getBrowseState(undefined);
    }

    const breadcrumbs = this.getBreadcrumbs(currentEntityId);
    const directChildren = this.getChildren(currentEntityId);

    // Group direct children by category
    const childSubdivisions = directChildren.filter(
      (c) => c.entityType === 'country' || c.entityType === 'state' || c.entityType === 'district'
    );
    const childLocalities = directChildren.filter(
      (c) =>
        c.entityType === 'city' ||
        c.entityType === 'town' ||
        c.entityType === 'village' ||
        c.entityType === 'locality' ||
        c.entityType === 'suburb' ||
        c.entityType === 'tourist_region'
    );
    const childAttractions = directChildren.filter((c) => c.entityType === 'attraction');
    const childBusinesses = directChildren.filter((c) => c.entityType === 'business');

    // If current entity is a town/village or destination without direct businesses,
    // collect businesses registered under its immediate sub-localities
    if (childBusinesses.length === 0) {
      const descendants = this.getDescendants(currentEntityId);
      const descendantBusinesses = descendants.filter((d) => d.entityType === 'business');
      childBusinesses.push(...descendantBusinesses);
    }

    return {
      currentEntityId,
      breadcrumbs,
      currentEntity,
      childSubdivisions,
      childLocalities,
      childAttractions,
      childBusinesses,
      stats
    };
  }

  /**
   * Parse composite queries like "petrol pump in Mahabaleshwar" or "hotels near Kaas"
   */
  private static parseCategoryInLocation(query: string): {
    category: GeoPlaceCategory | null;
    locationQuery: string | null;
  } {
    const q = query.toLowerCase().trim();

    // Check for " in " or " near " or " at "
    const splitRegex = /\s+(?:in|near|at|around)\s+/i;
    const parts = q.split(splitRegex);

    if (parts.length >= 2) {
      const categoryPart = parts[0].trim();
      const locationPart = parts.slice(1).join(' ').trim();

      const matchedCategory = CATEGORY_INTENT_MAP[categoryPart];
      if (matchedCategory) {
        return { category: matchedCategory, locationQuery: locationPart };
      }
    }

    // Also check direct prefix/suffix like "Mahabaleshwar petrol pump" or "Satara hotels"
    for (const [key, cat] of Object.entries(CATEGORY_INTENT_MAP)) {
      if (q.startsWith(key + ' ')) {
        const loc = q.substring(key.length).trim();
        return { category: cat, locationQuery: loc };
      }
      if (q.endsWith(' ' + key)) {
        const loc = q.substring(0, q.length - key.length).trim();
        return { category: cat, locationQuery: loc };
      }
    }

    return { category: null, locationQuery: null };
  }

  /**
   * Main intelligent search engine.
   * Supports:
   *   - Hierarchical autocomplete
   *   - Typo tolerance / alternate names / multilingual aliases
   *   - Deep direct matches
   *   - Category in location intent matching
   *   - Disambiguation badges & breadcrumbs
   */
  static search(
    rawQuery: string,
    options: {
      entityType?: GeoEntityType;
      category?: GeoPlaceCategory;
      limit?: number;
    } = {}
  ): HierarchicalSearchResult[] {
    this.ensureInitialized();

    const query = rawQuery.trim();
    if (!query) return [];

    const limit = options.limit || 15;
    const qLower = query.toLowerCase();

    // 1. Check for Category-in-Location intent (e.g. "petrol pump in Mahabaleshwar")
    const intent = this.parseCategoryInLocation(query);

    if (intent.category && intent.locationQuery) {
      const locQueryLower = intent.locationQuery.toLowerCase();
      
      // Find candidate anchor location (must be a geographic container, not an individual business)
      const anchorCandidates = Array.from(this.entitiesById.values()).filter((e) => {
        if (e.entityType === 'business') return false;
        const nameMatch = e.canonicalName.toLowerCase().includes(locQueryLower);
        const altMatch = e.alternateNames.some((alt) => alt.toLowerCase().includes(locQueryLower));
        return nameMatch || altMatch;
      });

      if (anchorCandidates.length > 0) {
        // Prioritize exact name match first, then deeper administrative specificity (locality > district > state)
        anchorCandidates.sort((a, b) => {
          const aExact = a.canonicalName.toLowerCase() === locQueryLower ? 1 : 0;
          const bExact = b.canonicalName.toLowerCase() === locQueryLower ? 1 : 0;
          if (aExact !== bExact) return bExact - aExact;

          const depthA = a.hierarchyPath?.length || 0;
          const depthB = b.hierarchyPath?.length || 0;
          return depthB - depthA;
        });

        const targetAnchor = anchorCandidates[0];
        // Gather all descendants or siblings under anchor
        const anchorDescendantIds = new Set<string>([
          targetAnchor.id,
          ...this.getDescendants(targetAnchor.id).map((d) => d.id)
        ]);

        const matchingBusinesses = Array.from(this.entitiesById.values()).filter((e) => {
          const isInHierarchy =
            (e.parentId && anchorDescendantIds.has(e.parentId)) ||
            (e.hierarchyPath && e.hierarchyPath.includes(targetAnchor.id));
          const matchesCategory =
            e.category === intent.category ||
            (intent.category === 'petrol_pump' && e.category === 'petrol_pump') ||
            (intent.category === 'hotel' && (e.category === 'hotel' || e.category === 'resort')) ||
            (intent.category === 'restaurant' && (e.category === 'restaurant' || e.category === 'cafe'));

          return isInHierarchy && matchesCategory;
        });

        if (matchingBusinesses.length > 0) {
          return matchingBusinesses.slice(0, limit).map((entity) => ({
            entity,
            matchType: 'category_in_location',
            matchedQueryToken: `${intent.category} in ${targetAnchor.canonicalName}`,
            breadcrumbs: this.getBreadcrumbs(entity.id),
            directChildrenCount: this.getChildren(entity.id).length
          }));
        }
      }
    }

    // 2. Direct Multilingual, Exact, and Substring Search
    const scoredResults: {
      entity: GeoEntity;
      score: number;
      matchType: HierarchicalSearchResult['matchType'];
      matchedToken: string;
    }[] = [];

    for (const entity of this.entitiesById.values()) {
      if (options.entityType && entity.entityType !== options.entityType) continue;
      if (options.category && entity.category !== options.category) continue;

      const cNameLower = entity.canonicalName.toLowerCase();
      let matched = false;
      let score = 0;
      let matchType: HierarchicalSearchResult['matchType'] = 'fuzzy_substring';
      let matchedToken = entity.canonicalName;

      // Exact match
      if (cNameLower === qLower) {
        matched = true;
        score = 1000;
        matchType = 'exact_name';
      }
      // Alternate names exact match
      else if (entity.alternateNames.some((alt) => alt.toLowerCase() === qLower)) {
        matched = true;
        score = 900;
        matchType = 'alternate_name';
        matchedToken = entity.alternateNames.find((alt) => alt.toLowerCase() === qLower) || entity.canonicalName;
      }
      // Prefix match on canonical name
      else if (cNameLower.startsWith(qLower)) {
        matched = true;
        score = 800 - (cNameLower.length - qLower.length);
        matchType = 'exact_name';
      }
      // Substring match on canonical name
      else if (cNameLower.includes(qLower)) {
        matched = true;
        score = 600 - (cNameLower.length - qLower.length);
        matchType = 'fuzzy_substring';
      }
      // Alternate names prefix or substring match
      else {
        const altMatch = entity.alternateNames.find((alt) => alt.toLowerCase().includes(qLower));
        if (altMatch) {
          matched = true;
          score = 500;
          matchType = 'alternate_name';
          matchedToken = altMatch;
        }
      }

      // Check for partial token match (e.g. "petrol pump" or "lingmala")
      if (!matched) {
        const tokens = qLower.split(/\s+/).filter(Boolean);
        const matchCount = tokens.filter((t) => cNameLower.includes(t) || entity.alternateNames.some((alt) => alt.toLowerCase().includes(t))).length;
        if (matchCount > 0 && matchCount === tokens.length) {
          matched = true;
          score = 400 + matchCount * 20;
          matchType = 'fuzzy_substring';
        }
      }

      if (matched) {
        // Disambiguation boost: prefer higher hierarchy levels or verified entities slightly
        if (entity.isVerified) score += 10;
        if (entity.entityType === 'city' || entity.entityType === 'district' || entity.entityType === 'state' || entity.entityType === 'country') {
          score += 5;
        }

        scoredResults.push({
          entity,
          score,
          matchType,
          matchedToken
        });
      }
    }

    // Sort by score descending
    scoredResults.sort((a, b) => b.score - a.score);

    return scoredResults.slice(0, limit).map((r) => ({
      entity: r.entity,
      matchType: r.matchType,
      matchedQueryToken: r.matchedToken,
      breadcrumbs: this.getBreadcrumbs(r.entity.id),
      directChildrenCount: this.getChildren(r.entity.id).length
    }));
  }
}
