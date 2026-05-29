'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, DollarSign, Clock, TrendingUp, Award, Users, Zap, Lightbulb } from 'lucide-react';
import { SavedActivity, TravelPriority } from '@/types';
import { Button } from './ui/button';

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
  onUpdatePriority,
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
  
  const budgetFriendlyActivities = activities.filter(a => a.estimatedCost < 30);
  const budgetFriendlyCategory = budgetFriendlyActivities.length > 0 
    ? budgetFriendlyActivities[0].category 
    : 'cafes';

  const familyFriendlyCategories = ['nature', 'beaches', 'culture'];
  const familyFriendlyCount = activities.filter(a => 
    familyFriendlyCategories.includes(a.category)
  ).length;
  const familyFriendlyCategory = familyFriendlyCount > 0 ? 'nature' : 'beaches';

  const adventureCategories = ['adventure', 'beaches', 'nature'];
  const adventureScore = Math.min(
    (activities.filter(a => adventureCategories.includes(a.category)).length / activities.length) * 100,
    100
  ) || 0;

  // AI Recommendations
  const getRecommendations = (): string[] => {
    const recommendations: string[] = [];
    
    if (categoryCounts['food'] && categoryCounts['cafes']) {
      recommendations.push("Since you selected Food and Cafes, you may also enjoy Culture.");
    }
    if (categoryCounts['adventure'] && !categoryCounts['nature']) {
      recommendations.push("Adventure lovers often enjoy Nature experiences too!");
    }
    if (categoryCounts['beaches'] && !categoryCounts['nightlife']) {
      recommendations.push("Beach days pair perfectly with evening Nightlife activities.");
    }
    if (activities.length < 5) {
      recommendations.push("Consider adding more activities to make the most of your trip!");
    }
    if (totalBudget < 200) {
      recommendations.push("Great budget planning! You have room for spontaneous experiences.");
    }
    if (!categoryCounts['culture']) {
      recommendations.push("Don't miss the local Culture - it's what makes this destination unique!");
    }

    return recommendations.slice(0, 3);
  };

  const getPriorityColor = (priority: TravelPriority) => {
    switch (priority) {
      case 'must-visit': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'nice-to-visit': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'skip': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getPriorityLabel = (priority: TravelPriority) => {
    switch (priority) {
      case 'must-visit': return 'Must';
      case 'nice-to-visit': return 'Nice';
      case 'skip': return 'Skip';
    }
  };

  const estimatedDays = Math.ceil(activities.length / 3);

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700 p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">My Itinerary</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Activities</p>
                  <p className="text-xl font-bold text-white">{plannedExperiences}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Budget</p>
                  <p className="text-xl font-bold text-green-400">${totalBudget}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Est. Days</p>
                  <p className="text-xl font-bold text-blue-400">{estimatedDays}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Progress Score */}
              <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">Trip Progress</h3>
                  <span className="text-2xl font-bold text-indigo-400">{Math.round(progressScore)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressScore}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  You have planned {plannedExperiences} of {recommendedExperiences} recommended experiences.
                </p>
              </div>

              {/* Travel Insights */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Travel Insights
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <p className="text-xs text-slate-400">Most Popular</p>
                    </div>
                    <p className="text-sm font-semibold text-white capitalize">{mostPopularCategory}</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <p className="text-xs text-slate-400">Budget-Friendly</p>
                    </div>
                    <p className="text-sm font-semibold text-white capitalize">{budgetFriendlyCategory}</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      <p className="text-xs text-slate-400">Family-Friendly</p>
                    </div>
                    <p className="text-sm font-semibold text-white capitalize">{familyFriendlyCategory}</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-orange-400" />
                      <p className="text-xs text-slate-400">Adventure Score</p>
                    </div>
                    <p className="text-sm font-semibold text-white">{Math.round(adventureScore)}%</p>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              {getRecommendations().length > 0 && (
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    AI Recommendations
                  </h3>
                  <div className="space-y-2">
                    {getRecommendations().map((rec, index) => (
                      <p key={index} className="text-xs text-slate-300 leading-relaxed">
                        • {rec}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities List */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Saved Activities</h3>
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 mb-2">No activities added yet</p>
                    <p className="text-sm text-slate-500">Click on mood board categories to add activities</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded capitalize">
                                {activity.category}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(activity.priority)}`}>
                                {getPriorityLabel(activity.priority)}
                              </span>
                            </div>
                            <h4 className="text-white font-medium mb-2">{activity.placeName}</h4>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span>${activity.estimatedCost}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{activity.duration}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => onRemoveActivity(activity.id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
