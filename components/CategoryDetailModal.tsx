'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, DollarSign, MapPin, Calendar, Plus, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CategoryDetails, SavedActivity, TravelPriority } from '@/types';
import { Button } from './ui/button';
import { generateId } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryDetails;
  onSaveActivity: (activity: SavedActivity) => void;
  savedActivityIds: string[];
}

export function CategoryDetailModal({ 
  isOpen, 
  onClose, 
  category, 
  onSaveActivity,
  savedActivityIds 
}: CategoryDetailModalProps) {
  const [selectedPriority, setSelectedPriority] = useState<TravelPriority>('must-visit');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const parseCost = (costString: string): number => {
    const match = costString.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const handleSavePlace = (place: typeof category.topPlaces[0]) => {
    const activityId = `${category.category}-${place.id}`;
    
    if (savedActivityIds.includes(activityId)) {
      toast.error('Already added to itinerary');
      return;
    }

    const activity: SavedActivity = {
      id: activityId,
      categoryId: category.category,
      category: category.category,
      placeName: place.name,
      estimatedCost: parseCost(place.estimatedCost),
      duration: place.duration,
      priority: selectedPriority,
      addedAt: new Date(), // This is fine - only called on client interaction
    };

    onSaveActivity(activity);
    toast.success(`Added ${place.name} to itinerary!`);
  };

  const getPriorityColor = (priority: TravelPriority) => {
    switch (priority) {
      case 'must-visit': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'nice-to-visit': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'skip': return 'bg-slate-500/20 text-slate-400 border-slate-500';
    }
  };

  const getPriorityLabel = (priority: TravelPriority) => {
    switch (priority) {
      case 'must-visit': return 'Must Visit';
      case 'nice-to-visit': return 'Nice to Visit';
      case 'skip': return 'Skip';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Header Image */}
            <div className="relative h-64 rounded-t-2xl overflow-hidden">
              <img
                src={category.imageUrl}
                alt={category.category}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h2 className="text-4xl font-bold text-white capitalize mb-2">
                  {category.category}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {category.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Why Popular */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Why Visit?</h3>
                <p className="text-slate-300 leading-relaxed">{category.whyPopular}</p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <DollarSign className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Estimated Cost</p>
                    <p className="text-white font-medium">{category.estimatedCost}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Best Time</p>
                    <p className="text-white font-medium">{category.bestTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <Clock className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Duration</p>
                    <p className="text-white font-medium">{category.recommendedDuration}</p>
                  </div>
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Set Priority</h3>
                <div className="flex gap-3">
                  {(['must-visit', 'nice-to-visit', 'skip'] as TravelPriority[]).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setSelectedPriority(priority)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedPriority === priority
                          ? getPriorityColor(priority)
                          : 'bg-slate-800/30 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {getPriorityLabel(priority)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Places */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Top 3 Recommended Places</h3>
                <div className="space-y-4">
                  {category.topPlaces.map((place, index) => {
                    const activityId = `${category.category}-${place.id}`;
                    const isAdded = savedActivityIds.includes(activityId);
                    
                    return (
                      <motion.div
                        key={place.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-semibold">
                                {index + 1}
                              </span>
                              <h4 className="text-lg font-semibold text-white">{place.name}</h4>
                            </div>
                            <p className="text-slate-300 mb-3">{place.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1 text-slate-400">
                                <DollarSign className="w-4 h-4" />
                                <span>{place.estimatedCost}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span>{place.duration}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleSavePlace(place)}
                            disabled={isAdded}
                            size="sm"
                            className={isAdded ? 'bg-green-600 hover:bg-green-600' : ''}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Added
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
