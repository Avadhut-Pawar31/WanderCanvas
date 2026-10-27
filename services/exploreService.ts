import { 
  Continent, 
  Country, 
  GlobalDestination, 
  CountryCategory, 
  Subdivision, 
  ContinentId 
} from '@/types/geography';
import { CONTINENTS } from '@/data/geography/continents';
import { COUNTRIES } from '@/data/geography/countries';
import { GLOBAL_DESTINATIONS, COUNTRY_CATEGORIES_META } from '@/data/geography/destinations';

export interface ExploreFilterOptions {
  continentId?: ContinentId | 'all';
  countryId?: string | 'all';
  subdivisionId?: string | 'all';
  category?: CountryCategory | 'all';
  searchQuery?: string;
}

export class ExploreService {
  /**
   * Continents Level 1
   */
  static getContinents(): Continent[] {
    return CONTINENTS;
  }

  static getContinentById(id: string): Continent | undefined {
    return CONTINENTS.find((c) => c.id === id);
  }

  /**
   * Countries Level 2
   */
  static getCountries(continentId?: string): Country[] {
    if (!continentId || continentId === 'all') {
      return COUNTRIES;
    }
    return COUNTRIES.filter((c) => c.continentId === continentId);
  }

  static getCountryById(id: string): Country | undefined {
    return COUNTRIES.find((c) => c.id.toLowerCase() === id.toLowerCase());
  }

  /**
   * Subdivisions Level 3
   */
  static getSubdivisions(countryId: string): Subdivision[] {
    const country = this.getCountryById(countryId);
    return country?.subdivisions || [];
  }

  /**
   * Country-Specific Discovery Categories Level 4
   */
  static getCategoryMeta(cat: CountryCategory) {
    return COUNTRY_CATEGORIES_META[cat] || { label: cat, icon: '📍' };
  }

  static getAllCategoryMetas() {
    return COUNTRY_CATEGORIES_META;
  }

  /**
   * Multi-dimensional Real-time Query Filter
   */
  static getDestinations(options: ExploreFilterOptions = {}): GlobalDestination[] {
    const { continentId, countryId, subdivisionId, category, searchQuery } = options;

    return GLOBAL_DESTINATIONS.filter((dest) => {
      // 1. Continent filter
      if (continentId && continentId !== 'all' && dest.continentId !== continentId) {
        return false;
      }

      // 2. Country filter
      if (countryId && countryId !== 'all' && dest.countryId !== countryId) {
        return false;
      }

      // 3. Subdivision filter
      if (subdivisionId && subdivisionId !== 'all' && dest.subdivisionId !== subdivisionId) {
        return false;
      }

      // 4. Category filter
      if (category && category !== 'all' && dest.category !== category) {
        return false;
      }

      // 5. Intelligent Multi-Token Search Query across full destination & geographical corpus
      if (searchQuery && searchQuery.trim()) {
        const rawQ = searchQuery.toLowerCase().trim();
        const country = COUNTRIES.find((c) => c.id === dest.countryId);
        const subdivision = country?.subdivisions.find((s) => s.id === dest.subdivisionId);

        // Build a comprehensive search corpus for this destination
        const corpus = [
          dest.name,
          dest.description,
          dest.category,
          dest.categoryLabel || '',
          country?.name || '',
          country?.isoCode || '',
          country?.capital || '',
          subdivision?.name || '',
          subdivision?.description || '',
          ...dest.highlights,
        ].join(' ').toLowerCase();

        // A. Direct full-phrase substring match
        if (corpus.includes(rawQ)) {
          return true;
        }

        // B. Special Wonder recognition (7 Wonders of the World, New 7 Wonders, Ancient Wonders)
        const isWonderQuery = /7\s*wonders?|seven\s*wonders?|world\s*wonder|unesco\s*wonder/i.test(rawQ);
        if (isWonderQuery && (corpus.includes('wonder') || corpus.includes('wonders') || corpus.includes('unesco'))) {
          return true;
        }

        // C. Tokenized matching: all terms typed by user must match somewhere in corpus
        const tokens = rawQ.split(/[\s,]+/).filter(Boolean);
        if (tokens.length > 0) {
          const allTokensMatch = tokens.every((token) => corpus.includes(token));
          if (allTokensMatch) {
            return true;
          }
        }

        return false;
      }

      return true;
    });
  }

  /**
   * Global discovery statistics
   */
  static getStats() {
    return {
      continentsCount: CONTINENTS.length,
      countriesCount: COUNTRIES.length,
      destinationsCount: GLOBAL_DESTINATIONS.length,
    };
  }
}
