'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTravelStore } from '@/store/useTravelStore';
import { DestinationOverview } from '@/components/DestinationOverview';
import { MoodBoard } from '@/components/MoodBoard';
import { ColorPalette } from '@/components/ColorPalette';
import { Attractions } from '@/components/Attractions';
import { FoodRecommendations } from '@/components/FoodRecommendations';
import { PackingList } from '@/components/PackingList';
import { Itinerary } from '@/components/Itinerary';
import { TravelInsights } from '@/components/TravelInsights';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Heart, Loader2 } from 'lucide-react';
import { shareContent } from '@/lib/shareUtils';
import { exportTravelBoardPDF } from '@/lib/pdfUtils';

function DashboardPage() {
  const router = useRouter();
  const { currentBoard, toggleFavorite, favorites } = useTravelStore();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!currentBoard) {
      router.push('/home');
    }
  }, [currentBoard, router]);

  if (!currentBoard) {
    return null;
  }

  const isFavorite = favorites.includes(currentBoard.id);

  const handleShare = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    await shareContent({
      title: `Travel Mood Board - ${currentBoard.destination.name}`,
      text: `Check out my travel plan for ${currentBoard.destination.name}! ${currentBoard.destination.description.slice(0, 100)}...`,
      url: currentUrl,
    });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportTravelBoardPDF(currentBoard);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <ThemeToggle />
      
      {/* Fixed Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-16 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/home')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(currentBoard.id)}
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'
                }`}
              />
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button 
              className="gap-2"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          <DestinationOverview destination={currentBoard.destination} />
          <MoodBoard images={currentBoard.moodBoard} categoryDetails={currentBoard.categoryDetails} />
          <ColorPalette colors={currentBoard.colorPalette} />
          <Attractions attractions={currentBoard.attractions} />
          <FoodRecommendations foods={currentBoard.foodRecommendations} />
          <PackingList items={currentBoard.packingList} />
          <Itinerary days={currentBoard.itinerary} />
          <TravelInsights insights={currentBoard.insights} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>Made with ❤️ by WanderCanvas</p>
        </div>
      </footer>
    </main>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
