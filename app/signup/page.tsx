'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Compass } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const result = await signup(name, email, password);
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Account created! Welcome to WanderCanvas.');
      router.push('/home');
    } else {
      toast.error(result.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4 text-[#292D2A]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-[#244536] text-[#F7F5EF] flex items-center justify-center shadow-xs group-hover:bg-[#1B3529] transition">
              <Compass className="w-6 h-6" />
            </div>
            <span className="font-serif text-3xl font-bold text-[#244536]">
              WanderCanvas
            </span>
          </Link>
          <p className="text-xs font-mono uppercase tracking-wider text-[#C78363] font-semibold">
            Collaborative, Hygiene-Aware Travel
          </p>
          <p className="text-sm text-[#292D2A]/70 pt-1">
            Create an account to build shared routes and hygiene-verified itineraries.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl border border-[#244536]/12 p-8 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C78363]" />
                <span>Full Name</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Avadhut Pawar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#F7F5EF]/60 border-[#244536]/15 text-[#292D2A] focus:bg-white text-sm"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C78363]" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#F7F5EF]/60 border-[#244536]/15 text-[#292D2A] focus:bg-white text-sm"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C78363]" />
                <span>Password</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#F7F5EF]/60 border-[#244536]/15 text-[#292D2A] focus:bg-white text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#292D2A]/40 hover:text-[#292D2A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-mono uppercase tracking-wider text-[#244536] font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C78363]" />
                <span>Confirm Password</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#F7F5EF]/60 border-[#244536]/15 text-[#292D2A] focus:bg-white text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#292D2A]/40 hover:text-[#292D2A]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#244536] hover:bg-[#1B3529] text-white rounded-xl text-sm font-semibold shadow-xs mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create WanderCanvas Account'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-xs text-[#292D2A]/70 pt-2 border-t border-[#244536]/8">
            Already have an account?{' '}
            <Link href="/login" className="text-[#244536] hover:underline font-bold">
              Sign In Instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
