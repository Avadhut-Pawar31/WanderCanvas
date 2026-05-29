'use client';

import { motion } from 'framer-motion';
import { MoodBoardImage, CategoryDetails, SavedActivity } from '@/types';
import { useState } from 'react';
import { CategoryDetailModal } from './CategoryDetailModal';
import { ItinerarySidebar } from './ItinerarySidebar';
import { useTravelStore } from '@/store/useTravelStore';
import { Button } from './ui/button';
import { ListChecks, Sparkles } from 'lucide-react';

interface MoodBoardProps {
  images: MoodBoardImage[];
  categoryDetails: CategoryDetails[];
}

export function MoodBoard({ images, categoryDetails }: MoodBoardProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<CategoryDetails | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { 
    savedActivities, 
    addActivity, 
    removeActivity, 
    updateActivityPriority, 
    getTotalBudget 
  } = useTravelStore();

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const getFallbackImage = (category: string) => {
    const fallbacks: Record<string, string> = {
      'nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
      'food': 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80',
      'architecture': 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=600&q=80',
      'beaches': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
      'culture': 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80',
      'cafes': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
      'adventure': 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80',
      'nightlife': 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&q=80',
    };
    return fallbacks[category] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80';
  };

  const handleCardClick = (category: string) => {
    const details = categoryDetails.find(c => c.category === category);
    if (details) {
      setSelectedCategory(details);
    }
  };

  const handleSaveActivity = (activity: SavedActivity) => {
    addActivity(activity);
  };

  const savedActivityIds = savedActivities.map(a => a.id);

  return (
    <section className="py-12 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Travel Mood Board</h2>
            <p className="text-slate-400">Click any category to explore and plan your activities</p>
          </div>
          <Button
            onClick={() => setIsSidebarOpen(true)}
            className="gap-2"
            size="lg"
          >
            <ListChecks className="w-5 h-5" />
            My Itinerary
            {savedActivities.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {savedActivities.length}
              </span>
            )}
          </Button>
        </div>

        {savedActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/30 mb-6"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <div className="flex-1">
                <p className="text-white font-medium">
                  Great progress! You've added {savedActivities.length} activities to your itinerary.
                </p>
                <p className="text-sm text-slate-400">
                  Estimated budget: ${getTotalBudget()} • Click "My Itinerary" to see details
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            onClick={() => handleCardClick(image.category)}
            className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer bg-slate-800"
          >
            <img
              src={imageErrors[image.id] ? getFallbackImage(image.category) : image.url}
              alt={image.alt}
              onError={() => handleImageError(image.id)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-semibold text-lg capitalize mb-1">{image.category}</p>
                <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Click to explore & plan
                </p>
              </div>
            </div>
            
            {/* Indicator if activities from this category are saved */}
            {savedActivities.some(a => a.category === image.category) && (
              <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <ListChecks className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <CategoryDetailModal
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          category={selectedCategory}
          onSaveActivity={handleSaveActivity}
          savedActivityIds={savedActivityIds}
        />
      )}

      {/* Itinerary Sidebar */}
      <ItinerarySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activities={savedActivities}
        onRemoveActivity={removeActivity}
        onUpdatePriority={updateActivityPriority}
        totalBudget={getTotalBudget()}
      />
    </section>
  );
}
