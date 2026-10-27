'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  CollaborativeTrip, 
  Place, 
  PlaceCategory 
} from '@/types';
import { CollaborationService } from '@/services/collaborationService';
import { MapRouteService } from '@/services/mapRouteService';
import { HygieneService } from '@/services/hygieneService';
import { InteractiveRouteMap } from '@/components/map/InteractiveRouteMap';
import { SharedItineraryPanel } from '@/components/collaboration/SharedItineraryPanel';
import { TripChatPanel } from '@/components/chat/TripChatPanel';
import { AITravelAssistantPanel } from '@/components/ai/AITravelAssistantPanel';
import { HygieneReportModal } from '@/components/hygiene/HygieneReportModal';
import { 
  ArrowLeft, 
  UserPlus, 
  Calendar, 
  DollarSign, 
  Navigation, 
  Check, 
  Copy, 
  Filter, 
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TripWorkspaceViewProps {
  initialTrip: CollaborativeTrip;
  currentUser: { id: string; name: string; email: string; avatar?: string };
}

export function TripWorkspaceView({
  initialTrip,
  currentUser,
}: TripWorkspaceViewProps) {
  const [trip, setTrip] = useState<CollaborativeTrip>(initialTrip);
  const [activeTab, setActiveTab] = useState<'map' | 'itinerary' | 'chat' | 'hygiene' | 'assistant'>('map');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [inspectingPlace, setInspectingPlace] = useState<Place | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Filters for corridor discovery
  const [discoveryCategory, setDiscoveryCategory] = useState<PlaceCategory | 'all'>('all');
  const [maxDetourFilter, setMaxDetourFilter] = useState<number>(20);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Candidate places near route calculated deterministically
  const candidatePlaces = useMemo(() => {
    if (!trip.route) return [];
    return MapRouteService.findStopsAlongRoute(trip.route, {
      category: discoveryCategory,
      maxDetourMinutes: maxDetourFilter,
      minHygieneStatus: verifiedOnly ? 'verified_only' : 'all',
    });
  }, [trip.route, discoveryCategory, maxDetourFilter, verifiedOnly]);

  // Determine current user's role in this trip
  const memberRecord = trip.members.find(m => m.userId === currentUser.id);
  const userRole: 'owner' | 'editor' | 'viewer' = memberRecord?.role || (trip.ownerId === currentUser.id ? 'owner' : 'editor');

  useEffect(() => {
    // Real-time synchronization subscription
    const unsubscribe = CollaborationService.subscribeToUpdates((event) => {
      const payload = event.payload as { tripId?: string; id?: string } | undefined;
      if (payload && (payload.tripId === trip.id || payload.id === trip.id)) {
        const updated = CollaborationService.getTripById(trip.id);
        if (updated) {
          setTrip(updated);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [trip.id]);

  // Compute route asynchronously if not already present on trip
  useEffect(() => {
    let isCancelled = false;
    if (!trip.route && trip.origin && trip.destination) {
      MapRouteService.calculateRoute({
        origin: trip.origin,
        destination: trip.destination,
        travelMode: trip.travelMode,
        waypoints: trip.stops,
      }).then((computedRoute) => {
        if (!isCancelled) {
          setTrip((prev) => ({ ...prev, route: computedRoute }));
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [trip.route, trip.origin, trip.destination, trip.travelMode, trip.stops]);

  const handleAddStop = (place: Place) => {
    const waypoint = CollaborationService.addStopDirectly(trip.id, place, currentUser);
    if (waypoint) {
      const updated = CollaborationService.getTripById(trip.id);
      if (updated) setTrip(updated);
      toast.success(`Added ${place.name} to route!`);
    }
  };

  const handleSuggestStop = (place: Place, reason?: string) => {
    const suggestion = CollaborationService.suggestStop(trip.id, place, currentUser, reason);
    if (suggestion) {
      const updated = CollaborationService.getTripById(trip.id);
      if (updated) setTrip(updated);
      toast.success(`Proposed ${place.name} for group voting!`);
    }
  };

  const handleVoteSuggestion = (suggestionId: string, vote: 1 | -1) => {
    const res = CollaborationService.voteOnSuggestion(trip.id, suggestionId, currentUser, vote);
    if (res) {
      const updated = CollaborationService.getTripById(trip.id);
      if (updated) setTrip(updated);
      if (res.promotedToStop) {
        toast.success(`Consensus reached! Added to route stops.`);
      } else {
        toast.success(`Vote recorded.`);
      }
    }
  };

  const handleRemoveStop = (stopId: string) => {
    const success = CollaborationService.removeStop(trip.id, stopId, currentUser.id);
    if (success) {
      const updated = CollaborationService.getTripById(trip.id);
      if (updated) setTrip(updated);
      toast.success('Stop removed.');
    }
  };

  const handleCopyInviteCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(trip.invitationCode);
      setCopiedCode(true);
      toast.success('Invitation code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#292D2A] pb-24">
      {/* 1. WORKSPACE HEADER */}
      <header className="sticky top-0 z-40 bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#244536]/10 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/my-trips"
              className="p-2 rounded-xl border border-[#244536]/15 text-[#244536] hover:bg-white transition-colors"
              title="Back to My Trips"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C78363]">
                  Collaborative Workspace
                </span>
                <span className="text-[10px] bg-[#E7ECE5] text-[#244536] px-2 py-0.5 rounded font-medium">
                  Role: {userRole}
                </span>
              </div>
              <h1 className="font-serif text-2xl font-medium text-[#244536]">
                {trip.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#5F6761] mt-0.5">
                <span className="flex items-center gap-1 font-medium text-[#244536]">
                  <Navigation className="w-3.5 h-3.5" />
                  {trip.origin} → {trip.destination}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {trip.startDate} – {trip.endDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  ${trip.budget} budget
                </span>
              </div>
            </div>
          </div>

          {/* Members & Invite Action */}
          <div className="flex items-center gap-3">
            {/* Member avatars */}
            <div className="flex items-center -space-x-2">
              {trip.members.map((m) => (
                <div
                  key={m.userId}
                  className="w-8 h-8 rounded-full bg-[#244536] text-white border-2 border-white flex items-center justify-center text-xs font-semibold shadow-xs"
                  title={`${m.name} (${m.role})`}
                >
                  {m.name.charAt(0)}
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-[#244536]/25 text-[#244536] hover:bg-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Friends</span>
            </button>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-6 mt-4 pt-2 border-t border-[#244536]/8 overflow-x-auto">
          {(
            [
              { id: 'map', label: 'Route & Map Planner', badge: `${trip.stops.length} stops` },
              { id: 'itinerary', label: 'Shared Itinerary & Voting', badge: `${trip.suggestions.length} votes` },
              { id: 'chat', label: 'Trip Group Chat', badge: `${trip.messages.length}` },
              { id: 'hygiene', label: 'Hygiene & Washrooms', badge: `${candidatePlaces.length}` },
              { id: 'assistant', label: 'AI Travel Assistant', badge: undefined },
            ] as Array<{ id: 'map' | 'itinerary' | 'chat' | 'hygiene' | 'assistant'; label: string; badge?: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#244536] text-[#244536] font-semibold'
                  : 'border-transparent text-[#5F6761] hover:text-[#244536]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-[#244536] text-white' : 'bg-[#E7ECE5] text-[#244536]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-8">
        {/* TAB 1: ROUTE & MAP PLANNER */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Map Visualizer */}
            <div className="lg:col-span-7 space-y-4">
              {trip.route ? (
                <InteractiveRouteMap
                  route={trip.route}
                  stops={trip.stops}
                  candidatePlaces={candidatePlaces}
                  selectedPlace={selectedPlace}
                  onSelectPlace={(p) => {
                    setSelectedPlace(p);
                    setInspectingPlace(p);
                  }}
                  onAddStop={handleAddStop}
                  onSuggestStop={(p) => handleSuggestStop(p)}
                  userRole={userRole}
                />
              ) : (
                <div className="h-[450px] rounded-3xl bg-white border border-[#244536]/15 flex items-center justify-center text-xs text-[#5F6761]">
                  Calculating corridor geometry...
                </div>
              )}

              {/* Discovery Filters Bar */}
              <div className="p-4 rounded-2xl bg-white border border-[#244536]/15 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#244536] flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    Filters:
                  </span>
                  {(['all', 'washroom', 'restaurant', 'hotel', 'fuel'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setDiscoveryCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                        discoveryCategory === cat
                          ? 'bg-[#244536] text-white font-medium'
                          : 'bg-[#F7F5EF] text-[#5F6761] hover:text-[#244536]'
                      }`}
                    >
                      {cat === 'all' ? 'All Places' : cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#244536] font-medium">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#244536] focus:ring-[#244536]"
                    />
                    <span>Verified Only</span>
                  </label>
                  <span className="text-[#5F6761]">
                    Max {maxDetourFilter}m detour
                  </span>
                </div>
              </div>
            </div>

            {/* Stops Along Corridor List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-medium text-[#244536]">
                  Candidate Corridor Stops ({candidatePlaces.length})
                </h3>
                <span className="text-xs text-[#5F6761]">
                  Sorted by hygiene &amp; detour
                </span>
              </div>

              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {candidatePlaces.map((place) => {
                  const badge = HygieneService.getStatusBadge(place.hygieneStatus);
                  const isSelected = selectedPlace?.id === place.id;

                  return (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#244536] ring-2 ring-[#244536]/20 shadow-md'
                          : 'bg-white border-[#244536]/15 hover:border-[#244536]/40 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold uppercase text-[#C78363]">
                            {place.category}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badge.color}`}>
                            {badge.shortLabel}
                          </span>
                        </div>

                        {place.hygieneScore && (
                          <span className="text-xs font-bold text-[#244536] bg-[#E7ECE5] px-2 py-0.5 rounded">
                            Score: {place.hygieneScore}/100
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif text-base font-medium text-[#244536]">
                        {place.name}
                      </h4>
                      <p className="text-xs text-[#5F6761] line-clamp-1">
                        {place.address}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-[#244536]/10 flex items-center justify-between text-xs">
                        <span className="text-[#C78363] font-medium">
                          +{place.detourKm || 0.8} km (~{place.detourMinutes || 3} min detour)
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingPlace(place);
                            }}
                            className="text-[#5F6761] hover:text-[#244536] font-medium"
                          >
                            Audit Log
                          </button>
                          {userRole !== 'viewer' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddStop(place);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#244536] text-white hover:bg-[#1B3529] font-medium"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHARED ITINERARY & VOTING */}
        {activeTab === 'itinerary' && (
          <div className="max-w-4xl mx-auto">
            <SharedItineraryPanel
              trip={trip}
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
              userRole={userRole}
              onVoteSuggestion={handleVoteSuggestion}
              onRemoveStop={handleRemoveStop}
              onSelectPlaceForInspection={(p) => setInspectingPlace(p)}
              onOpenDiscovery={() => setActiveTab('map')}
            />
          </div>
        )}

        {/* TAB 3: TRIP GROUP CHAT */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto">
            <TripChatPanel
              tripId={trip.id}
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
              onInspectPlace={(p) => setInspectingPlace(p)}
            />
          </div>
        )}

        {/* TAB 4: HYGIENE & WASHROOM DIRECTORY */}
        {activeTab === 'hygiene' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#244536]/15 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#244536]" />
                <h3 className="font-serif text-xl font-medium text-[#244536]">
                  Corridor Hygiene &amp; Sanitation Directory
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#5F6761]">
                All rest stops, public restrooms, cafes, and lodging facilities along <span className="font-semibold text-[#244536]">{trip.origin} → {trip.destination}</span> audited against objective cleanliness and sanitation criteria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidatePlaces.map((place) => {
                const badge = HygieneService.getStatusBadge(place.hygieneStatus);
                return (
                  <div
                    key={place.id}
                    className="p-5 rounded-2xl bg-white border border-[#244536]/15 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#F0F3EF] text-[#244536] font-medium capitalize">
                          {place.category}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badge.color}`}>
                          {badge.shortLabel}
                        </span>
                      </div>

                      <h4 className="font-serif text-lg font-medium text-[#244536]">
                        {place.name}
                      </h4>
                      <p className="text-xs text-[#5F6761] line-clamp-1 mt-0.5">
                        {place.address}
                      </p>

                      <div className="mt-4 p-3 rounded-xl bg-[#F7F5EF] space-y-2 text-xs">
                        <div className="flex items-center justify-between font-medium">
                          <span>Hygiene Score</span>
                          <span className="font-bold text-[#244536]">{place.hygieneScore || 'N/A'}/100</span>
                        </div>
                        <div className="flex items-center justify-between text-[#5F6761]">
                          <span>Water Supply</span>
                          <span>{place.waterAvailable ? '✓ Available' : '✗ Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[#5F6761]">
                          <span>Soap Stocked</span>
                          <span>{place.soapAvailable ? '✓ Yes' : '✗ No'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[#5F6761]">
                          <span>Wheelchair Access</span>
                          <span>{place.accessibleFacility ? '✓ Accessible' : 'Standard'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#244536]/10 flex items-center justify-between">
                      <button
                        onClick={() => setInspectingPlace(place)}
                        className="text-xs font-semibold text-[#244536] hover:underline"
                      >
                        Inspect Audit Logs →
                      </button>

                      {userRole !== 'viewer' && (
                        <button
                          onClick={() => handleAddStop(place)}
                          className="px-3 py-1.5 rounded-xl bg-[#244536] text-white text-xs font-medium hover:bg-[#1B3529] transition-colors"
                        >
                          Add to Route
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: AI TRAVEL ASSISTANT */}
        {activeTab === 'assistant' && (
          <div className="max-w-4xl mx-auto">
            <AITravelAssistantPanel
              trip={trip}
              candidatePlaces={candidatePlaces}
              onAddStop={handleAddStop}
              onSuggestStop={handleSuggestStop}
              onInspectPlace={(p) => setInspectingPlace(p)}
            />
          </div>
        )}
      </main>

      {/* 3. HYGIENE REPORT DETAIL MODAL */}
      {inspectingPlace && (
        <HygieneReportModal
          place={inspectingPlace}
          isOpen={!!inspectingPlace}
          onClose={() => setInspectingPlace(null)}
          currentUser={currentUser}
        />
      )}

      {/* 4. INVITATION MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#244536]/15 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C78363]">
                  Group Collaboration
                </span>
                <h3 className="font-serif text-2xl font-medium text-[#244536] mt-0.5">
                  Invite Friends to Trip
                </h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-2 rounded-xl text-[#5F6761] hover:text-[#244536] transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5F6761] leading-relaxed">
              Anyone with this invitation code can join your trip workspace, propose stops along the route, vote on recommendations, and chat in real time.
            </p>

            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#244536]/15 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5F6761]">
                Invitation Code
              </span>
              <div className="flex items-center justify-between">
                <span className="font-serif text-2xl font-bold tracking-wider text-[#244536]">
                  {trip.invitationCode}
                </span>
                <button
                  onClick={handleCopyInviteCode}
                  className="px-3 py-1.5 rounded-xl bg-[#244536] text-white text-xs font-medium hover:bg-[#1B3529] transition-colors flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#244536]/10">
              <h4 className="text-xs font-semibold text-[#244536]">
                Current Trip Members ({trip.members.length})
              </h4>
              <div className="space-y-2">
                {trip.members.map((m) => (
                  <div key={m.userId} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#E7ECE5] text-[#244536] flex items-center justify-center font-bold text-[10px]">
                        {m.name.charAt(0)}
                      </div>
                      <span className="font-medium text-[#292D2A]">{m.name}</span>
                    </div>
                    <span className="text-[11px] text-[#5F6761] capitalize">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#F7F5EF] text-[#244536] text-xs font-medium hover:bg-[#E7ECE5] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
