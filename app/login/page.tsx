'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Compass } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Welcome back to WanderCanvas!');
      router.push('/home');
    } else {
      toast.error(result.error || 'Login failed');
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
            Sign in to access your saved trips and collaborative workspaces.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl border border-[#244536]/12 p-8 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#292D2A]/70">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#244536]/30 text-[#244536] focus:ring-[#244536]"
                />
                <span>Remember me</span>
              </label>
              <Link href="#" className="text-[#244536] font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#244536] hover:bg-[#1B3529] text-white rounded-xl text-sm font-semibold shadow-xs"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#244536]/10"></div>
            </div>
            <div className="relative flex justify-center text-[11px] font-mono uppercase tracking-wider">
              <span className="px-3 bg-white text-[#292D2A]/50">Or Demo Access</span>
            </div>
          </div>

          {/* Quick Demo Access */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEmail('elena@wandercanvas.com');
              setPassword('password123');
              toast.success('Demo credentials loaded! Click Sign In.');
            }}
            className="w-full bg-[#F7F5EF] border-[#244536]/15 text-[#244536] hover:bg-white text-xs font-semibold h-10 rounded-xl"
          >
            Fill Demo Account (Elena Rostova)
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-xs text-[#292D2A]/70 pt-2 border-t border-[#244536]/8">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#244536] hover:underline font-bold">
              Create an Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
