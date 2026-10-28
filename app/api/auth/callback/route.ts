import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as any;
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/home';
  const origin = requestUrl.origin;

  if (error || errorDescription) {
    const errorMsg = encodeURIComponent(errorDescription || error || 'Confirmation failed');
    return NextResponse.redirect(`${origin}/login?error=${errorMsg}`);
  }

  try {
    const supabase = await createClient();

    if (code) {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (!exchangeError && data.session) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    if (tokenHash && type) {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      if (!verifyError && data.session) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // If verified or confirmed without automatic session establishment
    return NextResponse.redirect(`${origin}/login?confirmed=true`);
  } catch (err) {
    console.warn('API Auth Callback error:', err);
    return NextResponse.redirect(`${origin}/login?confirmed=true`);
  }
}
