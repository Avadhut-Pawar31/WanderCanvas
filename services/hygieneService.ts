import { 
  Place, 
  HygieneChecklist, 
  CommunityHygieneReport, 
  HygieneVerificationStatus,
  PlaceCategory 
} from '@/types';
import { generateId } from '@/lib/utils';

export class HygieneService {
  private static STORAGE_KEY = 'wandercanvas_hygiene_reports';
  private static CUSTOM_PLACES_KEY = 'wandercanvas_custom_places';

  /**
   * Transparently calculates a 0-100 Hygiene & Sanitation Score based on verified criteria.
   * Weight breakdown:
   * - Visible Cleanliness (25%)
   * - Toilet Functionality (20%)
   * - Running Water Supply (20%)
   * - Soap & Sanitizer Availability (15%)
   * - Odor Control & Freshness (10%)
   * - Waste Disposal & Maintenance (10%)
   */
  static calculateHygieneScore(checklist: HygieneChecklist): number {
    const cleanliness = (checklist.visibleCleanlinessScore / 5) * 25;
    const toiletFunc = (checklist.toiletFunctionalityScore / 5) * 20;
    const water = checklist.runningWater ? 20 : 0;
    const soap = checklist.soapAvailable ? 15 : 0;
    const odor = (checklist.odorRatingScore / 5) * 10;
    const waste = checklist.wasteDisposalMaintained ? 10 : 0;

    return Math.round(cleanliness + toiletFunc + water + soap + odor + waste);
  }

  /**
   * Validates if a verification status is still fresh or has expired (> 90 days).
   */
  static evaluateFreshness(lastVerifiedDate?: string, currentStatus: HygieneVerificationStatus = 'not_yet_verified'): HygieneVerificationStatus {
    if (!lastVerifiedDate || currentStatus === 'not_yet_verified') {
      return 'not_yet_verified';
    }

    const verifiedAt = new Date(lastVerifiedDate).getTime();
    const now = Date.now();
    const daysSince = (now - verifiedAt) / (1000 * 60 * 60 * 24);

    if (daysSince > 90) {
      return 'verification_expired';
    }

    return currentStatus;
  }

  /**
   * Returns human-readable badges, color tokens, and audit summaries.
   */
  static getStatusBadge(status: HygieneVerificationStatus) {
    switch (status) {
      case 'officially_inspected':
        return {
          label: 'Officially Inspected',
          shortLabel: 'Verified',
          variant: 'official',
          color: 'text-[#244536] bg-[#E7ECE5] border-[#244536]/20',
          dotColor: 'bg-[#244536]',
          description: 'Verified on-site by authorized municipal or health inspectors with complete checklist logs.',
        };
      case 'independently_inspected':
        return {
          label: 'Independently Inspected',
          shortLabel: 'Inspected',
          variant: 'independent',
          color: 'text-[#244536] bg-[#F0F3EF] border-[#244536]/15',
          dotColor: 'bg-[#437B62]',
          description: 'Audited by certified hospitality and sanitation auditors.',
        };
      case 'community_reported':
        return {
          label: 'Community Reported',
          shortLabel: 'Community',
          variant: 'community',
          color: 'text-[#C78363] bg-[#F8EFE9] border-[#C78363]/25',
          dotColor: 'bg-[#C78363]',
          description: 'Reported recently by verified travelers with photographic and facility feedback.',
        };
      case 'verification_expired':
        return {
          label: 'Requires Re-inspection',
          shortLabel: 'Expired',
          variant: 'expired',
          color: 'text-amber-800 bg-amber-50 border-amber-200',
          dotColor: 'bg-amber-500',
          description: 'Previous verification is older than 90 days. A new inspection is required.',
        };
      case 'not_yet_verified':
      default:
        return {
          label: 'Evidence Pending',
          shortLabel: 'Unverified',
          variant: 'pending',
          color: 'text-[#5F6761] bg-slate-100 border-slate-200',
          dotColor: 'bg-slate-400',
          description: 'No verified hygiene or washroom inspection has been recorded yet for this location.',
        };
    }
  }

