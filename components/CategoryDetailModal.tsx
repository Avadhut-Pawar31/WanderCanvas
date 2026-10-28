'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, Plus, Check, Coins } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CategoryDetails, SavedActivity, TravelPriority } from '@/types';
import { Button } from './ui/button';
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
    const match = costString.match(/(?:[\$₹€£¥]|INR\s*)(\d+)/i) || costString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const renderCurrencyIcon = (costText: string, sizeClass = "w-4 h-4") => {
    if (costText.includes('₹') || costText.includes('INR')) {
      return <span className={`${sizeClass} font-bold text-[#C78363] inline-flex items-center justify-center text-xs leading-none`}>₹</span>;
    }
    if (costText.includes('€') || costText.includes('EUR')) {
      return <span className={`${sizeClass} font-bold text-[#C78363] inline-flex items-center justify-center text-xs leading-none`}>€</span>;
    }
    if (costText.includes('¥') || costText.includes('JPY')) {
      return <span className={`${sizeClass} font-bold text-[#C78363] inline-flex items-center justify-center text-xs leading-none`}>¥</span>;
    }
    if (costText.includes('£') || costText.includes('GBP')) {
      return <span className={`${sizeClass} font-bold text-[#C78363] inline-flex items-center justify-center text-xs leading-none`}>£</span>;
    }
    if (costText.includes('$') || costText.includes('USD')) {
      return <span className={`${sizeClass} font-bold text-[#C78363] inline-flex items-center justify-center text-xs leading-none`}>$</span>;
    }
    return <Coins className={`${sizeClass} text-[#C78363]`} />;
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
      addedAt: new Date(),
    };

    onSaveActivity(activity);
    toast.success(`Added ${place.name} to itinerary!`);
  };

  const getPriorityColor = (priority: TravelPriority) => {
    switch (priority) {
      case 'must-visit':
        return 'bg-[#244536] text-white border-[#244536]';
      case 'nice-to-visit':
        return 'bg-[#C78363] text-white border-[#C78363]';
      case 'skip':
        return 'bg-[#292D2A]/10 text-[#292D2A] border-[#292D2A]/20';
    }
  };

  const getPriorityLabel = (priority: TravelPriority) => {
    switch (priority) {
      case 'must-visit': return 'Must Visit';
      case 'nice-to-visit': return 'Nice to Visit';
      case 'skip': return 'Optional / Skip';
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-white rounded-3xl shadow-2xl border border-[#244536]/15 my-8 overflow-hidden text-[#292D2A]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-[#292D2A] hover:bg-white shadow-md transition-colors z-10"
            >
              <X className="w-4 h-4 text-[#244536]" />
            </button>

            {/* Header Image */}
            <div className="relative h-60 bg-[#E7ECE5] overflow-hidden">
              <img
                src={category.imageUrl}
                alt={category.category}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-3xl font-serif font-bold text-white capitalize mb-2">
                  {category.category}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {category.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 bg-white/90 text-[#244536] rounded-md text-[11px] font-mono uppercase font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Why Popular */}
              <div>
                <h3 className="text-base font-serif font-bold text-[#244536] mb-1.5">
                  Why Experience This?
                </h3>
                <p className="text-xs text-[#292D2A]/75 leading-relaxed font-sans">
                  {category.whyPopular}
                </p>
              </div>

              {/* Quick Info Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 p-3.5 bg-[#F7F5EF] rounded-2xl border border-[#244536]/10">
                  <div className="mt-0.5">{renderCurrencyIcon(category.estimatedCost, 'w-4 h-4')}</div>
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#292D2A]/50">Est. Cost</p>
                    <p className="text-sm font-semibold text-[#244536]">{category.estimatedCost}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 bg-[#F7F5EF] rounded-2xl border border-[#244536]/10">
                  <Calendar className="w-4 h-4 text-[#244536] mt-0.5" />
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#292D2A]/50">Best Time</p>
                    <p className="text-sm font-semibold text-[#244536]">{category.bestTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 bg-[#F7F5EF] rounded-2xl border border-[#244536]/10">
                  <Clock className="w-4 h-4 text-[#244536] mt-0.5" />
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#292D2A]/50">Recommended</p>
                    <p className="text-sm font-semibold text-[#244536]">{category.recommendedDuration}</p>
                  </div>
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold mb-2.5">
                  Set Itinerary Priority
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(['must-visit', 'nice-to-visit', 'skip'] as TravelPriority[]).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setSelectedPriority(priority)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedPriority === priority
                          ? getPriorityColor(priority)
                          : 'bg-white text-[#292D2A]/70 border-[#244536]/15 hover:bg-[#F7F5EF]'
                      }`}
                    >
                      {getPriorityLabel(priority)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Places */}
              <div>
                <h3 className="text-base font-serif font-bold text-[#244536] mb-3">
                  Top Recommended Locations
                </h3>
                <div className="space-y-3">
                  {category.topPlaces.map((place, index) => {
                    const activityId = `${category.category}-${place.id}`;
                    const isAdded = savedActivityIds.includes(activityId);
                    
                    return (
                      <div
                        key={place.id}
                        className="p-4 bg-[#F7F5EF]/60 rounded-2xl border border-[#244536]/10 hover:border-[#244536]/25 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#244536] text-[#F7F5EF] text-[11px] font-mono font-bold">
                                {index + 1}
                              </span>
                              <h4 className="text-sm font-serif font-bold text-[#292D2A]">{place.name}</h4>
                            </div>
                            <p className="text-xs text-[#292D2A]/70 mb-2 leading-relaxed">{place.description}</p>
                            <div className="flex flex-wrap gap-3 text-xs font-mono text-[#292D2A]/60">
                              <div className="flex items-center gap-1.5">
                                {renderCurrencyIcon(place.estimatedCost, 'w-3.5 h-3.5')}
                                <span>{place.estimatedCost}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#244536]" />
                                <span>{place.duration}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleSavePlace(place)}
                            disabled={isAdded}
                            size="sm"
                            className={`rounded-xl text-xs font-medium h-8 px-3 shadow-xs ${
                              isAdded 
                                ? 'bg-[#244536]/15 text-[#244536] hover:bg-[#244536]/15' 
                                : 'bg-[#244536] text-white hover:bg-[#1B3529]'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Added
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
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
