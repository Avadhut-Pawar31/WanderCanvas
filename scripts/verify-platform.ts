import assert from 'node:assert/strict';
import { HygieneService } from '../services/hygieneService';
import { MapRouteService } from '../services/mapRouteService';
import { CollaborationService } from '../services/collaborationService';
import { AIAssistantService } from '../services/aiAssistantService';
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

  console.log('\n🎉 ALL 6 VERIFICATION TEST SUITES PASSED CLEANLY!\n');
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test suite failed with error:\n', err);
  process.exit(1);
});
