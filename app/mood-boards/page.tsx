'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Palette, Share2, Download, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface MoodBoardItem {
  id: number;
  title: string;
  destination: string;
  country: string;
  colors: { hex: string; name: string }[];
  created: string;
  image: string;
  notes: string;
}

export default function MoodBoardsPage() {
  const router = useRouter();

  const [moodBoards] = useState<MoodBoardItem[]>([
    {
      id: 1,
      title: 'Tropical Coastal Serenity',
      destination: 'Bali',
      country: 'Indonesia',
      colors: [
        { hex: '#2A5D54', name: 'Deep Palm' },
        { hex: '#C78363', name: 'Terracotta Tile' },
        { hex: '#E7ECE5', name: 'Morning Mist' },
        { hex: '#F7F5EF', name: 'Warm Ivory' },
      ],
      created: 'May 18, 2026',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=85',
      notes: 'Emerald rice terraces, carved volcanic stone temples, and warm sunset shorelines.',
    },
    {
      id: 2,
      title: 'Urban Architecture & Metro',
      destination: 'New York City',
      country: 'USA',
      colors: [
        { hex: '#292D2A', name: 'Cast Iron' },
        { hex: '#7A8B7B', name: 'Patina Bronze' },
        { hex: '#D68C45', name: 'Brownstone Ochre' },
        { hex: '#FFFFFF', name: 'Limestone' },
      ],
      created: 'May 12, 2026',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=85',
      notes: 'Granite facades, historic iron bridges, and vibrant neighborhood street cafes.',
    },
    {
      id: 3,
      title: 'Alpine Vista & Pine Woods',
      destination: 'Swiss Alps',
      country: 'Switzerland',
      colors: [
        { hex: '#1B3529', name: 'Nordic Pine' },
        { hex: '#87CEEB', name: 'Glacial Sky' },
        { hex: '#A8B5A0', name: 'Alpine Sage' },
        { hex: '#F2EDE4', name: 'Powder Snow' },
      ],
      created: 'May 04, 2026',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85',
      notes: 'High-altitude passes, cedar chalets, and crisp mountain spring water.',
    },
  ]);

  const stats = [
    { label: 'Total Mood Boards', value: moodBoards.length },
    { label: 'Unique Destinations', value: new Set(moodBoards.map(b => b.destination)).size },
    { label: 'Countries Represented', value: new Set(moodBoards.map(b => b.country)).size },
  ];

  const handleShare = (title: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success(`Palette "${title}" link copied to clipboard!`);
    }
  };

  const handleExport = (title: string) => {
    toast.success(`Exporting ${title} palette swatch card...`);
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#F7F5EF] text-[#292D2A] pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#244536]/10"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#244536]/8 border border-[#244536]/15 mb-3">
                <Palette className="w-3.5 h-3.5 text-[#244536]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold">
                  Visual Curations
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#244536] tracking-tight">
                Your Travel Palettes
              </h1>
              <p className="text-sm sm:text-base text-[#292D2A]/70 mt-2 max-w-2xl leading-relaxed">
                Curated color stories, natural textures, and visual inspirations for every destination. Create, share, and export your personal mood boards.
              </p>
            </div>

            <Button
              onClick={() => router.push('/home')}
              className="bg-[#244536] text-white hover:bg-[#1B3529] rounded-xl px-5 gap-2 shadow-xs self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4 text-[#C78363]" />
              <span>Create Mood Board</span>
            </Button>
          </motion.div>

          {/* Statistics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="bg-white rounded-2xl border border-[#244536]/10 p-5 shadow-xs"
              >
                <div className="font-serif text-3xl sm:text-4xl font-bold text-[#244536]">
                  {stat.value}
                </div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#292D2A]/60 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mood Boards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moodBoards.map((board, index) => (
              <motion.div
                key={board.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group bg-white rounded-2xl border border-[#244536]/10 hover:border-[#244536]/30 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#E7ECE5]">
                    <img
                      src={board.image}
                      alt={board.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="flex items-center gap-1.5 text-xs text-white/90">
                        <MapPin className="w-3.5 h-3.5 text-[#C78363]" />
                        <span className="font-medium">{board.destination}, {board.country}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#292D2A] group-hover:text-[#244536] transition-colors">
                        {board.title}
                      </h3>
                      <p className="text-xs text-[#292D2A]/70 mt-1 line-clamp-2 leading-relaxed">
                        {board.notes}
                      </p>
                    </div>

                    {/* Color Swatches */}
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#292D2A]/50 mb-2">
                        Harmonic Palette
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {board.colors.map((color) => (
                          <div key={color.hex} className="space-y-1 text-center">
                            <div
                              className="h-9 w-full rounded-lg border border-black/10 shadow-2xs transition-transform group-hover:scale-105"
                              style={{ backgroundColor: color.hex }}
                              title={`${color.name} (${color.hex})`}
                            />
                            <div className="text-[10px] font-mono text-[#292D2A]/60 truncate">
                              {color.hex}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#244536]/8 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleShare(board.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#292D2A]/70 hover:text-[#244536] py-1.5 px-3 rounded-lg hover:bg-white border border-transparent hover:border-[#244536]/15 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => handleExport(board.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#244536] bg-[#244536]/8 hover:bg-[#244536] hover:text-white py-1.5 px-3 rounded-lg transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Swatch</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
