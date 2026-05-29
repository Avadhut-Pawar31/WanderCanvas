'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Search, Bell, User, Settings, LogOut, 
  Home, Compass, Map, Heart, Palette 
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from './ui/button';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navLinks = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/my-trips', label: 'My Trips', icon: Map },
    { href: '/mood-boards', label: 'Mood Boards', icon: Palette },
    { href: '/saved-places', label: 'Saved Places', icon: Heart },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsProfileOpen(false);
  };

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="w-full px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo */}
            <Link href="/home" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">
                WanderCanvas
              </span>
            </Link>

            {/* Center Section - Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1 gap-1 ml-12">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-5 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                      isActive(link.href)
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </div>
                    {isActive(link.href) && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-slate-800/60 rounded-lg -z-10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Search Bar - Desktop */}
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-56"
                />
              </div>

              {/* Notifications */}
              <motion.button
                whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white transition-colors duration-200"
              >
                <Bell className="w-5 h-5" />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                />
              </motion.button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:text-white transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white hidden sm:block">{user?.name || 'User'}</span>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-700">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">Profile</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">Settings</span>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-slate-700">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
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
              className="lg:hidden border-t border-slate-800"
            >
              <div className="px-6 py-4 space-y-2">
                {/* Mobile Search */}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/30 border border-slate-700/50 rounded-lg mb-4">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-full"
                  />
                </div>

                {/* Mobile Nav Links */}
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(link.href)
                          ? 'bg-slate-800/60 text-white'
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      {pathname !== '/login' && pathname !== '/signup' && pathname !== '/' && (
        <div className="h-16" />
      )}
    </>
  );
}
