'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Compass } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle URL query parameters (e.g. from Supabase email confirmation redirects or errors)
  useEffect(() => {
    // Clear any stale notifications from previous pages
    toast.dismiss();

    const confirmed = searchParams.get('confirmed');
    const errorParam = searchParams.get('error') || searchParams.get('error_description');
    const code = searchParams.get('code');

    if (code) {
      // Direct PKCE redirect to login: attempt session exchange
      const supabase = createClient();
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.session) {
          toast.success('Email confirmed! Welcome to WanderCanvas.', { id: 'auth-toast' });
          router.replace('/home');
        } else {
          toast.success('Email confirmed successfully! Please sign in with your credentials.', {
            id: 'auth-toast',
            duration: 6000,
          });
        }
      });
      return;
    }

    if (confirmed === 'true') {
      toast.success('Email confirmed successfully! Please sign in with your credentials.', {
        id: 'auth-toast',
        duration: 6000,
      });
    } else if (errorParam) {
      toast.error(errorParam, {
        id: 'auth-toast',
        duration: 7000,
      });
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous error and success notifications before new attempt
    toast.dismiss();

    if (!email || !password) {
      toast.error('Please enter your email and password', { id: 'auth-toast' });
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Welcome back to WanderCanvas!', { id: 'auth-toast' });
      router.push('/home');
    } else {
      const isEmailNotConfirmed =
        result.code === 'email_not_confirmed' ||
        result.error?.toLowerCase().includes('email not confirmed');

      if (isEmailNotConfirmed) {
        toast.error(
          'Email not confirmed yet! Please click the confirmation link sent to your email, or in Supabase Dashboard click "Confirm user".',
          { id: 'auth-toast', duration: 7000 }
        );
      } else {
        toast.error(result.error || 'Login failed', { id: 'auth-toast' });
      }
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
              toast.dismiss();
              setEmail('elena@wandercanvas.com');
              setPassword('password123');
              toast.success('Demo credentials loaded! Click Sign In.', { id: 'auth-toast' });
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#244536]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
