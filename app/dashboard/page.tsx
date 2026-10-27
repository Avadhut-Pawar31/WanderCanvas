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
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Heart, Loader2, Map } from 'lucide-react';
import { shareContent } from '@/lib/shareUtils';
import { exportTravelBoardPDF } from '@/lib/pdfUtils';
import Link from 'next/link';

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
      title: `Travel Canvas - ${currentBoard.destination.name}`,
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
    <main className="min-h-screen bg-[#F7F5EF] text-[#292D2A]">
      {/* Sub-header Navigation Bar */}
      <motion.header
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        className="sticky top-16 left-0 right-0 z-40 bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#244536]/10 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/home')}
            className="text-xs font-mono uppercase tracking-wider text-[#244536] hover:bg-[#244536]/8 gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Planner</span>
          </Button>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/workspace/trip-amalfi-classic">
              <Button
                variant="outline"
                className="hidden sm:inline-flex border-[#244536]/25 bg-white text-[#244536] hover:bg-[#244536]/5 text-xs font-medium gap-1.5 h-9 rounded-xl"
              >
                <Map className="w-3.5 h-3.5" />
                <span>Open in Map Workspace</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(currentBoard.id)}
              className="h-9 w-9 text-[#C78363] hover:bg-[#C78363]/10 rounded-xl"
              title="Save to favorites"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-[#C78363] text-[#C78363]' : 'text-[#292D2A]/60'
                }`}
              />
            </Button>

            <Button 
              variant="outline" 
              className="gap-1.5 text-xs h-9 bg-white border-[#244536]/20 text-[#292D2A] hover:bg-[#F7F5EF] rounded-xl"
              onClick={handleShare}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </Button>

            <Button 
              className="gap-1.5 text-xs h-9 bg-[#244536] text-white hover:bg-[#1B3529] rounded-xl shadow-xs"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="py-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
      <footer className="border-t border-[#244536]/10 py-8 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-mono text-[#292D2A]/60 space-y-1">
          <p className="font-serif font-bold text-sm text-[#244536]">WanderCanvas</p>
          <p>Collaborative, Hygiene-Aware AI Travel Planning Platform</p>
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
