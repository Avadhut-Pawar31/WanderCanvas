'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Search, Bell, Settings, LogOut, 
  Home, Compass, Map, Heart, Palette 
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, checkAuth } = useAuthStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navLinks = [
    { href: '/home', label: 'Planner', icon: Home },
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/my-trips', label: 'Collaborative Trips', icon: Map },
    { href: '/mood-boards', label: 'Palettes', icon: Palette },
    { href: '/saved-places', label: 'Saved Places', icon: Heart },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsProfileOpen(false);
  };

  // Don't show global navbar on auth pages, landing page (which has its own hero navbar), or dedicated workspace
  if (pathname === '/login' || pathname === '/signup' || pathname === '/' || pathname?.startsWith('/workspace')) {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#244536]/10 shadow-[0_1px_3px_rgba(36,69,54,0.04)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Editorial Brand */}
            <Link href="/home" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="w-9 h-9 bg-[#244536] text-[#F7F5EF] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#1B3529] transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-[#244536]">
                  WanderCanvas
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C78363] hidden sm:block -mt-1 font-semibold">
                  Editorial Travel
                </span>
              </div>
            </Link>

            {/* Center Section - Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1 gap-1.5 ml-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap text-sm font-medium ${
                      active
                        ? 'text-[#244536] font-semibold bg-[#244536]/10 shadow-xs'
                        : 'text-[#292D2A]/70 hover:text-[#244536] hover:bg-[#244536]/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${active ? 'text-[#244536]' : 'text-[#292D2A]/60'}`} />
                      <span>{link.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Right Section - Search & User Actions */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Search Bar - Desktop */}
              <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#244536]/15 rounded-xl shadow-xs hover:border-[#244536]/30 focus-within:border-[#244536] transition-all">
                <Search className="w-4 h-4 text-[#292D2A]/40 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-[#292D2A] placeholder-[#292D2A]/40 w-44 font-sans"
                />
              </div>

              {/* Notifications */}
              <button
                className="relative p-2 rounded-xl text-[#292D2A]/70 hover:text-[#244536] hover:bg-white border border-transparent hover:border-[#244536]/15 transition-all"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C78363] rounded-full" />
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white border border-transparent hover:border-[#244536]/15 transition-all"
                >
                  <div className="w-8 h-8 bg-[#244536] rounded-full flex items-center justify-center flex-shrink-0 shadow-xs">
                    <span className="text-xs font-serif font-bold text-[#F7F5EF]">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#292D2A] hidden sm:block max-w-[100px] truncate">
                    {user?.name || 'Avadhut'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 bg-white border border-[#244536]/15 rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-4 bg-[#F7F5EF]/60 border-b border-[#244536]/10">
                        <p className="text-sm font-serif font-bold text-[#292D2A]">{user?.name || 'Traveler'}</p>
                        <p className="text-xs text-[#292D2A]/60 truncate mt-0.5">{user?.email || 'traveler@wandercanvas.com'}</p>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <Link
                          href="/my-trips"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#292D2A]/80 hover:text-[#244536] hover:bg-[#244536]/5 transition-colors"
                        >
                          <Map className="w-4 h-4 text-[#244536]" />
                          <span>My Collaborative Trips</span>
                        </Link>
                        <Link
                          href="/saved-places"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#292D2A]/80 hover:text-[#244536] hover:bg-[#244536]/5 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-[#C78363]" />
                          <span>Saved Places</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#292D2A]/80 hover:text-[#244536] hover:bg-[#244536]/5 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-[#292D2A]/60" />
                          <span>Settings</span>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-[#244536]/10">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-white text-[#292D2A] border border-[#244536]/15 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-[#244536]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#244536]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-[#244536]/10 bg-[#F7F5EF] px-4 py-4 space-y-3 shadow-lg"
            >
              {/* Mobile Search */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#244536]/15 rounded-xl">
                <Search className="w-4 h-4 text-[#292D2A]/40" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-[#292D2A] placeholder-[#292D2A]/40 w-full font-sans"
                />
              </div>

              {/* Mobile Nav Links */}
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[#244536] text-white font-semibold'
                          : 'text-[#292D2A]/80 hover:bg-white hover:text-[#244536]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />
    </>
  );
}
