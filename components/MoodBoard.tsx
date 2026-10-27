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
    <section className="py-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#244536] mb-1">
              Visual Travel Mood Board
            </h2>
            <p className="text-sm text-[#292D2A]/70 font-sans">
              Click any category card to inspect local highlights, costs, and plan activities.
            </p>
          </div>
          <Button
            onClick={() => setIsSidebarOpen(true)}
            className="bg-[#244536] text-white hover:bg-[#1B3529] rounded-xl px-4 py-2 gap-2 shadow-xs self-start sm:self-auto"
          >
            <ListChecks className="w-4 h-4 text-[#C78363]" />
            <span>Itinerary Activities</span>
            {savedActivities.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-mono font-bold">
                {savedActivities.length}
              </span>
            )}
          </Button>
        </div>

        {savedActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white rounded-2xl border border-[#244536]/15 shadow-xs mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#244536]/10 text-[#244536] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#C78363]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#244536]">
                  {savedActivities.length} activities curated in your custom itinerary.
                </p>
                <p className="text-xs text-[#292D2A]/60 font-mono mt-0.5">
                  Estimated budget: ${getTotalBudget()} • Click &quot;Itinerary Activities&quot; to review timing and details
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Grid of visual cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleCardClick(image.category)}
            className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer bg-[#E7ECE5] border border-[#244536]/10 shadow-xs hover:shadow-md transition-all"
          >
            <img
              src={imageErrors[image.id] ? getFallbackImage(image.category) : image.url}
              alt={image.alt}
              onError={() => handleImageError(image.id)}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-serif font-bold text-lg capitalize mb-0.5 tracking-tight">
                  {image.category}
                </p>
                <p className="text-[#F7F5EF]/80 text-xs font-mono uppercase tracking-wider">
                  Explore & Plan &rarr;
                </p>
              </div>
            </div>
            
            {/* Indicator if activities from this category are saved */}
            {savedActivities.some(a => a.category === image.category) && (
              <div className="absolute top-3 right-3 w-7 h-7 bg-[#244536] text-white rounded-full flex items-center justify-center shadow-md">
                <ListChecks className="w-3.5 h-3.5" />
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
