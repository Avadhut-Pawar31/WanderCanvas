'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  Plus, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  X, 
  Compass 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CollaborationService } from '@/services/collaborationService';
import { CollaborativeTrip, TravelMode } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { PlacesAutocompleteInput } from '@/components/map/PlacesAutocompleteInput';
import toast from 'react-hot-toast';

function MyTripsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<CollaborativeTrip[]>(() => {
    let all = CollaborationService.getAllTrips();
    if (all.length === 0) {
      const demo = CollaborationService.getTripById('trip-amalfi-classic');
      if (demo) {
        all = [demo];
      }
    }
    return all;
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Join trip modal state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // New trip modal state
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [newTripData, setNewTripData] = useState({
    name: 'Tuscan Wine & Medieval Towns',
    origin: 'Florence, Italy',
    destination: 'Siena, Italy',
    startDate: '2026-06-10',
    endDate: '2026-06-16',
    budgetTotal: 1800,
    transportMode: 'driving' as TravelMode,
    travelersCount: 3,
  });

  const loadTrips = useCallback(() => {
    if (user?.id) {
      CollaborationService.fetchUserTripsFromSupabase(user.id).then((fetched) => {
        setTrips(fetched);
      });
    } else {
      setTrips(CollaborationService.getAllTrips());
    }
  }, [user?.id]);

  useEffect(() => {
    loadTrips();
    const unsubscribe = CollaborationService.subscribeToUpdates(() => {
      loadTrips();
    });
    return () => unsubscribe();
  }, [loadTrips]);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Invite code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleJoinTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    setIsJoining(true);
    const code = inviteCodeInput.trim().toUpperCase();

    const traveler = {
      id: user?.id || 'traveler-guest',
      name: user?.name || 'Explorer',
      email: user?.email || 'explorer@wandercanvas.com',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    };

    const joinedTrip = CollaborationService.joinTripByInviteCode(code, traveler);
    setIsJoining(false);

    if (joinedTrip) {
      toast.success(`Joined trip: ${joinedTrip.name}`);
      setIsJoinModalOpen(false);
      setInviteCodeInput('');
      router.push(`/workspace/${joinedTrip.id}`);
    } else {
      toast.error('Invalid or expired invite code. Try "AMALFI-26"');
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    const traveler = {
      id: user?.id || 'user-me',
      name: user?.name || 'Lead Traveler',
      email: user?.email || 'traveler@wandercanvas.com',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    };

    try {
      const created = await CollaborationService.createTrip({
        name: newTripData.name,
        origin: newTripData.origin,
        destination: newTripData.destination,
        startDate: newTripData.startDate,
        endDate: newTripData.endDate,
        budget: newTripData.budgetTotal,
        travelMode: newTripData.transportMode,
        groupSize: newTripData.travelersCount,
        owner: traveler,
      });
      toast.success('Collaborative trip created!');
      setIsNewTripModalOpen(false);
      loadTrips();
      router.push(`/workspace/${created.id}`);
    } catch {
      toast.error('Failed to create trip corridor.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#292D2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 pb-8 border-b border-[#244536]/10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#244536] mb-2 px-2.5 py-0.5 rounded-full bg-[#244536]/10">
                <Sparkles className="w-3.5 h-3.5 text-[#C78363]" />
                Collaborative Workspaces
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#292D2A]">
                My Trips & Shared Itineraries
              </h1>
              <p className="text-sm text-[#292D2A]/70 mt-1 max-w-xl">
                Real-time route corridors, hygiene-audited stops, team voting, and live chat.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsJoinModalOpen(true)}
                variant="outline"
                className="border-[#244536]/20 bg-white text-[#244536] hover:bg-[#244536]/5 text-xs font-mono uppercase tracking-wider h-10 px-4 rounded-lg"
              >
                <KeyRound className="w-4 h-4 mr-2 text-[#C78363]" />
                Enter Invite Code
              </Button>
              <Button
                onClick={() => setIsNewTripModalOpen(true)}
                className="bg-[#244536] text-white hover:bg-[#1a3328] text-xs font-mono uppercase tracking-wider h-10 px-4 rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Trips List */}
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 * index }}
                onClick={() => router.push(`/workspace/${trip.id}`)}
                className="group cursor-pointer bg-white rounded-2xl border border-[#244536]/10 overflow-hidden shadow-sm hover:shadow-md hover:border-[#244536]/30 transition-all duration-300 flex flex-col"
              >
                {/* Cover & Badges */}
                <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-stone-100">
                  <img
                    src={trip.coverImage || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80'}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Top tags */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[#244536] font-medium flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Hygiene Audited Corridor
                    </span>
                    <button
                      onClick={(e) => handleCopyCode(trip.invitationCode, e)}
                      title="Click to copy invite code"
                      className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white/90 hover:bg-black/80 flex items-center gap-1.5 transition"
                    >
                      {copiedCode === trip.invitationCode ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Code: {trip.invitationCode}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bottom title in cover */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-serif font-medium text-white drop-shadow-sm">
                      {trip.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/80 mt-1 font-mono">
                      <span>{trip.route ? trip.route.origin.name : trip.origin}</span>
                      <ArrowRight className="w-3 h-3 text-[#C78363]" />
                      <span>{trip.route ? trip.route.destination.name : trip.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Meta row */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-[#244536]/10 text-xs">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-[#292D2A]/50">Dates</div>
                        <div className="font-medium text-[#292D2A] mt-0.5 truncate">
                          {trip.startDate} - {trip.endDate}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-[#292D2A]/50">Distance</div>
                        <div className="font-medium text-[#292D2A] mt-0.5 font-mono">
                          {trip.route ? `${trip.route.distanceKm} km` : 'Scenic corridor'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-[#292D2A]/50">Stops &amp; Proposals</div>
                        <div className="font-medium text-[#292D2A] mt-0.5">
                          {trip.stops.length} stops &bull; {trip.suggestions.length} votes
                        </div>
                      </div>
                    </div>

                    {/* Members row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {trip.members.map((member) => (
                            <div
                              key={member.userId || member.email}
                              title={`${member.name} (${member.role})`}
                              className="w-7 h-7 rounded-full bg-[#244536] text-white flex items-center justify-center text-xs font-serif font-bold border-2 border-white shadow-xs"
                            >
                              {member.name?.charAt(0).toUpperCase() || 'M'}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-[#292D2A]/70 font-mono">
                          {trip.members.length} {trip.members.length === 1 ? 'member' : 'members'} collaborating
                        </span>
                      </div>

                      <span className="text-xs font-mono uppercase tracking-wider text-[#244536] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Open Workspace &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#244536]/10 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#244536]/10 flex items-center justify-center mx-auto mb-4 text-[#244536]">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif text-[#292D2A]">No Trips Created Yet</h3>
            <p className="text-xs text-[#292D2A]/70 mt-1 mb-6">
              Start planning a route corridor with hygiene inspection history or join an existing group.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => {
                  const demo = CollaborationService.getTripById('trip-amalfi-classic');
                  if (demo) router.push(`/workspace/${demo.id}`);
                }}
                className="bg-[#244536] text-white hover:bg-[#1a3328] text-xs font-mono uppercase tracking-wider"
              >
                Load Amalfi Demo Trip
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Join Trip Modal */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 border border-[#244536]/15 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#244536]/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#244536]/10 text-[#244536] flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-[#292D2A]">Join Trip with Code</h3>
                    <p className="text-xs text-[#292D2A]/60">Enter an invitation token</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsJoinModalOpen(false)}
                  className="p-1 rounded-md text-[#292D2A]/40 hover:text-[#292D2A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleJoinTrip} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#292D2A]/70 mb-1">
                    Trip Invitation Code
                  </label>
                  <input
                    type="text"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. AMALFI-26"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#244536]/20 font-mono text-center tracking-widest text-lg uppercase text-[#244536] focus:outline-hidden focus:border-[#244536]"
                    autoFocus
                  />
                  <p className="text-[11px] text-[#292D2A]/50 mt-1">
                    Tip: Try demo code <strong className="font-mono text-[#244536]">AMALFI-26</strong> to enter the Amalfi Coast itinerary.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="text-xs font-mono uppercase"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isJoining || !inviteCodeInput.trim()}
                    className="bg-[#244536] text-white hover:bg-[#1a3328] text-xs font-mono uppercase tracking-wider"
                  >
                    {isJoining ? 'Joining...' : 'Enter Workspace'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Trip Modal */}
      <AnimatePresence>
        {isNewTripModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 border border-[#244536]/15 max-w-lg w-full shadow-xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#244536]/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#244536]/10 text-[#244536] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-medium text-[#292D2A]">Create Collaborative Trip</h3>
                    <p className="text-xs text-[#292D2A]/60">Define route corridor and preferences</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewTripModalOpen(false)}
                  className="p-1 rounded-md text-[#292D2A]/40 hover:text-[#292D2A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTrip} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#292D2A]/70 mb-1">Trip Name</label>
                  <input
                    type="text"
                    required
                    value={newTripData.name}
                    onChange={(e) => setNewTripData({ ...newTripData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#244536]/20 text-sm text-[#292D2A] focus:outline-hidden focus:border-[#244536]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#292D2A]/70 mb-1">Starting Point</label>
                    <PlacesAutocompleteInput
                      placeholder="e.g. Florence, Italy"
                      value={newTripData.origin}
                      onChange={(val) => setNewTripData({ ...newTripData, origin: val })}
                      onPlaceSelect={(place) => setNewTripData({ ...newTripData, origin: place.name || place.address })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#292D2A]/70 mb-1">Destination</label>
                    <PlacesAutocompleteInput
                      placeholder="e.g. Siena, Italy"
                      value={newTripData.destination}
                      onChange={(val) => setNewTripData({ ...newTripData, destination: val })}
                      onPlaceSelect={(place) => setNewTripData({ ...newTripData, destination: place.name || place.address })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#292D2A]/70 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newTripData.startDate}
                      onChange={(e) => setNewTripData({ ...newTripData, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#244536]/20 text-sm text-[#292D2A] focus:outline-hidden focus:border-[#244536]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#292D2A]/70 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={newTripData.endDate}
                      onChange={(e) => setNewTripData({ ...newTripData, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#244536]/20 text-sm text-[#292D2A] focus:outline-hidden focus:border-[#244536]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#292D2A]/70 mb-1">Mode</label>
                    <select
                      value={newTripData.transportMode}
                      onChange={(e) => setNewTripData({ ...newTripData, transportMode: e.target.value as TravelMode })}
                      className="w-full px-3 py-2 rounded-lg border border-[#244536]/20 text-sm text-[#292D2A] focus:outline-hidden focus:border-[#244536] bg-white"
                    >
                      <option value="driving">Car (Road Trip)</option>
                      <option value="transit">Transit / Train</option>
                      <option value="bicycling">Bicycle</option>
                      <option value="walking">Walking</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#292D2A]/70 mb-1">Budget ($)</label>
                    <input
                      type="number"
                      value={newTripData.budgetTotal}
                      onChange={(e) => setNewTripData({ ...newTripData, budgetTotal: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-[#244536]/20 text-sm text-[#292D2A] focus:outline-hidden focus:border-[#244536]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#292D2A]/70 mb-1">Travelers</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={newTripData.travelersCount}
                      onChange={(e) => setNewTripData({ ...newTripData, travelersCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-[#244536]/20 text-sm text-[#292D2A] focus:outline-hidden focus:border-[#244536]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#244536]/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewTripModalOpen(false)}
                    className="text-xs font-mono uppercase"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#244536] text-white hover:bg-[#1a3328] text-xs font-mono uppercase tracking-wider"
                  >
                    Create & Open Workspace
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function MyTrips() {
  return (
    <ProtectedRoute>
      <MyTripsPage />
    </ProtectedRoute>
  );
}