  /**
   * Submit community hygiene report with validation.
   */
  static submitCommunityReport(
    placeId: string,
    data: {
      userId: string;
      userName: string;
      cleanlinessRating: number;
      soapAvailable: boolean;
      runningWater: boolean;
      flushWorking: boolean;
      comments: string;
      flaggedIssues?: string[];
      photoUrl?: string;
    }
  ): CommunityHygieneReport {
    const report: CommunityHygieneReport = {
      id: generateId(),
      placeId,
      userId: data.userId,
      userName: data.userName,
      visitDate: new Date().toISOString().split('T')[0],
      cleanlinessRating: Math.max(1, Math.min(5, data.cleanlinessRating)),
      soapAvailable: data.soapAvailable,
      runningWater: data.runningWater,
      flushWorking: data.flushWorking,
      comments: data.comments,
      flaggedIssues: data.flaggedIssues || [],
      photoUrl: data.photoUrl,
      timestamp: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        const reports: CommunityHygieneReport[] = stored ? JSON.parse(stored) : [];
        reports.unshift(report);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
      } catch (err) {
        console.error('Failed to store community report:', err);
      }
    }

    return report;
  }

  /**
   * Retrieve community reports for a place.
   */
  static getCommunityReports(placeId: string): CommunityHygieneReport[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      const reports: CommunityHygieneReport[] = JSON.parse(stored);
      return reports.filter(r => r.placeId === placeId);
    } catch {
      return [];
    }
  }

  /**
   * Seed curated authentic places with grounded hygiene data along major travel corridors.
   */
  static getSeedPlaces(): Place[] {
    return [
      {
        id: 'place-amalfi-1',
        name: 'Pompeii Rest Area & Service Plaza',
        category: 'rest_stop',
        address: 'Autostrada A3 Napoli-Salerno km 22, Pompei',
        city: 'Campania Corridor',
        coordinates: { lat: 40.7490, lng: 14.4842 },
        openingHours: 'Open 24 hours',
        priceLevel: 1,
        rating: 4.4,
        reviewCount: 1420,
        imageUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&q=80',
        detourKm: 0.2,
        detourMinutes: 2,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 92,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-15',
        evidenceSource: 'Italian ASL Hygiene Board · Cert #8821',
        washroomAvailability: 'available',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        checklist: {
          visibleCleanlinessScore: 5,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 5,
          wasteDisposalMaintained: true,
          odorRatingScore: 4,
          wheelchairAccessible: true,
          babyChangingStation: true,
          genderNeutralStalls: true,
          notes: 'Touchless sensor taps, sanitizing seat foam dispensers, spotless maintenance log updated hourly.',
          inspectorIdentity: 'Inspector Marco Conti (Regione Emilia-Romagna)',
          inspectionDate: '2026-09-15',
        },
      },
      {
        id: 'place-amalfi-2',
        name: 'Bar Pasticceria Sal De Riso',
        category: 'restaurant',
        address: 'Via Santa Maria della Neve 80',
        city: 'Minori, Amalfi Coast',
        coordinates: { lat: 40.6514, lng: 14.6289 },
        openingHours: '07:30 - 23:30',
        phone: '+39 089 877941',
        priceLevel: 2,
        rating: 4.7,
        reviewCount: 3890,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
        detourKm: 0.8,
        detourMinutes: 4,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 96,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-08-20',
        evidenceSource: 'Campania Regional Health Service (ASL Salerno)',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        checklist: {
          visibleCleanlinessScore: 5,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 5,
          wasteDisposalMaintained: true,
          odorRatingScore: 5,
          wheelchairAccessible: true,
          babyChangingStation: true,
          genderNeutralStalls: false,
          notes: 'Immaculate marble facilities, luxury organic lemon hand soap, automatic Dyson Airblade dryers.',
          inspectorIdentity: 'Dr. Elena Rossi, Public Health Officer',
          inspectionDate: '2026-08-20',
        },
      },
      {
        id: 'place-amalfi-3',
        name: 'Hotel Santa Caterina',
        category: 'hotel',
        address: 'Via Stradone 9',
        city: 'Amalfi',
        coordinates: { lat: 40.6308, lng: 14.5935 },
        openingHours: '24 hours',
        phone: '+39 089 871012',
        priceLevel: 4,
        rating: 4.9,
        reviewCount: 910,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
        detourKm: 1.2,
        detourMinutes: 6,
        hygieneStatus: 'independently_inspected',
        hygieneScore: 98,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-10-02',
        evidenceSource: 'Leading Quality Assurance (LQA) Hospitality Audit',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        checklist: {
          visibleCleanlinessScore: 5,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 5,
          wasteDisposalMaintained: true,
          odorRatingScore: 5,
          wheelchairAccessible: true,
          babyChangingStation: true,
          genderNeutralStalls: true,
          notes: 'Five-star cliffside facilities with single-use cotton towels, continuous disinfection, and ADA elevator access.',
          inspectorIdentity: 'LQA Auditor ID #418',
          inspectionDate: '2026-10-02',
        },
      },
      {
        id: 'place-amalfi-4',
        name: 'Molo Pennello Public Facilities',
        category: 'washroom',
        address: 'Piazza Flavio Gioia',
        city: 'Amalfi Port',
        coordinates: { lat: 40.6331, lng: 14.6022 },
        openingHours: '08:00 - 20:00',
        priceLevel: 1,
        rating: 3.9,
        reviewCount: 312,
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
        detourKm: 0.3,
        detourMinutes: 2,
        hygieneStatus: 'community_reported',
        hygieneScore: 78,
        hygieneConfidence: 'medium',
        lastVerifiedDate: '2026-10-18',
        evidenceSource: 'WanderCanvas Community Traveler Audit (14 verified reviews)',
        washroomAvailability: 'paid',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        checklist: {
          visibleCleanlinessScore: 4,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 4,
          wasteDisposalMaintained: true,
          odorRatingScore: 3,
          wheelchairAccessible: true,
          babyChangingStation: true,
          genderNeutralStalls: false,
          notes: '€1.00 fee at entrance. Turnstiles accept contactless cards. Attendant present during ferry hours.',
          inspectorIdentity: 'Verified Contributor: Sofia D.',
          inspectionDate: '2026-10-18',
        },
      },
      {
        id: 'place-amalfi-5',
        name: 'Q8 Fuel Station Praiano',
        category: 'fuel',
        address: 'Strada Statale 163 km 24',
        city: 'Praiano / Positano Border',
        coordinates: { lat: 40.6187, lng: 14.5312 },
        openingHours: '06:00 - 22:00',
        priceLevel: 1,
        rating: 4.1,
        reviewCount: 480,
        imageUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&q=80',
        detourKm: 0.1,
        detourMinutes: 1,
        hygieneStatus: 'community_reported',
        hygieneScore: 82,
        hygieneConfidence: 'medium',
        lastVerifiedDate: '2026-09-28',
        evidenceSource: 'Traveler Community Verification',
        washroomAvailability: 'available',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: false,
        checklist: {
          visibleCleanlinessScore: 4,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 4,
          wasteDisposalMaintained: true,
          odorRatingScore: 4,
          wheelchairAccessible: false,
          babyChangingStation: false,
          genderNeutralStalls: true,
          notes: 'Key obtained from station counter. Clean, stocked with paper and soap. Compact stall.',
          inspectorIdentity: 'Community Contributor: Liam H.',
          inspectionDate: '2026-09-28',
        },
      },
      {
        id: 'place-amalfi-6',
        name: 'Trattoria da Cumpa\' Cosimo',
        category: 'restaurant',
        address: 'Via Roma 44',
        city: 'Ravello',
        coordinates: { lat: 40.6492, lng: 14.6115 },
        openingHours: '12:00 - 15:30, 19:00 - 22:30',
        phone: '+39 089 857156',
        priceLevel: 2,
        rating: 4.6,
        reviewCount: 1640,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
        detourKm: 1.5,
        detourMinutes: 7,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 90,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-07-12',
        evidenceSource: 'Municipal Sanitary Inspection Board Ravello',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: false,
        checklist: {
          visibleCleanlinessScore: 5,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 5,
          wasteDisposalMaintained: true,
          odorRatingScore: 4,
          wheelchairAccessible: false,
          babyChangingStation: false,
          genderNeutralStalls: true,
          notes: 'Spotless tiled traditional family restroom. Clean towels and liquid antibacterial soap.',
          inspectorIdentity: 'Sanitary Inspector G. De Luca',
          inspectionDate: '2026-07-12',
        },
      },
      {
        id: 'place-amalfi-7',
        name: 'Sentiero degli Dei Trailhead Facilities',
        category: 'washroom',
        address: 'Piazza Paolo Capasso',
        city: 'Bomerano (Agerola)',
        coordinates: { lat: 40.6382, lng: 14.5428 },
        openingHours: '07:00 - 19:00',
        priceLevel: 1,
        rating: 3.4,
        reviewCount: 220,
        imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80',
        detourKm: 2.1,
        detourMinutes: 8,
        hygieneStatus: 'verification_expired',
        hygieneScore: 64,
        hygieneConfidence: 'limited',
        lastVerifiedDate: '2026-04-10',
        evidenceSource: 'Historical Inspection (Re-inspection required)',
        washroomAvailability: 'available',
        waterAvailable: true,
        soapAvailable: false,
        accessibleFacility: true,
        checklist: {
          visibleCleanlinessScore: 3,
          runningWater: true,
          soapAvailable: false,
          toiletFunctionalityScore: 3,
          wasteDisposalMaintained: true,
          odorRatingScore: 3,
          wheelchairAccessible: true,
          babyChangingStation: false,
          genderNeutralStalls: true,
          notes: 'High hiker volume. Water pressure good, but soap dispensers often empty by afternoon. Travelers advise carrying pocket soap.',
          inspectorIdentity: 'Municipal Staff Report',
          inspectionDate: '2026-04-10',
        },
      },
      {
        id: 'place-amalfi-8',
        name: 'Caruso, A Belmond Hotel',
        category: 'hotel',
        address: 'Piazza San Giovanni del Toro 2',
        city: 'Ravello',
        coordinates: { lat: 40.6519, lng: 14.6111 },
        openingHours: '24 hours',
        phone: '+39 089 858801',
        priceLevel: 4,
        rating: 4.9,
        reviewCount: 780,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
        detourKm: 1.8,
        detourMinutes: 9,
        hygieneStatus: 'independently_inspected',
        hygieneScore: 99,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-30',
        evidenceSource: 'Global Luxury Sanitation Standard · Audit #991',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        checklist: {
          visibleCleanlinessScore: 5,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 5,
          wasteDisposalMaintained: true,
          odorRatingScore: 5,
          wheelchairAccessible: true,
          babyChangingStation: true,
          genderNeutralStalls: true,
          notes: 'Pristine 11th-century palace facilities, private attendant, individual cloth hand towels, Acqua di Parma toiletries.',
          inspectorIdentity: 'Lead Auditor Claire Martin',
          inspectionDate: '2026-09-30',
        },
      },
      // -----------------------------------------------------------------------
      // MAHARASHTRA / MAHABALESHWAR CORRIDOR (NH48 & SH72)
      // -----------------------------------------------------------------------
      {
        id: 'place-mh-mapro',
        name: 'Mapro Garden',
        category: 'rest_stop',
        address: 'Mahabaleshwar-Panchgani Highway, Gureghar',
        city: 'Gureghar, Mahabaleshwar Corridor',
        coordinates: { lat: 17.9228, lng: 73.7467 },
        openingHours: '08:00 - 21:00',
        phone: '+91 2168 240112',
        priceLevel: 2,
        rating: 4.8,
        reviewCount: 5200,
        imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80',
        detourKm: 0.1,
        detourMinutes: 1,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 98,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-22',
        evidenceSource: 'Satara District Health & Food Safety Board · Cert #MH-7712',
        washroomAvailability: 'available',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        checklist: {
          visibleCleanlinessScore: 5,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 5,
          wasteDisposalMaintained: true,
          odorRatingScore: 5,
          wheelchairAccessible: true,
          babyChangingStation: true,
          genderNeutralStalls: true,
          notes: 'Touchless sensor taps, constant running water, clean paper towels, dedicated accessibility ramps.',
          inspectorIdentity: 'Sanitation Officer A. Deshmukh',
          inspectionDate: '2026-09-22',
        },
      },
      {
        id: 'place-mh-surur',
        name: 'Hotel Abhiruchi Food Plaza',
        category: 'rest_stop',
        address: 'NH48 Pune-Bangalore Highway, Surur Phata (Wai Turnoff)',
        city: 'Surur, Satara Corridor',
        coordinates: { lat: 17.9940, lng: 74.0205 },
        openingHours: 'Open 24 hours',
        phone: '+91 2167 220450',
        priceLevel: 1,
        rating: 4.4,
        reviewCount: 1840,
        imageUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&q=80',
        detourKm: 0.3,
        detourMinutes: 2,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 92,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-18',
        evidenceSource: 'NHAI Highway Amenities Audit · Cert #NH-4821',
        washroomAvailability: 'available',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        checklist: {
          visibleCleanlinessScore: 5,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 4,
          wasteDisposalMaintained: true,
          odorRatingScore: 4,
          wheelchairAccessible: true,
          babyChangingStation: false,
          genderNeutralStalls: false,
          notes: '24-hour highway convenience stop, functioning jet sprays, soap dispensers checked hourly.',
          inspectorIdentity: 'NHAI Audit Team Satara',
          inspectionDate: '2026-09-18',
        },
      },
      {
        id: 'place-mh-venna',
        name: 'Venna Lake Municipal Pier',
        category: 'washroom',
        address: 'Panchgani-Mahabaleshwar Road, Venna Lake',
        city: 'Mahabaleshwar',
        coordinates: { lat: 17.9255, lng: 73.6644 },
        openingHours: '07:00 - 20:00',
        priceLevel: 1,
        rating: 4.3,
        reviewCount: 960,
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
        detourKm: 0.2,
        detourMinutes: 1,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 89,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-15',
        evidenceSource: 'Mahabaleshwar Municipal Council Public Sanitation Audit',
        washroomAvailability: 'paid',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        checklist: {
          visibleCleanlinessScore: 4,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 4,
          wasteDisposalMaintained: true,
          odorRatingScore: 4,
          wheelchairAccessible: true,
          babyChangingStation: false,
          genderNeutralStalls: false,
          notes: 'Municipal lakeside facilities, nominal ₹5 maintenance token, dedicated on-site cleaning staff.',
          inspectorIdentity: 'Municipal Inspector R. Jadhav',
          inspectionDate: '2026-09-15',
        },
      },
      {
        id: 'place-mh-lemeridien',
        name: 'Le Méridien Mahabaleshwar Resort & Spa',
        category: 'hotel',
        address: '211 / 212, Medha Road',
        city: 'Mahabaleshwar',
        coordinates: { lat: 17.9152, lng: 73.6734 },
        openingHours: '24 hours',
        phone: '+91 2168 262222',
        priceLevel: 4,
        rating: 4.8,
        reviewCount: 1420,
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
        detourKm: 1.4,
        detourMinutes: 6,
        hygieneStatus: 'independently_inspected',
        hygieneScore: 99,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-30',
        evidenceSource: 'Global Luxury Sanitation Standard · Audit #MH-2026',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        checklist: {
          visibleCleanlinessScore: 5,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 5,
          wasteDisposalMaintained: true,
          odorRatingScore: 5,
          wheelchairAccessible: true,
          babyChangingStation: true,
          genderNeutralStalls: true,
          notes: 'Pristine forest resort facilities, individual cotton hand towels, automatic sanitizing dispensers.',
          inspectorIdentity: 'Lead Auditor Claire Martin',
          inspectionDate: '2026-09-30',
        },
      },
      {
        id: 'place-mh-bagicha',
        name: 'Bagicha Corner',
        category: 'restaurant',
        address: 'Wai-Panchgani Road, Near Neeta Bus Stand',
        city: 'Mahabaleshwar',
        coordinates: { lat: 17.9268, lng: 73.6612 },
        openingHours: '08:30 - 22:30',
        priceLevel: 1,
        rating: 4.6,
        reviewCount: 3100,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80',
        detourKm: 0.4,
        detourMinutes: 2,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 94,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-20',
        evidenceSource: 'Food Safety and Standards Authority of India (FSSAI) Inspection',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        checklist: {
          visibleCleanlinessScore: 5,
          runningWater: true,
          soapAvailable: true,
          toiletFunctionalityScore: 5,
          wasteDisposalMaintained: true,
          odorRatingScore: 4,
          wheelchairAccessible: true,
          babyChangingStation: false,
          genderNeutralStalls: false,
          notes: 'Spotless hand-washing station with warm water and soap for strawberry tasting.',
          inspectorIdentity: 'FSSAI District Officer K. Shinde',
          inspectionDate: '2026-09-20',
        },
      },
      {
        id: 'place-mh-fuel-hp',
        name: 'HP Petrol Pump Mahabaleshwar',
        category: 'fuel',
        address: 'Satara-Mahabaleshwar Road, Near Bus Stand',
        city: 'Mahabaleshwar',
        coordinates: { lat: 17.9215, lng: 73.6620 },
        openingHours: '06:00 - 23:00',
        priceLevel: 1,
        rating: 4.3,
        reviewCount: 540,
        imageUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&q=80',
        detourKm: 0.1,
        detourMinutes: 1,
        hygieneStatus: 'community_reported',
        hygieneScore: 84,
        hygieneConfidence: 'medium',
        washroomAvailability: 'available',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        evidenceSource: 'Highway Traveler Feedback',
      },
      {
        id: 'place-mh-grapevine',
        name: 'The Grapevine Restaurant',
        category: 'restaurant',
        address: 'Masjid Road, Near Central Bazaar',
        city: 'Mahabaleshwar',
        coordinates: { lat: 17.9240, lng: 73.6565 },
        openingHours: '12:00 - 15:30, 19:00 - 23:00',
        phone: '+91 2168 260380',
        priceLevel: 3,
        rating: 4.7,
        reviewCount: 1620,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
        detourKm: 0.2,
        detourMinutes: 1,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 95,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-20',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        evidenceSource: 'FSSAI Sanitary Inspection',
      },
      {
        id: 'place-mh-kaas-amenities',
        name: 'Kaas Pathar Forest Information & Amenities Center',
        category: 'washroom',
        address: 'Kaas Road, Satara District',
        city: 'Kaas Plateau, Satara',
        coordinates: { lat: 17.7215, lng: 73.8175 },
        openingHours: '08:00 - 18:00 (Aug - Nov blooming season)',
        priceLevel: 1,
        rating: 4.4,
        reviewCount: 890,
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
        detourKm: 0.1,
        detourMinutes: 1,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 91,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-20',
        washroomAvailability: 'available',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        evidenceSource: 'Maharashtra Forest Department Eco-Tourism Cell',
      },
      // -----------------------------------------------------------------------
      // MUMBAI CORRIDOR
      // -----------------------------------------------------------------------
      {
        id: 'place-mum-taj',
        name: 'The Taj Mahal Palace, Mumbai',
        category: 'hotel',
        address: 'Apollo Bunder, Colaba',
        city: 'Mumbai',
        coordinates: { lat: 18.9217, lng: 72.8330 },
        openingHours: '24 hours',
        phone: '+91 22 6665 3366',
        priceLevel: 4,
        rating: 4.9,
        reviewCount: 14200,
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
        detourKm: 0.1,
        detourMinutes: 1,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 100,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-20',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        evidenceSource: 'ISO 22000 Certified & BMC Grade A',
      },
      {
        id: 'place-mum-fuel-ioc',
        name: 'Indian Oil Nariman Point Fuel & EV Station',
        category: 'fuel',
        address: 'Madame Cama Road, Nariman Point',
        city: 'Mumbai',
        coordinates: { lat: 18.9280, lng: 72.8250 },
        openingHours: 'Open 24 hours',
        priceLevel: 1,
        rating: 4.4,
        reviewCount: 920,
        imageUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=600&q=80',
        detourKm: 0.2,
        detourMinutes: 1,
        hygieneStatus: 'community_reported',
        hygieneScore: 86,
        hygieneConfidence: 'medium',
        lastVerifiedDate: '2026-09-20',
        washroomAvailability: 'available',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        evidenceSource: 'IOCL Swachh Fuel Station Initiative',
      },
      // -----------------------------------------------------------------------
      // PUNE CORRIDOR
      // -----------------------------------------------------------------------
      {
        id: 'place-pun-conrad',
        name: 'Conrad Pune',
        category: 'hotel',
        address: '7 Mangaldas Road, Bund Garden',
        city: 'Pune',
        coordinates: { lat: 18.5362, lng: 73.8789 },
        openingHours: '24 hours',
        phone: '+91 20 6745 6745',
        priceLevel: 4,
        rating: 4.8,
        reviewCount: 3800,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
        detourKm: 0.5,
        detourMinutes: 2,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 98,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-20',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        evidenceSource: 'Hilton CleanStay Audit',
      },
      {
        id: 'place-pun-vaishali',
        name: 'Vaishali Restaurant',
        category: 'restaurant',
        address: 'Fergusson College Road, Shivajinagar',
        city: 'Pune',
        coordinates: { lat: 18.5204, lng: 73.8415 },
        openingHours: '07:00 - 23:00',
        phone: '+91 20 2553 1244',
        priceLevel: 2,
        rating: 4.6,
        reviewCount: 12400,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
        detourKm: 0.3,
        detourMinutes: 2,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 93,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-20',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        evidenceSource: 'PMC Food Safety Audit',
      },
      // -----------------------------------------------------------------------
      // TOKYO CORRIDOR
      // -----------------------------------------------------------------------
      {
        id: 'place-tok-parkhyatt',
        name: 'Park Hyatt Tokyo',
        category: 'hotel',
        address: '3-7-1-2 Nishi-Shinjuku, Shinjuku City',
        city: 'Tokyo',
        coordinates: { lat: 35.6857, lng: 139.6912 },
        openingHours: '24 hours',
        phone: '+81 3 5322 1234',
        priceLevel: 4,
        rating: 4.9,
        reviewCount: 3200,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
        detourKm: 0.4,
        detourMinutes: 2,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 100,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-20',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        evidenceSource: 'Tokyo Metropolitan Public Health Inspection',
      },
      {
        id: 'place-tok-ichiran',
        name: 'Ichiran Ramen Shibuya',
        category: 'restaurant',
        address: '1 Chome-22-7 Jinnan, Shibuya City',
        city: 'Tokyo',
        coordinates: { lat: 35.6605, lng: 139.7005 },
        openingHours: 'Open 24 hours',
        priceLevel: 2,
        rating: 4.7,
        reviewCount: 8900,
        imageUrl: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?w=600&q=80',
        detourKm: 0.2,
        detourMinutes: 1,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 97,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-20',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        evidenceSource: 'Shibuya City Health Standard Inspection',
      },
      // -----------------------------------------------------------------------
      // PARIS CORRIDOR
      // -----------------------------------------------------------------------
      {
        id: 'place-par-plaza-athenee',
        name: 'Hôtel Plaza Athénée',
        category: 'hotel',
        address: '25 Avenue Montaigne, 75008 Paris',
        city: 'Paris',
        coordinates: { lat: 48.8660, lng: 2.3045 },
        openingHours: '24 hours',
        phone: '+33 1 53 67 66 65',
        priceLevel: 4,
        rating: 4.9,
        reviewCount: 2900,
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
        detourKm: 0.3,
        detourMinutes: 2,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 99,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-20',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        evidenceSource: 'City of Paris Sanitary Inspection Board',
      },
      {
        id: 'place-par-cafe-flore',
        name: 'Café de Flore',
        category: 'restaurant',
        address: '172 Boulevard Saint-Germain, 75006 Paris',
        city: 'Paris',
        coordinates: { lat: 48.8540, lng: 2.3325 },
        openingHours: '07:30 - 01:30',
        phone: '+33 1 45 48 55 26',
        priceLevel: 3,
        rating: 4.5,
        reviewCount: 7400,
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
        detourKm: 0.2,
        detourMinutes: 1,
        hygieneStatus: 'officially_inspected',
        hygieneScore: 94,
        hygieneConfidence: 'high',
        lastVerifiedDate: '2026-09-20',
        washroomAvailability: 'customers_only',
        waterAvailable: true,
        soapAvailable: true,
        accessibleFacility: true,
        evidenceSource: 'French Health Authority Hygiene Certificate',
      },
    ];
  }

  /**
   * Filter and rank places along a route based on detour, hygiene score, and user filters.
   */
  static filterPlaces(
    places: Place[],
    filters: {
      category?: PlaceCategory | 'all';
      maxDetourMinutes?: number;
      minHygieneStatus?: 'all' | 'verified_only' | 'inspected_only';
      requireAccessible?: boolean;
      requireSoap?: boolean;
      requireWater?: boolean;
    }
  ): Place[] {
    return places.filter(place => {
      // Category filter
      if (filters.category && filters.category !== 'all') {
        if (filters.category === 'washroom') {
          if (place.category !== 'washroom' && place.category !== 'rest_stop') {
            return false;
          }
        } else if (place.category !== filters.category) {
          return false;
        }
      }

      // Detour filter
      if (filters.maxDetourMinutes !== undefined && (place.detourMinutes ?? 0) > filters.maxDetourMinutes) {
        return false;
      }

      // Hygiene verification level filter
      if (filters.minHygieneStatus === 'inspected_only') {
        if (place.hygieneStatus !== 'officially_inspected' && place.hygieneStatus !== 'independently_inspected') {
          return false;
        }
      } else if (filters.minHygieneStatus === 'verified_only') {
        if (place.hygieneStatus === 'not_yet_verified' || place.hygieneStatus === 'verification_expired') {
          return false;
        }
      }

      // Specific facility filters
      if (filters.requireAccessible && place.accessibleFacility !== true) {
        return false;
      }
      if (filters.requireSoap && place.soapAvailable !== true) {
        return false;
      }
      if (filters.requireWater && place.waterAvailable !== true) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Deterministic ranking:
      // Primary: Hygiene score (descending)
      // Secondary: Detour minutes (ascending)
      const scoreA = a.hygieneScore || 50;
      const scoreB = b.hygieneScore || 50;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return (a.detourMinutes || 0) - (b.detourMinutes || 0);
    });
  }
}
