'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TripWorkspaceView } from '@/components/workspace/TripWorkspaceView';
import { CollaborationService } from '@/services/collaborationService';
import { CollaborativeTrip } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TripWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const tripId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const { user } = useAuthStore();

  const [trip, setTrip] = useState<CollaborativeTrip | null>(() => {
    if (!tripId) return null;
    const found = CollaborationService.getTripById(tripId);
    if (found) return found;
    if (tripId === 'trip-amalfi-classic' || tripId === 'demo') {
      return CollaborationService.getTripById('trip-amalfi-classic');
    }
    return null;
  });

  useEffect(() => {
    if (!tripId) return;

    // Subscribe to real-time collaboration updates
    const unsubscribe = CollaborationService.subscribeToUpdates((event) => {
      const payload = event.payload as { tripId?: string; id?: string } | undefined;
      if (payload && (payload.tripId === tripId || payload.id === tripId)) {
        const updated = CollaborationService.getTripById(tripId);
        if (updated) setTrip(updated);
      }
    });

    return () => unsubscribe();
  }, [tripId]);

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#244536]/10 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-[#292D2A]">Trip Not Found</h2>
            <p className="text-sm text-[#292D2A]/70 mt-1">
              Trip &quot;{tripId}&quot; could not be loaded or has expired.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              onClick={() => router.push('/workspace/trip-amalfi-classic')}
              className="bg-[#244536] text-white hover:bg-[#1a3328] w-full py-2.5 rounded-lg text-sm font-medium transition"
            >
              Open Amalfi Coast Demo Trip
            </Button>
            <Link
              href="/my-trips"
              className="text-xs font-mono uppercase tracking-wider text-[#244536]/80 hover:text-[#244536] py-2"
            >
              &larr; Return to My Trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine active traveler member
  const activeUser = user
    ? {
        id: user.id || 'user-me',
        name: user.name || 'Traveler',
        email: user.email || 'traveler@wandercanvas.com',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      }
    : {
        id: 'traveler-guest',
        name: 'You (Explorer)',
        email: 'explorer@wandercanvas.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
      };

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col">
      {/* Top Workspace Bar */}
      <header className="h-14 border-b border-[#244536]/10 bg-white/95 backdrop-blur px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <Link
            href="/my-trips"
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#244536]/70 hover:text-[#244536] transition px-2.5 py-1.5 rounded-md hover:bg-[#F7F5EF]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trips</span>
          </Link>

          <span className="text-[#244536]/20">/</span>

          <div className="flex items-center gap-2">
            <span className="font-serif font-medium text-sm text-[#292D2A] truncate max-w-[200px] sm:max-w-[320px]">
              {trip.name}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#244536]/10 text-[#244536]">
              <Sparkles className="w-3 h-3 text-[#C78363]" />
              Hygiene-Aware Corridor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#292D2A]/70">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px]">Synced Workspace</span>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-[#244536]/10">
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              className="w-7 h-7 rounded-full object-cover border border-[#244536]/20"
            />
            <span className="text-xs font-medium text-[#292D2A] hidden sm:inline">
              {activeUser.name}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Mount */}
      <main className="flex-1 flex flex-col">
        <TripWorkspaceView initialTrip={trip} currentUser={activeUser} />
      </main>
    </div>
  );
}
