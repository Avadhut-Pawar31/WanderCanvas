'use client';

import { CollaborativeTrip, Place } from '@/types';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { HygieneService } from '@/services/hygieneService';

interface SharedItineraryPanelProps {
  trip: CollaborativeTrip;
  currentUserId: string;
  currentUserName?: string;
  userRole: 'owner' | 'editor' | 'viewer';
  onVoteSuggestion: (suggestionId: string, vote: 1 | -1) => void;
  onRemoveStop: (stopId: string) => void;
  onSelectPlaceForInspection?: (place: Place) => void;
  onOpenDiscovery?: () => void;
}

export function SharedItineraryPanel({
  trip,
  currentUserId,
  userRole,
  onVoteSuggestion,
  onRemoveStop,
  onSelectPlaceForInspection,
  onOpenDiscovery,
}: SharedItineraryPanelProps) {
  const isViewer = userRole === 'viewer';

  return (
    <div className="space-y-8">
      {/* 1. CONFIRMED ROUTE SEQUENCE */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl font-medium text-[#244536]">
              Planned Route Itinerary
            </h3>
            <p className="text-xs text-[#5F6761] mt-0.5">
              {trip.stops.length + 2} total points along {trip.origin} → {trip.destination}
            </p>
          </div>

          {!isViewer && onOpenDiscovery && (
            <button
              onClick={onOpenDiscovery}
              className="px-3.5 py-2 rounded-xl bg-[#244536] text-white text-xs font-medium hover:bg-[#1B3529] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Discover Corridor Stops</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {/* Origin Point Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#244536]/15 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#244536] text-white flex items-center justify-center font-bold text-xs ring-4 ring-[#244536]/15">
                A
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C78363]">
                  Trip Departure
                </span>
                <h4 className="font-serif text-base font-medium text-[#244536]">
                  {trip.origin}
                </h4>
              </div>
            </div>
            <span className="text-xs text-[#5F6761] bg-[#F7F5EF] px-2.5 py-1 rounded-md border border-[#244536]/10">
              08:00 AM Departure
            </span>
          </div>

          {/* Sequential Intermediate Stops */}
          {trip.stops.map((stop, idx) => (
            <div key={stop.id} className="relative">
              {/* Connector line */}
              <div className="w-0.5 h-4 bg-[#244536]/20 mx-auto" />

              <div className="p-4 rounded-2xl bg-white border border-[#244536]/15 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0F3EF] text-[#244536] border border-[#244536]/25 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C78363]">
                        Stop {idx + 1} · {stop.category || 'Corridor Pause'}
                      </span>
                      {stop.detourMinutes !== undefined && (
                        <span className="text-[10px] text-[#5F6761]">
                          (+{stop.detourKm || 0.8} km detour)
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-base font-medium text-[#244536]">
                      {stop.name}
                    </h4>
                    <p className="text-xs text-[#5F6761] line-clamp-1">
                      {stop.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5F6761] bg-[#F7F5EF] px-2.5 py-1 rounded-md border border-[#244536]/10 hidden sm:inline-block">
                    {stop.suggestedBy ? `Added by ${stop.suggestedBy}` : 'Planned Stop'}
                  </span>
                  {!isViewer && (
                    <button
                      onClick={() => onRemoveStop(stop.id)}
                      className="p-2 text-[#5F6761] hover:text-red-600 transition-colors"
                      title="Remove stop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Connector line before destination */}
          <div className="w-0.5 h-4 bg-[#244536]/20 mx-auto" />

          {/* Destination Point Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#244536]/15 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C78363] text-white flex items-center justify-center font-bold text-xs ring-4 ring-[#C78363]/25">
                B
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C78363]">
                  Trip Destination
                </span>
                <h4 className="font-serif text-base font-medium text-[#244536]">
                  {trip.destination}
                </h4>
              </div>
            </div>
            <span className="text-xs text-[#5F6761] bg-[#F7F5EF] px-2.5 py-1 rounded-md border border-[#244536]/10">
              Arrival Destination
            </span>
          </div>
        </div>
      </div>

      {/* 2. COLLABORATIVE CANDIDATE SUGGESTIONS & VOTING */}
      <div className="pt-6 border-t border-[#244536]/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl font-medium text-[#244536] flex items-center gap-2">
              <span>Proposed Stops &amp; Group Voting</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0F3EF] text-[#244536] font-sans font-semibold">
                {trip.suggestions.length}
              </span>
            </h3>
            <p className="text-xs text-[#5F6761] mt-0.5">
              Team proposals require positive group consensus (+2 net upvotes) to be added to the live route itinerary.
            </p>
          </div>
        </div>

        {trip.suggestions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#F7F5EF] border border-[#244536]/10 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-[#C78363] mx-auto opacity-70" />
            <p className="text-xs font-semibold text-[#244536]">No pending suggestions</p>
            <p className="text-xs text-[#5F6761] max-w-sm mx-auto">
              Any member can explore the route map, select candidate restaurants or washrooms, and propose them for group voting.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trip.suggestions.map((suggestion) => {
              const netVotes = suggestion.votes.reduce((acc, v) => acc + v.vote, 0);
              const userVote = suggestion.votes.find(v => v.userId === currentUserId)?.vote;
              const isAccepted = suggestion.status === 'accepted';
              const badge = HygieneService.getStatusBadge(suggestion.place.hygieneStatus);

              return (
                <div
                  key={suggestion.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isAccepted
                      ? 'bg-[#E7ECE5]/50 border-[#244536]/25'
                      : 'bg-white border-[#244536]/15 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#F0F3EF] text-[#244536] font-medium capitalize">
                          {suggestion.place.category}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badge.color}`}>
                          {badge.shortLabel}
                        </span>
                        {suggestion.place.hygieneScore && (
                          <span className="text-xs font-bold text-[#244536]">
                            Score: {suggestion.place.hygieneScore}/100
                          </span>
                        )}
                      </div>

                      <h4 
                        onClick={() => onSelectPlaceForInspection && onSelectPlaceForInspection(suggestion.place)}
                        className="font-serif text-base font-medium text-[#244536] hover:text-[#C78363] cursor-pointer"
                      >
                        {suggestion.place.name}
                      </h4>
                      <p className="text-xs text-[#5F6761] line-clamp-1">
                        {suggestion.place.address}
                      </p>
                    </div>

                    {isAccepted ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#244536] bg-[#E7ECE5] px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onVoteSuggestion(suggestion.id, 1)}
                          disabled={isViewer}
                          className={`p-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 ${
                            userVote === 1
                              ? 'bg-[#244536] text-white shadow-xs'
                              : 'bg-[#F7F5EF] text-[#5F6761] hover:bg-[#E7ECE5] hover:text-[#244536]'
                          }`}
                          title="Upvote suggestion"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#244536]">
                          {netVotes > 0 ? `+${netVotes}` : netVotes}
                        </span>
                        <button
                          onClick={() => onVoteSuggestion(suggestion.id, -1)}
                          disabled={isViewer}
                          className={`p-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 ${
                            userVote === -1
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-[#F7F5EF] text-[#5F6761] hover:bg-red-50 hover:text-red-700'
                          }`}
                          title="Downvote suggestion"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#5F6761] italic border-t border-[#244536]/8 pt-2 mt-2">
                    &quot;{suggestion.reason}&quot; — <span className="font-semibold not-italic text-[#244536]">{suggestion.suggestedByName}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
