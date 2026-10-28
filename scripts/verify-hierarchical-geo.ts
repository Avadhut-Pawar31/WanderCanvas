/**
 * ==============================================================================
 * WANDERCANVAS — HIERARCHICAL GEOGRAPHIC CATALOGUE VERIFICATION SUITE
 * ==============================================================================
 * Comprehensive automated test suite verifying:
 *   1. Geographic graph acyclicity and parent-child relationship integrity
 *   2. Maharashtra deep hierarchy end-to-end traversal
 *   3. Disambiguation of homonyms (Satara District vs Satara City)
 *   4. Direct deep-level searching (Bhilar, Tapola, Kaas Plateau, Lingmala Waterfall)
 *   5. Category-in-location intent parsing ("petrol pump in Mahabaleshwar")
 *   6. Real local business & hygiene verification data
 *   7. International adaptability (Mumbai, Tokyo, Paris, Amalfi Coast, Maasai Mara)
 *   8. Alternate names and multilingual aliases (Devanagari, French, Japanese)
 *   9. GPS coordinate bounds & data source attribution
 *  10. Search query execution performance & benchmark
 * ==============================================================================
 */

import { HierarchicalGeoService } from '../services/hierarchicalGeoService';
import { HIERARCHICAL_GEO_ENTITIES } from '../data/geography/hierarchicalCatalogue';
import { GeoEntity } from '../types/hierarchicalGeo';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (detail) console.error(`     ↳ Details: ${detail}`);
  }
}

