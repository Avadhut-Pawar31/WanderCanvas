'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { AuthService } from '@/lib/auth';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Confirming your email address...');

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      // Clear old notifications before processing callback
      toast.dismiss();

      const errorParam = searchParams.get('error') || searchParams.get('error_description');
      if (errorParam) {
        toast.error(errorParam, { id: 'auth-toast', duration: 7000 });
        router.replace('/login');
        return;
      }

      const code = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash');
      const type = (searchParams.get('type') as any) || 'email';
      const supabase = createClient();

      try {
        if (code) {
          setStatusMessage('Exchanging confirmation credentials...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn('Supabase code exchange notice:', exchangeError);
          }
        } else if (tokenHash) {
          setStatusMessage('Verifying security token...');
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (verifyError) {
            console.warn('Supabase OTP verification notice:', verifyError);
          }
        }

        // Check if an authenticated user session is active
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          setStatusMessage('Setting up your workspace...');
          // Refresh user profile in local cache
          await AuthService.getCurrentUserAsync();
          toast.success('Email confirmed! Welcome to WanderCanvas.', {
            id: 'auth-toast',
            duration: 5000,
          });
          router.replace('/home');
        } else {
          // Email was confirmed, but session is not established or sign-in is required
          toast.success('Email confirmed successfully! Please sign in with your credentials.', {
            id: 'auth-toast',
            duration: 6000,
          });
          router.replace('/login?confirmed=true');
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Confirmation link is invalid or expired.';
        toast.error(msg, { id: 'auth-toast', duration: 7000 });
        router.replace('/login');
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4 text-[#292D2A]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#244536]/12 p-8 shadow-xl text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#244536] text-[#F7F5EF] flex items-center justify-center shadow-xs">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-[#244536]">
            WanderCanvas
          </h2>
          <p className="text-sm text-[#292D2A]/80 font-medium">
            {statusMessage}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-[#244536]/70">
          <Loader2 className="w-4 h-4 animate-spin text-[#244536]" />
          <span>Finalizing authentication flow...</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#244536]" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
