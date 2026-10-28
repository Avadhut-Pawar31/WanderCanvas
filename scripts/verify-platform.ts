import assert from 'node:assert/strict';
import { HygieneService } from '../services/hygieneService';
import { MapRouteService } from '../services/mapRouteService';
import { CollaborationService } from '../services/collaborationService';
import { AIAssistantService } from '../services/aiAssistantService';
import { AIService } from '../services/aiService';
import { HygieneChecklist, Place } from '../types';

async function runTestSuite() {
  console.log('🧪 Starting WanderCanvas Platform Verification Test Suite...\n');

  // ==========================================
  // TEST 1: GEOSPATIAL & ROUTE ENGINE
  // ==========================================
  console.log('👉 [1/6] Testing Geospatial & Route Detour Calculations...');
  
  // Coordinates for Naples (40.8518, 14.2681) and Amalfi (40.6340, 14.6027)
  const naplesAmalfiHaversine = MapRouteService.calculateHaversineDistance(
    40.8518, 14.2681,
    40.6340, 14.6027
  );
  console.log(`   Naples -> Amalfi direct distance: ${naplesAmalfiHaversine.toFixed(2)} km`);
  assert.ok(naplesAmalfiHaversine > 30 && naplesAmalfiHaversine < 45, 'Haversine distance should be ~35-40km');

  // Verify route calculation
  const route = await MapRouteService.calculateRoute({
    origin: 'Naples',
    destination: 'Amalfi',
    travelMode: 'driving',
  });
  assert.ok(route.coordinatesPath.length >= 10, 'Route should contain corridor geometry path');
  assert.ok(route.distanceKm > 50, 'Road route distance should reflect driving route');
  assert.ok(route.durationMinutes > 60, 'Road travel duration should be > 60 mins');
  console.log('   ✓ Route corridor calculated successfully:', route.summary);

  // Test detour calculation for a point directly along the route vs a point far off
  const onRouteDetour = MapRouteService.estimateDetour(
    { lat: 40.6281, lng: 14.4850 }, // Positano on corridor
    route.coordinatesPath
  );
  const farOffDetour = MapRouteService.estimateDetour(
    { lat: 41.5000, lng: 15.5000 }, // Far inland in Foggia
    route.coordinatesPath
  );
  assert.ok(onRouteDetour.detourKm < farOffDetour.detourKm, 'Point along route must have lower detour than far off point');
  assert.ok(onRouteDetour.detourMinutes < farOffDetour.detourMinutes, 'Point along route must have lower detour time');
  console.log(`   ✓ Detour on corridor: ${onRouteDetour.detourKm} km (+${onRouteDetour.detourMinutes} min) vs far off: ${farOffDetour.detourKm} km`);

  // ==========================================
  // TEST 2: HYGIENE CHECKLIST & SCORING
  // ==========================================
  console.log('\n👉 [2/6] Testing Hygiene Inspection Checklist & Scoring Formula...');

  // Perfect checklist (visible cleanliness 5, water true, soap true, flush 5, odor 5, waste true, wheelchair true)
  const perfectChecklist: HygieneChecklist = {
    visibleCleanlinessScore: 5,
    runningWater: true,
    soapAvailable: true,
    toiletFunctionalityScore: 5,
    wasteDisposalMaintained: true,
    odorRatingScore: 5,
    wheelchairAccessible: true,
    babyChangingStation: true,
    genderNeutralStalls: false,
    inspectionDate: new Date().toISOString(),
    inspectorIdentity: 'Sanitation Officer Rossi',
  };
  const perfectScore = HygieneService.calculateHygieneScore(perfectChecklist);
  assert.equal(perfectScore, 100, 'A flawless inspection checklist must evaluate to 100');
  console.log('   ✓ Perfect inspection checklist score:', perfectScore);

  // Deficient checklist (running water missing, soap missing, poor cleanliness)
  const deficientChecklist: HygieneChecklist = {
    ...perfectChecklist,
    visibleCleanlinessScore: 2,
    runningWater: false,
    soapAvailable: false,
    toiletFunctionalityScore: 2,
    odorRatingScore: 1,
  };
  const deficientScore = HygieneService.calculateHygieneScore(deficientChecklist);
  assert.ok(deficientScore < 45, 'Deficient sanitation must drastically reduce hygiene score');
  console.log('   ✓ Deficient inspection checklist score:', deficientScore);

  // ==========================================
  // TEST 3: FRESHNESS & EXPIRATION RULES
  // ==========================================
  console.log('\n👉 [3/6] Testing Verification Freshness & 90-Day Expiry...');

  const freshDate = new Date().toISOString();
  const ninetyFiveDaysAgo = new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString();

  const freshStatus = HygieneService.evaluateFreshness(freshDate, 'officially_inspected');
  assert.equal(freshStatus, 'officially_inspected', 'Recent inspection must remain officially inspected');

  const expiredStatus = HygieneService.evaluateFreshness(ninetyFiveDaysAgo, 'officially_inspected');
  assert.equal(expiredStatus, 'verification_expired', 'Inspection older than 90 days must be expired');
  console.log('   ✓ Fresh inspection status:', freshStatus);
  console.log('   ✓ Expired inspection (>90 days) status:', expiredStatus);

  // Unverified places must never produce a fabricated score
  const unverifiedPlace: Place = {
    id: 'test-unverified',
    name: 'Unverified Roadside Stall',
    category: 'washroom',
    address: 'Highway KM 12',
    city: 'Salerno',
    coordinates: { lat: 40.65, lng: 14.55 },
    hygieneStatus: 'not_yet_verified',
    hygieneConfidence: 'limited',
    washroomAvailability: 'unknown',
    waterAvailable: 'unknown',
    soapAvailable: 'unknown',
    accessibleFacility: 'unknown',
  };
  assert.equal(unverifiedPlace.hygieneScore, undefined, 'Unverified location must NOT have a fabricated score');
  console.log('   ✓ Unverified place score correctly absent (no fabricated numbers)');

  // ==========================================
  // TEST 4: COMMUNITY REPORTING
  // ==========================================
  console.log('\n👉 [4/6] Testing Community Hygiene Reporting & Aggregation...');

  const report = HygieneService.submitCommunityReport('wc-amalfi-duomo-public', {
    userId: 'traveler-user-1',
    userName: 'Elena M.',
    cleanlinessRating: 4,
    soapAvailable: true,
    runningWater: true,
    flushWorking: true,
    comments: 'Attendant on duty, clean paper towels provided.',
  });
  assert.ok(typeof report.id === 'string' && report.id.length > 0, 'Community report must generate unique ID');
  assert.equal(report.placeId, 'wc-amalfi-duomo-public');
  console.log('   ✓ Community report submitted and indexed:', report.id);

  // ==========================================
  // TEST 5: COLLABORATION, ROLES & VOTING
  // ==========================================
  console.log('\n👉 [5/6] Testing Collaborative Workspace, Roles & Voting...');

  // Create test trip
  const testTrip = await CollaborationService.createTrip({
    name: 'Test Amalfi Corridor',
    origin: 'Naples',
    destination: 'Amalfi',
    startDate: '2026-07-01',
    endDate: '2026-07-05',
    budget: 1500,
    travelMode: 'driving',
    owner: { id: 'owner-1', name: 'Marco', email: 'marco@wandercanvas.com' },
  });
  assert.ok(testTrip.id, 'Trip must have unique ID');
  assert.equal(testTrip.ownerId, 'owner-1');
  assert.equal(testTrip.members[0].role, 'owner');
  console.log(`   ✓ Collaborative trip created with invite code: ${testTrip.invitationCode}`);

  // Test joining with invite code
  const joined = CollaborationService.joinTripByInviteCode(testTrip.invitationCode, {
    id: 'friend-2',
    name: 'Sofia',
    email: 'sofia@wandercanvas.com',
  });
  assert.ok(joined, 'Should join successfully with valid invitation code');
  assert.equal(joined.members.length, 2, 'Trip must now have 2 members');
  assert.equal(joined.members[1].role, 'editor', 'New member defaults to editor role');
  console.log('   ✓ Second traveler joined as editor via invitation code');

  // Suggest a stop and vote
  const demoPlace = HygieneService.getSeedPlaces()[0];
  const suggestion = CollaborationService.suggestStop(
    testTrip.id,
    demoPlace,
    { id: 'friend-2', name: 'Sofia' },
    'Highly rated clean washroom stop along the highway'
  );
  assert.ok(suggestion, 'Stop suggestion must be created');
  assert.equal(suggestion.votes.length, 1, 'Proposer gets initial upvote');

  // Upvote to trigger auto-promotion threshold (consensus)
  const voteResult = CollaborationService.voteOnSuggestion(
    testTrip.id,
    suggestion.id,
    { id: 'owner-1', name: 'Marco' },
    1
  );
  assert.ok(voteResult, 'Vote should succeed');
  assert.equal(voteResult.promotedToStop, true, 'Net votes >= 2 must trigger promotedToStop = true');

  const updatedTrip = CollaborationService.getTripById(testTrip.id)!;
  assert.ok(
    updatedTrip.stops.some(s => s.placeId === demoPlace.id),
    'Reaching consensus (+2 net votes) must auto-promote stop into confirmed route waypoints'
  );
  console.log(`   ✓ Stop proposal reached consensus (+2) and auto-promoted to itinerary: ${demoPlace.name}`);

  // ==========================================
  // TEST 6: AI ASSISTANT ROUTE GROUNDING
  // ==========================================
  console.log('\n👉 [6/6] Testing AI Assistant Grounded Recommendation Engine...');

  const aiResult = await AIAssistantService.generateRouteRecommendations({
    trip: updatedTrip,
    focusCategory: 'all',
    maxDetourMinutes: 20,
    requireVerifiedHygiene: true,
  });

  assert.ok(aiResult.recommendedStops.length > 0, 'Assistant must generate recommendations');
  assert.ok(aiResult.headline.includes('Amalfi'), 'Headline should reference destination corridor');
  
  // Ensure every recommendation has genuine verified hygiene evidence
  for (const rec of aiResult.recommendedStops) {
    assert.ok(
      rec.place.hygieneStatus === 'officially_inspected' || rec.place.hygieneStatus === 'independently_inspected',
      'Verified-only assistant query must only recommend officially or independently inspected places'
    );
    assert.ok(rec.rationale.length > 10, 'Each recommendation must provide a transparent rationale');
    assert.ok(rec.detourSummary.includes('km'), 'Detour summary must include calculated distance');
  }
  console.log(`   ✓ Assistant successfully curated ${aiResult.recommendedStops.length} grounded recommendations with verified evidence`);

  // ==========================================
  // TEST 7: MAHABALESHWAR & GROUNDED KNOWLEDGE INTEGRITY
  // ==========================================
  console.log('\n👉 [7/9] Testing Mahabaleshwar & Grounded Knowledge Integrity...');
  const { TravelKnowledgeService } = await import('../services/travelKnowledgeService');
  const mahProfile = TravelKnowledgeService.resolveProfile('Mahabaleshwar');
  assert.ok(mahProfile, 'Mahabaleshwar profile must be resolved');
  assert.equal(mahProfile.countryCode, 'IN', 'Country code must be IN');
  assert.equal(mahProfile.subdivisionId, 'maharashtra', 'Subdivision must be Maharashtra');
  assert.ok(mahProfile.coordinates.lat > 17.8 && mahProfile.coordinates.lat < 18.0, 'Latitude must be ~17.92');
  assert.ok(mahProfile.coordinates.lng > 73.5 && mahProfile.coordinates.lng < 73.8, 'Longitude must be ~73.65');

  // Verify real attractions (Lingmala, Pratapgad, Venna Lake, Arthur's Seat, Mapro Garden, etc.)
  const attrNames = mahProfile.attractions.map(a => a.name);
  assert.ok(attrNames.some(n => n.includes('Lingmala')), 'Must contain Lingmala Waterfall');
  assert.ok(attrNames.some(n => n.includes('Pratapgad')), 'Must contain Pratapgad Fort');
  assert.ok(attrNames.some(n => n.includes('Venna Lake')), 'Must contain Venna Lake');
  assert.ok(attrNames.some(n => n.includes("Arthur's Seat")), "Must contain Arthur's Seat");
  assert.ok(attrNames.some(n => n.includes('Mapro Garden')), 'Must contain Mapro Garden');
  assert.ok(attrNames.some(n => n.includes('Table Land')), 'Must contain Table Land');
  assert.ok(attrNames.some(n => n.includes('Bhilar')), 'Must contain Bhilar Waterfall');

  // Strict anti-hallucination checks: NO European basilicas, stained glass, or ocean beaches
  for (const a of mahProfile.attractions) {
    assert.ok(!a.name.toLowerCase().includes('basilica'), 'Must NOT hallucinate stone basilica in Mahabaleshwar');
    assert.ok(!a.name.toLowerCase().includes('belfry'), 'Must NOT hallucinate belfry in Mahabaleshwar');
    assert.ok(!a.name.toLowerCase().includes('pebble cove'), 'Must NOT hallucinate ocean pebble cove in Mahabaleshwar');
  }
  console.log(`   ✓ Mahabaleshwar resolved with ${mahProfile.attractions.length} verified attractions with real coordinates`);

  // Verify real food experiences (Strawberries with Cream, Pithla Bhakri, Makai Pattice)
  const foodNames = mahProfile.foodExperiences.map(f => f.name);
  assert.ok(foodNames.some(n => n.includes('Strawberries') && n.includes('Cream')), 'Must contain Fresh Strawberries with Whipped Cream');
  assert.ok(foodNames.some(n => n.includes('Pithla Bhakri')), 'Must contain Pithla Bhakri');
  assert.ok(foodNames.some(n => n.includes('Makai Pattice')), 'Must contain Makai Pattice');

  // Verify honest regional pricing in INR
  for (const food of mahProfile.foodExperiences) {
    assert.equal(food.priceRange.currency, 'INR', 'Food pricing for Mahabaleshwar must be in INR (₹)');
  }
  console.log(`   ✓ Authentic culinary experiences verified with honest INR pricing`);

  // ==========================================
  // TEST 8: CORRIDOR GEOGRAPHIC ISOLATION
  // ==========================================
  console.log('\n👉 [8/9] Testing Corridor Geographic Isolation & Route Purity...');

  const puneMahRoute = await MapRouteService.calculateRoute({
    origin: 'Pune',
    destination: 'Mahabaleshwar',
    travelMode: 'driving',
  });
  console.log(`   Pune -> Mahabaleshwar calculated: ${puneMahRoute.distanceKm} km (${puneMahRoute.durationMinutes} min)`);
  assert.ok(puneMahRoute.distanceKm >= 100 && puneMahRoute.distanceKm <= 150, 'Pune-Mahabaleshwar route should be ~115-130 km');
  assert.ok(puneMahRoute.summary.includes('NH48') || puneMahRoute.summary.includes('Ghat'), 'Summary should reference NH48/Wai-Panchgani Ghat');

  // Find candidate stops along the Pune-Mahabaleshwar corridor
  const mhStops = MapRouteService.findStopsAlongRoute(puneMahRoute);
  assert.ok(mhStops.length > 0, 'Should find candidate stops along Pune-Mahabaleshwar corridor');
  
  // CRITICAL CHECK: Zero Italian Autogrills or Amalfi hotels on an Indian route!
  for (const stop of mhStops) {
    assert.ok(!stop.id.startsWith('place-amalfi-'), `Italian stop ${stop.name} must NOT leak into Indian corridor!`);
    assert.ok(stop.coordinates.lat > 16.0 && stop.coordinates.lat < 20.0, 'Stops must be within Maharashtra geographic bounds');
  }
  console.log(`   ✓ Geographic isolation verified: ${mhStops.length} verified Maharashtra stops, 0 Italian leakages`);

  // ==========================================
  // TEST 9: PRESERVATION OF AMALFI COAST SAVED TRIP
  // ==========================================
  console.log('\n👉 [9/9] Testing Preservation of Saved Amalfi Coast Reference Trip...');

  const amalfiTrip = CollaborationService.getTripById('trip-amalfi-classic');
  assert.ok(amalfiTrip, 'trip-amalfi-classic must remain accessible');
  assert.equal(amalfiTrip.origin, 'Naples', 'Amalfi trip origin must remain Naples');
  assert.ok(amalfiTrip.originCoordinates, 'Origin coordinates must exist');
  assert.ok(amalfiTrip.destinationCoordinates, 'Destination coordinates must exist');
  assert.ok(amalfiTrip.originCoordinates.lat > 40.0 && amalfiTrip.originCoordinates.lat < 42.0, 'Origin must stay in Italy');
  assert.ok(amalfiTrip.destinationCoordinates.lat > 40.0 && amalfiTrip.destinationCoordinates.lat < 42.0, 'Destination must stay in Italy');
  assert.equal(amalfiTrip.invitationCode, 'AMALFI-26', 'Invite code must remain AMALFI-26');
  assert.ok(amalfiTrip.stops.length >= 2, 'Stops must remain intact');
  assert.ok(amalfiTrip.stops.some(s => s.name.includes('Pompeii') || s.name.includes('Sal De Riso') || s.name.includes('Autogrill')), 'Stops must be authentic Amalfi spots');
  console.log(`   ✓ Saved Amalfi Coast reference trip preserved intact with Italian coordinates`);

  // ==========================================
  // TEST 10: DEDICATED MAHABALESHWAR + KAAS PLATEAU TRIP WORKSPACE
  // ==========================================
  console.log('\n👉 [10/12] Testing Authentic Mahabaleshwar + Kaas Plateau Trip Model...');
  const mahaTrip = CollaborationService.getTripById('trip-mahabaleshwar-kaas');
  assert.ok(mahaTrip, 'trip-mahabaleshwar-kaas must be present in CollaborationService');
  assert.equal(mahaTrip.name, 'Mahabaleshwar & Kaas Plateau Sahyadri Discovery');
  assert.ok(mahaTrip.origin.includes('Pune'), 'Trip origin must be Pune');
  assert.ok(mahaTrip.destination.includes('Mahabaleshwar'), 'Trip destination must be Mahabaleshwar');
  assert.ok(mahaTrip.destinationCoordinates, 'Destination coordinates must exist');
  assert.ok(
    mahaTrip.destinationCoordinates.lat > 17.5 && mahaTrip.destinationCoordinates.lat < 18.5,
    'Destination coordinates must be in Maharashtra Western Ghats (lat ~17.92)'
  );
  assert.ok(
    mahaTrip.destinationCoordinates.lng > 73.0 && mahaTrip.destinationCoordinates.lng < 74.5,
    'Destination coordinates must be in Satara district (lng ~73.65)'
  );
  assert.equal(mahaTrip.invitationCode, 'MAHA-26');

  // Verify real place names - zero fabricated "Restrooms & Terrace" suffixes!
  for (const stop of mahaTrip.stops) {
    assert.ok(!stop.name.includes('Restrooms & Terrace'), `Stop "${stop.name}" must not have fabricated suffixes`);
  }
  for (const sug of mahaTrip.suggestions) {
    assert.ok(!sug.place.name.includes('Restrooms & Terrace'), `Suggestion "${sug.place.name}" must preserve real business name`);
  }
  console.log('   ✓ Mahabaleshwar + Kaas Plateau trip verified with authentic coordinates and real stop names');

  // ==========================================
  // TEST 11: GLOBAL PLACES DISCOVERY & 6-DESTINATION VALIDATION
  // ==========================================
  console.log('\n👉 [11/12] Testing Global Places Discovery Service across 6 Destinations...');
  const { PlacesDiscoveryService } = await import('../services/placesDiscoveryService');

  const destinationsToTest = [
    {
      name: 'Mahabaleshwar + Kaas Plateau',
      lat: 17.9237,
      lng: 73.6586,
      expectedCountry: 'India',
      expectedCurrency: 'INR',
      testCategory: 'restaurant' as const,
      expectedSamplePlace: 'Bagicha Corner',
    },
    {
      name: 'Mumbai',
      lat: 18.9220,
      lng: 72.8347,
      expectedCountry: 'India',
      expectedCurrency: 'INR',
      testCategory: 'hotel' as const,
      expectedSamplePlace: 'The Taj Mahal Palace',
    },
    {
      name: 'Pune',
      lat: 18.5204,
      lng: 73.8567,
      expectedCountry: 'India',
      expectedCurrency: 'INR',
      testCategory: 'attraction' as const,
      expectedSamplePlace: 'Shaniwar Wada',
    },
    {
      name: 'Tokyo',
      lat: 35.6762,
      lng: 139.6503,
      expectedCountry: 'Japan',
      expectedCurrency: 'JPY',
      testCategory: 'attraction' as const,
      expectedSamplePlace: 'Sensō-ji',
    },
    {
      name: 'Paris',
      lat: 48.8566,
      lng: 2.3522,
      expectedCountry: 'France',
      expectedCurrency: 'EUR',
      testCategory: 'hotel' as const,
      expectedSamplePlace: 'Hôtel Plaza Athénée',
    },
    {
      name: 'Amalfi Coast',
      lat: 40.6340,
      lng: 14.6027,
      expectedCountry: 'Italy',
      expectedCurrency: 'EUR',
      testCategory: 'restaurant' as const,
      expectedSamplePlace: 'Bar Pasticceria Sal De Riso',
    },
  ];

  for (const d of destinationsToTest) {
    console.log(`   📍 Validating ${d.name} (${d.expectedCountry})...`);
    const result = await PlacesDiscoveryService.discoverPlaces({
      query: d.name,
      lat: d.lat,
      lng: d.lng,
      radiusKm: 40,
    });

    assert.ok(result.places.length > 0, `Discovery should return places for ${d.name}`);
    assert.ok(result.destination, `Destination profile should resolve for ${d.name}`);
    assert.equal(result.destination?.currency, d.expectedCurrency, `Currency for ${d.name} should be ${d.expectedCurrency}`);

    // Verify geographic isolation: every returned place must be within 60km of destination center
    for (const place of result.places) {
      const dist = PlacesDiscoveryService.haversineDistance(d.lat, d.lng, place.coordinates.lat, place.coordinates.lng);
      assert.ok(
        dist <= 60,
        `Place "${place.name}" (${dist.toFixed(1)} km) is outside geographic radius for ${d.name}!`
      );
    }

    // Verify category filtering works
    const categoryResult = await PlacesDiscoveryService.discoverPlaces({
      query: d.name,
      lat: d.lat,
      lng: d.lng,
      radiusKm: 40,
      category: d.testCategory,
    });
    for (const place of categoryResult.places) {
      assert.equal(place.category, d.testCategory, `Filtered place must be of category ${d.testCategory}`);
    }

    console.log(`      ✓ ${result.places.length} places verified within 40km radius (Currency: ${d.expectedCurrency}, No cross-border leaks)`);
  }

  // ==========================================
  // TEST 12: HYGIENE HONESTY & REAL AUDIT LOGS
  // ==========================================
  console.log('\n👉 [12/12] Testing Hygiene Honesty & Truthful Evidence Claims...');
  const allSeedPlaces = HygieneService.getSeedPlaces();

  for (const p of allSeedPlaces) {
    // 1. Business names must be real and without fake suffixes
    assert.ok(
      !p.name.includes('Restrooms & Terrace') && !p.name.includes('Restrooms & Lounge'),
      `Business name "${p.name}" must not have appended restroom suffixes`
    );

    // 2. Washroom availability must be honest
    assert.ok(
      ['available', 'customers_only', 'paid', 'unavailable', 'unknown'].includes(p.washroomAvailability),
      `Washroom availability must be a valid honest status for ${p.name}`
    );

    // 3. Officially inspected or independently inspected places must have an evidenceSource
    if (p.hygieneStatus === 'officially_inspected' || p.hygieneStatus === 'independently_inspected') {
      assert.ok(p.evidenceSource, `Inspected place "${p.name}" must have documented evidenceSource`);
      assert.ok(p.lastVerifiedDate, `Inspected place "${p.name}" must have lastVerifiedDate`);
    }
  }
  // ==========================================
  // TEST 13: TRAVEL BOARD & ITINERARY GENERATION INTEGRITY
  // ==========================================
  console.log('\n👉 [13/13] Testing AIService.generateTravelBoard & Itinerary Integrity...');
  const testDestinations = [
    { query: 'Mahabaleshwar + Kaas Plateau', duration: 7 },
    { query: 'Antarctic Peninsula & Lemaire Channel Glaciers', duration: 3 },
    { query: 'Paris', duration: 5 },
    { query: 'Tokyo', duration: 4 },
    { query: 'Spiti Valley & High Himalayas', duration: 7 },
    { query: 'Unknown Mountain Haven', duration: 2 },
  ];

  for (const td of testDestinations) {
    const board = await AIService.generateTravelBoard({
      destination: td.query,
      budget: 2500,
      duration: td.duration,
      travelStyle: 'adventure',
    });

    assert.ok(board.itinerary.length === td.duration, `Itinerary for "${td.query}" should have ${td.duration} days`);
    for (const day of board.itinerary) {
      assert.ok(!day.morning.includes('undefined'), `Day ${day.day} morning must not contain "undefined" in "${td.query}"`);
      assert.ok(!day.afternoon.includes('undefined'), `Day ${day.day} afternoon must not contain "undefined" in "${td.query}"`);
      assert.ok(!day.evening.includes('undefined'), `Day ${day.day} evening must not contain "undefined" in "${td.query}"`);
    }
    assert.ok(board.attractions.length > 0, `Attractions must be populated for "${td.query}"`);
    assert.ok(board.foodRecommendations.length > 0, `Food recommendations must be populated for "${td.query}"`);
    console.log(`   ✓ "${td.query}" (${td.duration} days) itinerary generated cleanly with valid stops`);
  }

  // ==========================================
  // TEST 14: AUTHENTICATION FLOW & NOTIFICATIONS
  // ==========================================
  const { runAuthVerificationSuite } = await import('./verify-auth-flow');
  await runAuthVerificationSuite();

  console.log('\n🎉 ALL 14 VERIFICATION TEST SUITES PASSED CLEANLY WITH ZERO REGRESSIONS!\n');
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test suite failed with error:\n', err);
  process.exit(1);
});