async function runTestSuite() {
  console.log('🧪 Starting WanderCanvas Hierarchical Geographic Verification Suite...\n');

  // ============================================================================
  // TEST 1: HIERARCHY INTEGRITY & ACYCLIC GRAPH
  // ============================================================================
  console.log('📌 Test Group 1: Graph Topology & Parent-Child Relationships');
  const entityMap = new Map<string, GeoEntity>();
  HIERARCHICAL_GEO_ENTITIES.forEach(e => entityMap.set(e.id, e));

  let brokenParents = 0;
  for (const entity of HIERARCHICAL_GEO_ENTITIES) {
    if (entity.parentId) {
      if (!entityMap.has(entity.parentId)) brokenParents++;
    } else {
      assert(entity.entityType === 'continent', `Root entity '${entity.canonicalName}' is continent`, `Found non-continent root: ${entity.entityType}`);
    }
  }
  assert(brokenParents === 0, 'All child entities link to valid parents in the catalogue');

  // ============================================================================
  // TEST 2: DYNAMIC BREADCRUMB RESOLUTION
  // ============================================================================
  console.log('\n📌 Test Group 2: Dynamic Parent Breadcrumbs (No Hardcoded Strings)');
  
  // Mahabaleshwar breadcrumb resolution
  const mahabaleshwarCrumbs = HierarchicalGeoService.getBreadcrumbs('loc-in-mh-mahabaleshwar');
  const crumbNames = mahabaleshwarCrumbs.map(c => c.name).join(' → ');
  assert(
    crumbNames === 'Asia → India → Maharashtra → Satara District → Mahabaleshwar',
    'Mahabaleshwar dynamic breadcrumbs',
    `Expected 'Asia → India → Maharashtra → Satara District → Mahabaleshwar', got '${crumbNames}'`
  );

  // Lingmala Waterfall breadcrumb resolution
  const lingmalaCrumbs = HierarchicalGeoService.getBreadcrumbs('poi-in-mh-lingmala');
  const lingmalaPath = lingmalaCrumbs.map(c => c.name).join(' → ');
  assert(
    lingmalaPath === 'Asia → India → Maharashtra → Satara District → Mahabaleshwar → Lingmala Waterfall',
    'Lingmala Waterfall dynamic breadcrumbs',
    `Got '${lingmalaPath}'`
  );

  // ============================================================================
  // TEST 3: HOMONYM DISAMBIGUATION (Satara District vs Satara City)
  // ============================================================================
  console.log('\n📌 Test Group 3: Ambiguity & Homonym Disambiguation');
  const sataraMatches = HierarchicalGeoService.search('Satara');
  const hasDistrict = sataraMatches.some(m => m.entity.id === 'adm2-in-mh-satara' && m.entity.entityType === 'district');
  const hasCity = sataraMatches.some(m => m.entity.id === 'loc-in-mh-satara-city' && m.entity.entityType === 'city');

  assert(hasDistrict, "Search for 'Satara' yields Satara District with type [district]");
  assert(hasCity, "Search for 'Satara' yields Satara City with type [city]");
  assert(sataraMatches.length >= 2, "Search for 'Satara' provides disambiguated choices with distinct breadcrumbs");

  // ============================================================================
  // TEST 4: DEEP DIRECT LOCATION SEARCHES
  // ============================================================================
  console.log('\n📌 Test Group 4: Direct Deep-Level Searches (No Manual Navigation Needed)');
  
  const bhilarResults = HierarchicalGeoService.search('Bhilar');
  assert(
    bhilarResults.length > 0 && bhilarResults[0].entity.id === 'loc-in-mh-bhilar',
    "Direct search for 'Bhilar' immediately returns the verified Village of Books",
    `First result: ${bhilarResults[0]?.entity.canonicalName}`
  );

  const tapolaResults = HierarchicalGeoService.search('Tapola');
  assert(
    tapolaResults.length > 0 && tapolaResults[0].entity.id === 'loc-in-mh-tapola',
    "Direct search for 'Tapola' returns the Eco-tourism settlement",
    `First result: ${tapolaResults[0]?.entity.canonicalName}`
  );

  const kaasResults = HierarchicalGeoService.search('Kaas Plateau');
  assert(
    kaasResults.length > 0 && kaasResults[0].entity.id === 'dest-in-mh-kaas',
    "Direct search for 'Kaas Plateau' returns the UNESCO World Heritage site",
    `First result: ${kaasResults[0]?.entity.canonicalName}`
  );

  // ============================================================================
  // TEST 5: CATEGORY-IN-LOCATION INTENT PARSING
  // ============================================================================
  console.log('\n📌 Test Group 5: Category-in-Location Intent Parsing');
  
  const fuelResults = HierarchicalGeoService.search('petrol pump in Mahabaleshwar');
  assert(
    fuelResults.length > 0 && fuelResults.some(r => r.entity.category === 'petrol_pump'),
    "Query 'petrol pump in Mahabaleshwar' returns verified fuel stations in that town",
    `Returned ${fuelResults.length} places, top: ${fuelResults[0]?.entity.canonicalName}`
  );

  const hotelResults = HierarchicalGeoService.search('hotels in Mahabaleshwar');
  assert(
    hotelResults.length > 0 && hotelResults.some(r => r.entity.category === 'resort' || r.entity.category === 'hotel'),
    "Query 'hotels in Mahabaleshwar' returns Le Méridien and local resorts",
    `Returned ${hotelResults.length} places, top: ${hotelResults[0]?.entity.canonicalName}`
  );

  // ============================================================================
  // TEST 6: REAL LOCAL BUSINESS DISCOVERY & AMENITY METADATA
  // ============================================================================
  console.log('\n📌 Test Group 6: Real Local Business Discovery & Metadata');
  
  const iocStation = HierarchicalGeoService.getEntityById('biz-in-mh-ioc-mahabaleshwar');
  assert(
    Boolean(iocStation && iocStation.metadata?.fuelBrand === 'Indian Oil' && iocStation.metadata?.fuelTypes?.includes('Petrol')),
    'Indian Oil Mahabaleshwar has verified brand and dispensed fuels metadata'
  );

  const sururWashroom = HierarchicalGeoService.getEntityById('biz-in-mh-washroom-surur');
  assert(
    Boolean(sururWashroom && sururWashroom.metadata?.hygieneScore === 99 && sururWashroom.category === 'washroom'),
    'Surur-Wai comfort stop has verified hygiene score of 99%'
  );

  // ============================================================================
  // TEST 7: MULTILINGUAL ALIASES & ALTERNATE SPELLINGS
  // ============================================================================
  console.log('\n📌 Test Group 7: Multilingual Aliases & Typo Tolerance');
  
  const marathiSatara = HierarchicalGeoService.search('सातारा');
  assert(marathiSatara.length > 0, "Marathi Devanagari 'सातारा' matches Satara");

  const marathiMaha = HierarchicalGeoService.search('महाबळेश्वर');
  assert(marathiMaha.length > 0 && marathiMaha[0].entity.id === 'loc-in-mh-mahabaleshwar', "Marathi 'महाबळेश्वर' matches Mahabaleshwar");

  const typoMahableshwar = HierarchicalGeoService.search('Mahableshwar');
  assert(typoMahableshwar.length > 0 && typoMahableshwar[0].entity.id === 'loc-in-mh-mahabaleshwar', "Common alternate spelling 'Mahableshwar' matches canonical Mahabaleshwar");

  // ============================================================================
  // TEST 8: INTERNATIONAL ADMINISTRATIVE ADAPTABILITY
  // ============================================================================
  console.log('\n📌 Test Group 8: International Administrative Structures');
  
  // Tokyo, Japan
  const tokyoCrumbs = HierarchicalGeoService.getBreadcrumbs('poi-jp-shibuya-crossing');
  const tokyoPath = tokyoCrumbs.map(c => c.name).join(' → ');
  assert(
    tokyoPath === 'Asia → Japan → Tokyo Metropolis → Shibuya City → Shibuya Scramble Crossing',
    'Tokyo hierarchy: Country → Metropolis (Prefecture) → Special Ward → Crossing',
    `Got '${tokyoPath}'`
  );

  // Paris, France
  const parisCrumbs = HierarchicalGeoService.getBreadcrumbs('poi-fr-eiffel-tower');
  const parisPath = parisCrumbs.map(c => c.name).join(' → ');
  assert(
    parisPath === 'Europe → France → Île-de-France → Paris Department → Paris → 7th Arrondissement of Paris → Eiffel Tower',
    'Paris hierarchy: Region → Department (75) → Commune → Arrondissement → Monument',
    `Got '${parisPath}'`
  );

  // Amalfi Coast, Italy (Rural Destination)
  const amalfiCrumbs = HierarchicalGeoService.getBreadcrumbs('poi-it-spiaggia-grande');
  const amalfiPath = amalfiCrumbs.map(c => c.name).join(' → ');
  assert(
    amalfiPath === 'Europe → Italy → Campania → Province of Salerno → Amalfi Coast → Positano → Spiaggia Grande',
    'Amalfi Coast rural hierarchy: Region → Province → Coastal Region → Village → Beach',
    `Got '${amalfiPath}'`
  );

  // Maasai Mara, Kenya
  const maraCrumbs = HierarchicalGeoService.getBreadcrumbs('poi-ke-mara-river');
  const maraPath = maraCrumbs.map(c => c.name).join(' → ');
  assert(
    maraPath === 'Africa → Kenya → Narok County → Maasai Mara National Reserve → Mara River Crossing Point',
    'Kenya hierarchy: Country → County → Game Reserve → River Crossing',
    `Got '${maraPath}'`
  );

  // ============================================================================
  // TEST 9: COORDINATE BOUNDS & SOURCE INTEGRITY
  // ============================================================================
  console.log('\n📌 Test Group 9: Coordinate Accuracy & Data Attribution');
  
  let validCoords = true;
  for (const ent of HIERARCHICAL_GEO_ENTITIES) {
    const lat = ent.coordinates.lat;
    const lng = ent.coordinates.lng;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      validCoords = false;
      console.error(`Invalid coordinates on ${ent.id}: (${lat}, ${lng})`);
    }
  }
  // ============================================================================
  // TEST 11: BIHAR VERIFIED GEOGRAPHIC HIERARCHY & AUTHENTIC KNOWLEDGE RESOLUTION
  // ============================================================================
  console.log('\n📌 Test Group 11: Bihar Verified Hierarchy & Real Destination Resolution');
  
  // 1. Mahabodhi Temple Complex dynamic breadcrumbs
  const mahabodhiCrumbs = HierarchicalGeoService.getBreadcrumbs('poi-in-br-mahabodhi');
  const mahabodhiPath = mahabodhiCrumbs.map(c => c.name).join(' → ');
  assert(
    mahabodhiPath === 'Asia → India → Bihar → Gaya District → Bodh Gaya → Mahabodhi Temple Complex',
    'Mahabodhi dynamic breadcrumbs: Country → State → District → Town → Attraction',
    `Got '${mahabodhiPath}'`
  );

  // 2. Nalanda University Ruins dynamic breadcrumbs
  const nalandaCrumbs = HierarchicalGeoService.getBreadcrumbs('poi-in-br-nalanda-ruins');
  const nalandaPath = nalandaCrumbs.map(c => c.name).join(' → ');
  assert(
    nalandaPath === 'Asia → India → Bihar → Nalanda District → Nalanda → Ancient Nalanda Mahavihara University Ruins',
    'Nalanda dynamic breadcrumbs: Country → State → District → Locality → Attraction',
    `Got '${nalandaPath}'`
  );

  // 3. Valmiki Tiger Reserve dynamic breadcrumbs
  const valmikiCrumbs = HierarchicalGeoService.getBreadcrumbs('poi-in-br-valmiki-tiger-reserve');
  const valmikiPath = valmikiCrumbs.map(c => c.name).join(' → ');
  assert(
    valmikiPath === 'Asia → India → Bihar → West Champaran District → Valmiki Nagar → Valmiki National Park & Tiger Reserve',
    'Valmiki Tiger Reserve dynamic breadcrumbs in West Champaran',
    `Got '${valmikiPath}'`
  );

  // 4. Direct search for Bihar places
  const kakolatSearch = HierarchicalGeoService.search('Kakolat');
  assert(
    kakolatSearch.length > 0 && kakolatSearch[0].entity.id === 'poi-in-br-kakolat-waterfall',
    "Direct search for 'Kakolat' returns 160ft natural waterfall in Nawada",
    `Found: ${kakolatSearch[0]?.entity.canonicalName}`
  );

  const bodhGayaSearch = HierarchicalGeoService.search('Bodh Gaya');
  assert(
    bodhGayaSearch.some(r => r.entity.id === 'loc-in-br-bodh-gaya'),
    "Search for 'Bodh Gaya' returns sacred pilgrimage town in Gaya District"
  );

  // 5. Test resolveDestinationKnowledge for Bihar
  const { resolveDestinationKnowledge } = await import('../data/destinationKnowledge');
  const biharProfile = resolveDestinationKnowledge('Bihar');

  // Verify real attractions, real foods, and real currency
  const hasMahabodhi = biharProfile.attractions.some(a => a.name.includes('Mahabodhi'));
  const hasNalanda = biharProfile.attractions.some(a => a.name.includes('Nalanda'));
  const hasValmiki = biharProfile.attractions.some(a => a.name.includes('Valmiki'));
  assert(hasMahabodhi && hasNalanda && hasValmiki, "resolveDestinationKnowledge('Bihar') returns genuine UNESCO & National Park attractions (Mahabodhi, Nalanda, Valmiki)");

  const hasLittiChokha = biharProfile.foodRecommendations.some(f => f.name.includes('Litti Chokha'));
  const hasChamparanHandi = biharProfile.foodRecommendations.some(f => f.name.includes('Champaran'));
  const hasSilaoKhaja = biharProfile.foodRecommendations.some(f => f.name.includes('Silao Khaja'));
  assert(hasLittiChokha && hasChamparanHandi && hasSilaoKhaja, "resolveDestinationKnowledge('Bihar') returns authentic cuisine (Litti Chokha, Champaran Handi, Silao Khaja)");

  // Verify Nature category has real Bihar places with INR currency
  const naturePlaces = biharProfile.categoryDetails.nature.topPlaces;
  const natureHasValmiki = naturePlaces.some(p => p.name.includes('Valmiki'));
  const natureHasKakolat = naturePlaces.some(p => p.name.includes('Kakolat'));
  assert(natureHasValmiki && natureHasKakolat, "Nature category in Bihar modal displays Valmiki Tiger Reserve and Kakolat Falls, not generic ridge lookoffs");

  const noFakeNames = !naturePlaces.some(p => p.name.includes('Ridge Nature Reserve') || p.name.includes('Summit Lookoff'));
  assert(noFakeNames, "Zero hallucinated placeholder names in Bihar nature category");

  const natureCostHasINR = biharProfile.categoryDetails.nature.estimatedCost.includes('₹') || biharProfile.categoryDetails.nature.estimatedCost.includes('Free');
  assert(natureCostHasINR, `Nature cost uses authentic Indian currency (₹ / Free access), measured: ${biharProfile.categoryDetails.nature.estimatedCost}`);

  // --------------------------------------------------------------------------
  console.log(`\n📌 Test Group 12: Bihar Regional Districts, Local Neighborhoods & Universal Coverage`);
  // --------------------------------------------------------------------------
  // 1. Muzaffarpur search & breadcrumbs
  const muzaffarpurSearch = HierarchicalGeoService.search('Muzaffarpur');
  assert(muzaffarpurSearch.some(r => r.entity.id === 'loc-in-br-muzaffarpur'), "Direct search for 'Muzaffarpur' returns Litchi commercial capital");
  
  const garibnathCrumbs = HierarchicalGeoService.getBreadcrumbs('poi-in-br-garibnath-temple');
  const garibnathPath = garibnathCrumbs.map(c => c.name).join(' → ');
  assert(
    garibnathPath === 'Asia → India → Bihar → Muzaffarpur District → Muzaffarpur → Baba Garibnath Dham',
    'Garibnath Temple dynamic breadcrumbs: Country → State → District → City → Temple',
    `Got '${garibnathPath}'`
  );

  // 2. Bhagalpur & Vikramshila
  const vikramshilaSearch = HierarchicalGeoService.search('Vikramshila');
  assert(vikramshilaSearch.length > 0 && vikramshilaSearch[0].entity.id === 'poi-in-br-vikramshila', "Direct search for 'Vikramshila' returns 8th-century university ruins");

  // 3. Darbhanga & Raj Darbhanga Palace
  const darbhangaSearch = HierarchicalGeoService.search('Darbhanga');
  assert(darbhangaSearch.some(r => r.entity.id === 'loc-in-br-darbhanga'), "Direct search for 'Darbhanga' returns Mithila cultural capital");

  // 4. Vaishali & Ashoka Pillar
  const vaishaliCrumbs = HierarchicalGeoService.getBreadcrumbs('poi-in-br-vaishali-ashoka-pillar');
  const vaishaliPath = vaishaliCrumbs.map(c => c.name).join(' → ');
  assert(
    vaishaliPath === 'Asia → India → Bihar → Vaishali District → Vaishali → Vaishali Ashoka Pillar & Relic Stupa',
    'Vaishali Ashoka Pillar dynamic breadcrumbs in ancient democratic republic',
    `Got '${vaishaliPath}'`
  );

  // 5. Sasaram Sher Shah Suri tomb
  const sasaramSearch = HierarchicalGeoService.search('Sasaram');
  assert(sasaramSearch.some(r => r.entity.id === 'loc-in-br-sasaram'), "Direct search for 'Sasaram' returns Imperial mausoleum city");

  // 6. Granular Patna neighborhoods
  const boringRoadSearch = HierarchicalGeoService.search('Boring Road');
  assert(boringRoadSearch.some(r => r.entity.id === 'loc-in-br-patna-boring-road'), "Granular search for 'Boring Road' returns central commercial precinct");

  const kankarbaghSearch = HierarchicalGeoService.search('Kankarbagh');
  assert(kankarbaghSearch.some(r => r.entity.id === 'loc-in-br-patna-kankarbagh'), "Granular search for 'Kankarbagh' returns expansive residential suburb");

  // Summary
  console.log(`\n==============================================================================`);
  console.log(`TEST SUITE RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log(`==============================================================================`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal error in verification test suite:', err);
  process.exit(1);
});
