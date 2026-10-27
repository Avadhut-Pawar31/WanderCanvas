'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, DollarSign, Clock, TrendingUp, Award, Zap } from 'lucide-react';
import { SavedActivity, TravelPriority } from '@/types';

interface ItinerarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activities: SavedActivity[];
  onRemoveActivity: (activityId: string) => void;
  onUpdatePriority: (activityId: string, priority: TravelPriority) => void;
  totalBudget: number;
}

export function ItinerarySidebar({
  isOpen,
  onClose,
  activities,
  onRemoveActivity,
  totalBudget,
}: ItinerarySidebarProps) {
  const recommendedExperiences = 10;
  const plannedExperiences = activities.length;
  const progressScore = Math.min((plannedExperiences / recommendedExperiences) * 100, 100);

  // Calculate stats
  const categoryCounts = activities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopularCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  const adventureCategories = ['adventure', 'beaches', 'nature'];
  const adventureScore = Math.min(
    (activities.filter(a => adventureCategories.includes(a.category)).length / (activities.length || 1)) * 100,
    100
  ) || 0;

  const estimatedDays = Math.max(1, Math.ceil(activities.length / 3));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-[#F7F5EF] border-l border-[#244536]/15 z-50 overflow-y-auto text-[#292D2A] shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#244536]/10 p-6 z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#244536]">Curated Itinerary</h2>
                  <p className="text-xs text-[#292D2A]/60 font-mono">Personal Trip Canvas</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white border border-[#244536]/10 text-[#292D2A] hover:bg-[#244536]/5 transition-colors"
                >
                  <X className="w-4 h-4 text-[#244536]" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-white rounded-xl border border-[#244536]/10 text-center shadow-xs">
                  <p className="text-[11px] font-mono uppercase text-[#292D2A]/50 mb-0.5">Activities</p>
                  <p className="text-lg font-serif font-bold text-[#244536]">{plannedExperiences}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#244536]/10 text-center shadow-xs">
                  <p className="text-[11px] font-mono uppercase text-[#292D2A]/50 mb-0.5">Budget</p>
                  <p className="text-lg font-serif font-bold text-[#C78363]">${totalBudget}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#244536]/10 text-center shadow-xs">
                  <p className="text-[11px] font-mono uppercase text-[#292D2A]/50 mb-0.5">Est. Pace</p>
                  <p className="text-lg font-serif font-bold text-[#244536]">{estimatedDays} Days</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Progress Card */}
              <div className="p-4 bg-white rounded-2xl border border-[#244536]/10 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold">Itinerary Depth</span>
                  <span className="text-sm font-serif font-bold text-[#244536]">{Math.round(progressScore)}%</span>
                </div>
                <div className="w-full h-2 bg-[#F7F5EF] border border-[#244536]/10 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressScore}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-[#244536] rounded-full"
                  />
                </div>
                <p className="text-xs text-[#292D2A]/70">
                  {plannedExperiences} of {recommendedExperiences} recommended experiences selected.
                </p>
              </div>

              {/* Insights */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono uppercase tracking-wider font-semibold text-[#244536] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#C78363]" />
                  <span>Curation Insights</span>
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-[#244536]/10 shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs text-[#292D2A]/60 mb-0.5">
                      <Award className="w-3.5 h-3.5 text-[#C78363]" />
                      <span>Focus</span>
                    </div>
                    <p className="text-xs font-serif font-bold text-[#244536] capitalize truncate">{mostPopularCategory}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#244536]/10 shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs text-[#292D2A]/60 mb-0.5">
                      <Zap className="w-3.5 h-3.5 text-[#244536]" />
                      <span>Adventure</span>
                    </div>
                    <p className="text-xs font-serif font-bold text-[#244536]">{Math.round(adventureScore)}% Score</p>
                  </div>
                </div>
              </div>

              {/* Activity Cards List */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono uppercase tracking-wider font-semibold text-[#244536]">
                  Planned Stops & Activities ({activities.length})
                </h3>

                {activities.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 text-center border border-[#244536]/10 space-y-2">
                    <p className="text-xs text-[#292D2A]/70">No activities added yet.</p>
                    <p className="text-[11px] text-[#292D2A]/50">Click any card on the mood board to explore and save activities.</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 bg-white rounded-2xl border border-[#244536]/10 shadow-xs space-y-2 hover:border-[#244536]/25 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-serif font-bold text-sm text-[#292D2A]">{activity.title}</h4>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#244536] px-2 py-0.5 bg-[#244536]/8 rounded-md inline-block mt-1">
                            {activity.category}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveActivity(activity.id)}
                          className="p-1.5 text-[#292D2A]/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-[#292D2A]/70 line-clamp-2 leading-relaxed">
                        {activity.description}
                      </p>

                      <div className="flex items-center justify-between text-xs font-mono text-[#292D2A]/60 pt-2 border-t border-[#244536]/8">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-[#C78363]" />
                          <span>${activity.estimatedCost}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#244536]" />
                          <span>{activity.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
