'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Search, Bell, Settings, LogOut, 
  Home, Compass, Map, Heart, Palette, Sparkles, ShieldCheck, Check
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { ExploreService } from '@/services/exploreService';
import { GlobalHierarchicalSearch } from '@/components/search/GlobalHierarchicalSearch';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  targetUrl: string;
  read: boolean;
  type: 'itinerary' | 'hygiene' | 'vote' | 'wonder';
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, checkAuth } = useAuthStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Taj Mahal Sunrise Entry Confirmed',
      description: 'VIP sunrise tickets reserved for your Agra cultural wonder circuit.',
      time: '10m ago',
      targetUrl: '/explore?q=Taj%20Mahal',
      read: false,
      type: 'wonder',
    },
    {
      id: 'notif-2',
      title: 'Consensus Reached on Stop',
      description: 'Autogrill Cantagallo Ovest auto-promoted to itinerary by team vote.',
      time: '2h ago',
      targetUrl: '/workspace/trip-amalfi-classic',
      read: false,
      type: 'vote',
    },
    {
      id: 'notif-3',
      title: 'Pasarni Ghat Hygiene Verified',
      description: 'Mahabaleshwar mountain corridor certified 96/100 by highway inspectors.',
      time: '1d ago',
      targetUrl: '/explore?q=Mahabaleshwar',
      read: false,
      type: 'hygiene',
    },
    {
      id: 'notif-4',
      title: 'Eiffel Tower Summit Access Open',
      description: 'Gustave Eiffel summit observation slots now available for booking.',
      time: '2d ago',
      targetUrl: '/explore?q=Eiffel%20Tower',
      read: false,
      type: 'wonder',
    },
  ]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchFocused(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setIsNotificationsOpen(false);
    router.push(item.targetUrl);
  };

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

  const handleSearchSubmit = (q: string) => {
    const term = q.trim();
    if (term) {
      setIsSearchFocused(false);
      setIsMobileMenuOpen(false);
      setSearchQuery('');
      router.push(`/explore?q=${encodeURIComponent(term)}`);
    }
  };

  // Instant live search matches
  const searchResults = searchQuery.trim()
    ? ExploreService.getDestinations({ searchQuery: searchQuery.trim() }).slice(0, 5)
    : [];

  const popularSuggestions = [
    'Taj Mahal',
    'Eiffel Tower',
    '7 Wonders',
    'Mahabaleshwar',
    'Colosseum',
    'Machu Picchu',
    'Petra',
    'Kaas Plateau',
    'Zermatt',
  ];

  // Don't show global navbar on auth pages, landing page, or dedicated map workspace
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
              {/* Global Deep Hierarchical Location Search - Desktop */}
              <GlobalHierarchicalSearch
                className="hidden md:block w-72"
                placeholder="Search places, towns, waterfalls, petrol..."
              />

              {/* Notifications Dropdown */}
              <div ref={notificationsRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-xl text-[#292D2A]/70 hover:text-[#244536] hover:bg-white border border-transparent hover:border-[#244536]/15 transition-all"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C78363] rounded-full animate-pulse" />
                  )}
                </button>

                {/* Notifications Popup */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-[#244536]/15 rounded-2xl shadow-xl overflow-hidden z-50 text-xs"
                    >
                      <div className="p-3.5 bg-[#FAF8F5] border-b border-[#244536]/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-serif font-bold text-[#244536]">
                          <Bell className="w-3.5 h-3.5 text-[#C78363]" />
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-[#C78363] text-white rounded-full text-[10px] font-mono">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotificationsAsRead}
                            className="text-[10px] font-mono text-[#C78363] hover:underline flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark all as read</span>
                          </button>
                        )}
                      </div>

                      <div className="divide-y divide-[#244536]/8 max-h-72 overflow-y-auto">
                        {notifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`p-3.5 hover:bg-[#FAF8F5] transition cursor-pointer flex flex-col gap-1 ${
                              !item.read ? 'bg-amber-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-serif font-bold text-[#244536] text-xs">
                                {item.title}
                              </p>
                              {!item.read && (
                                <span className="w-2 h-2 rounded-full bg-[#C78363] flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[#5F6761] text-[11px] leading-relaxed">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between pt-1 text-[10px] text-[#5F6761]/60 font-mono">
                              <span>{item.time}</span>
                              <span className="text-[#244536] font-semibold hover:underline">
                                View details &rarr;
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile Dropdown */}
              <div ref={profileRef} className="relative">
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
              {/* Mobile Global Hierarchical Search */}
              <GlobalHierarchicalSearch
                className="w-full"
                placeholder="Search places, towns, waterfalls, petrol..."
              />

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
