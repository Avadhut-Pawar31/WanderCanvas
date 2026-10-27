'use client';

import { useState } from 'react';
import { CollaborativeTrip, Place } from '@/types';
import { AIAssistantService, AIItineraryPlan } from '@/services/aiAssistantService';
import { MapRouteService } from '@/services/mapRouteService';
import { Sparkles, Loader2, Send, Bot, User, CheckCircle2, ShieldCheck, Compass } from 'lucide-react';
import toast from 'react-hot-toast';

interface AITravelAssistantPanelProps {
  trip: CollaborativeTrip;
  candidatePlaces?: Place[];
  onAddStop: (place: Place) => void;
  onSuggestStop: (place: Place, reason?: string) => void;
  onInspectPlace?: (place: Place) => void;
}

interface ConciergeMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  provider?: string;
  timestamp: string;
}

export function AITravelAssistantPanel({
  trip,
  candidatePlaces,
  onAddStop,
  onSuggestStop,
  onInspectPlace,
}: AITravelAssistantPanelProps) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AIItineraryPlan | null>(null);
  const [focusCategory, setFocusCategory] = useState<'all' | 'washroom' | 'hotel' | 'restaurant'>('all');
  const [maxDetourMinutes, setMaxDetourMinutes] = useState<number>(15);
  const [requireVerified, setRequireVerified] = useState<boolean>(true);

  // Concierge Interactive Chat State
  const [chatInput, setChatInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState<ConciergeMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your WanderCanvas AI Travel Concierge. I can help you find verified clean rest stops, scenic coffee pauses, and accessible facilities along your route from **${trip.origin}** to **${trip.destination}**. What would you like to plan?`,
      provider: 'WanderCanvas AI Concierge',
      timestamp: 'Just now',
    },
  ]);

  const handleAskConcierge = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: ConciergeMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: promptText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAsking(true);

    try {
      const resolvedPlaces =
        candidatePlaces && candidatePlaces.length > 0
          ? candidatePlaces
          : trip.route
          ? MapRouteService.findStopsAlongRoute(trip.route, { category: 'all' })
          : [];

      const res = await AIAssistantService.askConcierge({
        trip,
        prompt: promptText.trim(),
        candidatePlaces: resolvedPlaces,
      });

      const assistantMsg: ConciergeMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        provider: res.provider,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      toast.error('Could not reach the concierge service.');
    } finally {
      setIsAsking(false);
    }
  };

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
    <div className="space-y-6">
      {/* 1. Interactive AI Concierge Conversation Box */}
      <div className="bg-white rounded-3xl border border-[#244536]/15 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#244536]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#244536]/10 flex items-center justify-center text-[#244536]">
              <Sparkles className="w-5 h-5 text-[#C78363]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-[#244536]">
                AI Travel Concierge
              </h3>
              <p className="text-xs text-[#5F6761]">
                Ask questions or request route stops with verified cleanliness standards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#244536] animate-pulse" />
            <span className="text-[11px] font-mono text-[#244536]">
              100% Free AI Assistance
            </span>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-[#244536] text-white flex items-center justify-center shrink-0 text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#244536] text-white rounded-tr-none'
                    : 'bg-[#F7F5EF] text-[#292D2A] border border-[#244536]/10 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className="mt-1 flex items-center justify-between gap-2 text-[10px] opacity-60">
                  <span>{msg.provider || ''}</span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-[#C78363] text-white flex items-center justify-center shrink-0 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isAsking && (
            <div className="flex items-center gap-2 text-xs text-[#5F6761] italic">
              <Loader2 className="w-4 h-4 animate-spin text-[#244536]" />
              <span>Concierge is evaluating route detours and hygiene scores...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[10px] font-mono uppercase text-[#5F6761]/70 mr-1">Quick prompts:</span>
          {[
            '🚻 Cleanest restrooms (< 5 min detour)',
            '☕ Scenic coffee & pastry stop',
            '♿ Step-free accessible facilities',
            '🌅 Sunset view terrace with dining',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleAskConcierge(chip)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#F0F3EF] hover:bg-[#244536] hover:text-white text-[#244536] transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskConcierge(chatInput);
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask your concierge e.g., 'What is the best lunch stop with clean washrooms?'..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#244536]/20 text-xs text-[#292D2A] placeholder:text-[#5F6761]/60 focus:outline-hidden focus:border-[#244536]"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isAsking}
            className="px-4 py-2.5 rounded-xl bg-[#244536] text-white text-xs font-medium hover:bg-[#1B3529] disabled:opacity-50 transition flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 2. Structured Route Plan Generator & Grounded Cards */}
      <div className="bg-white rounded-3xl border border-[#244536]/15 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#244536]/10">
          <div>
            <h4 className="font-serif text-lg font-medium text-[#244536]">
              Corridor Stop Curation
            </h4>
            <p className="text-xs text-[#5F6761]">
              Cross-checked against municipal sanitation and verified inspection logs.
            </p>
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
              Let the assistant evaluate stops along <span className="font-semibold text-[#244536]">{trip.origin} → {trip.destination}</span>, considering detour times, running water, soap supplies, and hygiene verification status.
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
    </div>
  );
}
