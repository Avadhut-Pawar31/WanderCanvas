import assert from 'node:assert/strict';
import { 
  ChatService, 
  generateUuid, 
  isUuid, 
  isSameOrDuplicateMessage 
} from '../services/chatService';
import { CollaborationService } from '../services/collaborationService';
import { TripMessage } from '../types';

async function runChatSyncTests() {
  console.log('🧪 Running WanderCanvas Chat & Real-Time Sync Verification...\n');

  // Test 1: UUID Generation and Validation
  console.log('👉 [1/4] Testing UUID generator & validator...');
  const uuid1 = generateUuid();
  const uuid2 = generateUuid();
  assert.ok(isUuid(uuid1), `Generated string ${uuid1} must be a valid UUID`);
  assert.ok(isUuid(uuid2), `Generated string ${uuid2} must be a valid UUID`);
  assert.notEqual(uuid1, uuid2, 'Consecutive UUIDs must be distinct');
  assert.equal(isUuid('traveler-guest'), false, 'Non-UUID strings must return false');
  assert.equal(isUuid('user-me'), false, 'Placeholder strings must return false');
  console.log('   ✓ UUID generator and validator functioning properly');

  // Test 2: Message Deduplication Logic
  console.log('\n👉 [2/4] Testing Message Deduplication (isSameOrDuplicateMessage)...');
  const now = new Date().toISOString();
  const msgA: TripMessage = {
    id: uuid1,
    tripId: 'trip-123',
    senderId: 'user-456',
    senderName: 'Avadhut',
    content: 'Hello everyone!',
    timestamp: now,
    type: 'text',
  };

  // Exact duplicate with same ID
  const msgSameId: TripMessage = { ...msgA };
  assert.equal(isSameOrDuplicateMessage(msgA, msgSameId), true, 'Same ID must be recognized as duplicate');

  // Echoed duplicate with different ID (e.g. client ID vs DB UUID) within 2 seconds
  const msgEchoedDifferentId: TripMessage = {
    id: uuid2,
    tripId: 'trip-123',
    senderId: 'user-456',
    senderName: 'Avadhut',
    content: 'Hello everyone! ',
    timestamp: new Date(Date.now() + 1500).toISOString(),
    type: 'text',
  };
  assert.equal(
    isSameOrDuplicateMessage(msgA, msgEchoedDifferentId), 
    true, 
    'Same sender & content within 5 seconds must be deduplicated'
  );

  // Different content -> NOT duplicate
  const msgDifferentContent: TripMessage = {
    ...msgA,
    id: generateUuid(),
    content: 'Different message',
  };
  assert.equal(
    isSameOrDuplicateMessage(msgA, msgDifferentContent), 
    false, 
    'Different content must not be marked duplicate'
  );

  // Different sender -> NOT duplicate
  const msgDifferentSender: TripMessage = {
    ...msgA,
    id: generateUuid(),
    senderId: 'user-789',
  };
  assert.equal(
    isSameOrDuplicateMessage(msgA, msgDifferentSender), 
    false, 
    'Different sender must not be marked duplicate'
  );

  // Message sent 10 seconds later -> NOT duplicate
  const msgLater: TripMessage = {
    ...msgA,
    id: generateUuid(),
    timestamp: new Date(Date.now() + 10000).toISOString(),
  };
  assert.equal(
    isSameOrDuplicateMessage(msgA, msgLater), 
    false, 
    'Same message sent >5s later is an intentional repeat, not duplicate'
  );
  console.log('   ✓ Message deduplication successfully eliminates double-rendering');

  // Test 3: ChatService Send & Local Integration
  console.log('\n👉 [3/4] Testing ChatService.sendMessage...');
  const testTripId = 'trip-mahabaleshwar-kaas';
  const sentMsg = ChatService.sendMessage({
    tripId: testTripId,
    senderId: 'test-sender',
    senderName: 'Test Traveler',
    content: 'Checking live coordination',
    type: 'text',
  });

  assert.ok(sentMsg.id, 'Message must have an assigned ID');
  assert.equal(sentMsg.content, 'Checking live coordination');
  assert.equal(sentMsg.senderName, 'Test Traveler');

  const trip = CollaborationService.getTripById(testTripId);
  assert.ok(trip, 'Trip must exist');
  assert.ok(
    trip.messages.some(m => m.id === sentMsg.id), 
    'Sent message must be in trip messages array'
  );
  console.log('   ✓ ChatService.sendMessage stores message correctly');

  // Test 4: Chat Message Cache Deduplication
  console.log('\n👉 [4/4] Testing Double-Send Protection in Storage...');
  const countBefore = trip.messages.length;
  // Send identical message immediately
  ChatService.sendMessage({
    tripId: testTripId,
    senderId: 'test-sender',
    senderName: 'Test Traveler',
    content: 'Checking live coordination',
    type: 'text',
  });
  const countAfter = trip.messages.length;
  // Due to alreadyExists check in sendMessage, duplicate content should not inflate array
  assert.equal(countAfter, countBefore, 'Storage must not store duplicate message within 5s');
  console.log('   ✓ Storage level double-send prevention confirmed');

  console.log('\n🎉 ALL 4 CHAT & REAL-TIME SYNC TESTS PASSED SUCCESSFULLY!\n');
}

runChatSyncTests().catch((err) => {
  console.error('❌ Chat Sync Verification Failed:', err);
  process.exit(1);
});
