'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { ArrowRight, Lock, Mail, AlertCircle, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured, saveDemoUserSession, getDemoUserSession } from '../../lib/supabase/helpers';
import { Logo } from '../../components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (supabaseConfigured) {
      const supabase = createClient();
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();

          if (profile?.onboarding_completed) {
            router.push('/');
          } else {
            router.push('/onboarding');
          }
        }
      });
    }

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const target = event.data?.target || '/';
        router.push(target);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router, supabaseConfigured]);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);

    try {
      if (supabaseConfigured) {
        const supabase = createClient();
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const redirectUrl = `${siteUrl.replace(/\/$/, '')}/auth/callback`;

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          console.error('Google Sign-In Error:', error);
          setErrorMessage(error.message || 'Failed to initialize Google Sign-In. Please check your Supabase provider settings.');
          setGoogleLoading(false);
          return;
        }

        if (data?.url) {
          window.location.href = data.url;
        }
      } else {
        const demoId = 'google-user-' + Date.now();
        const demoUser = {
          id: demoId,
          email: 'google.player@example.com',
          user_metadata: { full_name: 'Google Player' },
        };
        const demoProfile = {
          id: demoId,
          email: 'google.player@example.com',
          name: 'Google Player',
          role: 'talent' as const,
          onboardingCompleted: true,
        };
        saveDemoUserSession(demoUser, demoProfile);
        router.push('/');
      }
    } catch (err: any) {
      console.error('Unexpected Google Sign-In error:', err);
      setErrorMessage(err.message || 'An error occurred during Google sign-in.');
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      if (supabaseConfigured) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (!error && data?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          saveDemoUserSession(data.user, {
            id: data.user.id,
            email: email.trim(),
            name: profile?.name || data.user.user_metadata?.full_name || email.split('@')[0],
            role: profile?.role || 'talent',
            onboardingCompleted: !!profile?.onboarding_completed,
          });

          if (profile && profile.onboarding_completed) {
            router.push('/');
          } else {
            router.push('/onboarding');
          }
          return;
        } else if (error) {
          console.warn('Supabase login failed, trying demo login:', error);
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('Incorrect email address or password. Please try again or create a new account.');
            setLoading(false);
            return;
          }
        }
      }

      // Fallback Demo Login
      const existingDemo = getDemoUserSession();
      if (existingDemo && existingDemo.user.email === email.trim()) {
        router.push(existingDemo.profile.onboardingCompleted ? '/' : '/onboarding');
      } else {
        const demoId = 'user-' + Date.now();
        const demoUser = {
          id: demoId,
          email: email.trim(),
          user_metadata: { full_name: email.split('@')[0] },
        };
        const demoProfile = {
          id: demoId,
          email: email.trim(),
          name: email.split('@')[0],
          role: 'talent' as const,
          onboardingCompleted: true,
        };
        saveDemoUserSession(demoUser, demoProfile);
        router.push('/');
      }
    } catch (err: any) {
      console.error('Unexpected login error, logging in locally:', err);
      const demoId = 'user-' + Date.now();
      saveDemoUserSession(
        { id: demoId, email: email.trim(), user_metadata: { full_name: email.split('@')[0] } },
        { id: demoId, email: email.trim(), name: email.split('@')[0], role: 'talent', onboardingCompleted: true }
      );
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        
        {/* FootyFolio Brand */}
        <div className="flex justify-center mb-2">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#111827]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Access player stats, scout feeds, and AI scouting reports
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        
        {!supabaseConfigured && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Supabase Setup Required</p>
              <p className="mt-1 text-amber-700">
                Please add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment variables to enable real authentication.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white py-8 px-6 shadow-sm border border-[#E5E7EB] rounded-2xl sm:rounded-3xl">
          <form className="space-y-5" onSubmit={handleLogin}>
            
            {/* Inline Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scout@club.com or player@footyfolio.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent text-[#111827] placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent text-[#111827] placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#16A34A] hover:bg-[#15803D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16A34A] shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Sign In with Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2.5 text-[#6B7280] font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex justify-center items-center gap-3 py-2.5 px-4 rounded-xl text-sm font-semibold text-[#374151] bg-white border border-[#D1D5DB] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16A34A] shadow-2xs transition-all cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#374151] border-t-transparent rounded-full animate-spin"></span>
                Connecting Google...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Switch to Signup */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB] text-center">
            <p className="text-sm text-[#6B7280]">
              Don't have an account yet?{' '}
              <Link href="/signup" className="font-semibold text-[#16A34A] hover:text-[#15803D]">
                Create a new account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
