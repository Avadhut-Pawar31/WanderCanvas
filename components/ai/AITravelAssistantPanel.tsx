'use client';

import { useState } from 'react';
import { CollaborativeTrip, Place } from '@/types';
import { AIAssistantService, AIItineraryPlan } from '@/services/aiAssistantService';
import { Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AITravelAssistantPanelProps {
  trip: CollaborativeTrip;
  onAddStop: (place: Place) => void;
  onSuggestStop: (place: Place, reason?: string) => void;
  onInspectPlace?: (place: Place) => void;
}

export function AITravelAssistantPanel({
  trip,
  onAddStop,
  onSuggestStop,
  onInspectPlace,
}: AITravelAssistantPanelProps) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AIItineraryPlan | null>(null);
  const [focusCategory, setFocusCategory] = useState<'all' | 'washroom' | 'hotel' | 'restaurant'>('all');
  const [maxDetourMinutes, setMaxDetourMinutes] = useState<number>(15);
  const [requireVerified, setRequireVerified] = useState<boolean>(true);

  const handleGeneratePlan = async (category: 'all' | 'washroom' | 'hotel' | 'restaurant' = focusCategory) => {
    setLoading(true);
    try {
      const result = await AIAssistantService.generateRouteRecommendations({
        trip,
        focusCategory: category,
        maxDetourMinutes,
        requireVerifiedHygiene: requireVerified,
      });
      setPlan(result);
      toast.success('Curated route plan updated with verified hygiene data!');
    } catch {
      toast.error('Failed to generate assistant recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#244536]/15 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#244536]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E7ECE5] flex items-center justify-center text-[#244536]">
            <Sparkles className="w-5 h-5 text-[#C78363]" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-medium text-[#244536]">
              AI Route &amp; Hygiene Assistant
            </h3>
            <p className="text-xs text-[#5F6761]">
              Grounded in actual route geometry and verified on-site inspection logs.
            </p>
          </div>
        </div>

        {/* Quick Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setFocusCategory('all');
              handleGeneratePlan('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              focusCategory === 'all'
                ? 'bg-[#244536] text-white'
                : 'bg-[#F7F5EF] text-[#5F6761] hover:text-[#244536]'
            }`}
          >
            All Stops
          </button>
          <button
            onClick={() => {
              setFocusCategory('washroom');
              handleGeneratePlan('washroom');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              focusCategory === 'washroom'
                ? 'bg-[#244536] text-white'
                : 'bg-[#F7F5EF] text-[#5F6761] hover:text-[#244536]'
            }`}
          >
            🚻 Clean Washrooms
          </button>
          <button
            onClick={() => {
              setFocusCategory('restaurant');
              handleGeneratePlan('restaurant');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              focusCategory === 'restaurant'
                ? 'bg-[#244536] text-white'
                : 'bg-[#F7F5EF] text-[#5F6761] hover:text-[#244536]'
            }`}
          >
            🍽️ Dining
          </button>
          <button
            onClick={() => {
              setFocusCategory('hotel');
              handleGeneratePlan('hotel');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              focusCategory === 'hotel'
                ? 'bg-[#244536] text-white'
                : 'bg-[#F7F5EF] text-[#5F6761] hover:text-[#244536]'
            }`}
          >
            🏨 Hotels
          </button>
        </div>
      </div>

      {/* Trigger Button if not generated yet */}
      {!plan && !loading && (
        <div className="p-8 rounded-2xl bg-[#F7F5EF] border border-[#244536]/10 text-center space-y-4">
          <p className="text-xs text-[#5F6761] max-w-md mx-auto leading-relaxed">
            Let the WanderCanvas assistant evaluate stops along <span className="font-semibold text-[#244536]">{trip.origin} → {trip.destination}</span>, considering detour times, water/soap supplies, and hygiene verification standards.
          </p>
          <button
            onClick={() => handleGeneratePlan('all')}
            className="px-6 py-2.5 rounded-xl bg-[#244536] text-white text-xs font-medium hover:bg-[#1B3529] transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#C78363]" />
            <span>Generate Route &amp; Hygiene Plan</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#244536] animate-spin mx-auto" />
          <p className="text-xs text-[#5F6761]">
            Analyzing corridor geometry, calculating detour minutes, and auditing verified hygiene records...
          </p>
        </div>
      )}

      {/* Generated Recommendations Plan */}
      {plan && !loading && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="p-4 rounded-2xl bg-[#F0F3EF] border border-[#244536]/10 space-y-2">
            <h4 className="font-serif text-base font-medium text-[#244536]">
              {plan.headline}
            </h4>
            <p className="text-xs text-[#5F6761] leading-relaxed">
              {plan.summary}
            </p>
            <div className="pt-2 border-t border-[#244536]/10 flex flex-wrap items-center gap-4 text-[11px] text-[#244536]">
              <span>💡 {plan.pacingNote}</span>
            </div>
          </div>

          {/* Recommended Stop Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.recommendedStops.map((rec) => (
              <div
                key={rec.place.id}
                className="p-5 rounded-2xl bg-white border border-[#244536]/15 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#244536]/30 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#F0F3EF] text-[#244536] font-medium capitalize">
                      {rec.place.category}
                    </span>
                    <span className="text-xs font-bold text-[#244536] bg-[#E7ECE5] px-2 py-0.5 rounded">
                      Suitability: {rec.suitabilityScore}%
                    </span>
                  </div>

                  <h5 
                    onClick={() => onInspectPlace && onInspectPlace(rec.place)}
                    className="font-serif text-base font-medium text-[#244536] hover:text-[#C78363] cursor-pointer"
                  >
                    {rec.place.name}
                  </h5>
                  <p className="text-xs text-[#5F6761] line-clamp-1 mt-0.5">
                    {rec.place.address}
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-[#292D2A]">
                    <p className="line-clamp-2 italic text-[#5F6761]">
                      &quot;{rec.rationale}&quot;
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#5F6761]">
                      <span className="text-[#C78363] font-medium">{rec.detourSummary}</span>
                      <span>•</span>
                      <span className="text-[#244536] font-medium">{rec.hygieneSummary}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#244536]/10 flex items-center justify-between">
                  <button
                    onClick={() => onInspectPlace && onInspectPlace(rec.place)}
                    className="text-xs text-[#5F6761] hover:text-[#244536] font-medium"
                  >
                    View Hygiene Logs
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSuggestStop(rec.place, rec.rationale);
                        toast.success(`Proposed ${rec.place.name} for group voting!`);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#C78363] text-[#C78363] hover:bg-[#C78363]/10 text-xs font-medium transition-colors"
                    >
                      Propose to Group
                    </button>
                    <button
                      onClick={() => {
                        onAddStop(rec.place);
                        toast.success(`Added ${rec.place.name} to route itinerary!`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#244536] text-white hover:bg-[#1B3529] text-xs font-medium transition-colors"
                    >
                      Add to Route
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
