'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { ArrowRight, Lock, Mail, User, AlertCircle, AlertTriangle, UserCheck, Shield, Zap } from 'lucide-react';
import { isSupabaseConfigured, saveDemoUserSession, getDemoUserSession, startGuestSession, syncGuestDataToSupabaseUser } from '../../lib/supabase/helpers';
import { Logo } from '../../components/Logo';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [guestBannerInfo, setGuestBannerInfo] = useState<{ name: string; matchCount: number } | null>(null);

  const supabaseConfigured = isSupabaseConfigured();

  const handleGuestLogin = (guestRole?: 'talent' | 'scout') => {
    startGuestSession(guestRole, true);
    window.location.href = '/';
  };

  useEffect(() => {
    // Check for guest session to display informational banner
    const demo = getDemoUserSession();
    if (demo && demo.profile) {
      const guestId = demo.user?.id || 'demo_guest_talent';
      let matchCount = 0;
      try {
        const matchesRaw = localStorage.getItem('footyfolio_user_matches_' + guestId) || localStorage.getItem('footyfolio_user_matches_demo_guest_talent');
        if (matchesRaw) {
          matchCount = JSON.parse(matchesRaw).length;
        }
      } catch (e) {}

      setGuestBannerInfo({
        name: demo.profile.name || 'Guest User',
        matchCount,
      });
      return;
    }

    if (supabaseConfigured) {
      const supabase = createClient();
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          await syncGuestDataToSupabaseUser(session.user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .maybeSingle();

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
        const target = event.data?.target || '/onboarding';
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
        const existingDemo = getDemoUserSession();
        const demoId = 'google-user-' + Date.now();
        await syncGuestDataToSupabaseUser(demoId);

        const guestProfile = existingDemo?.profile;
        const demoUser = {
          id: demoId,
          email: 'google.player@gmail.com',
          user_metadata: { full_name: guestProfile?.name || 'Google Player' },
        };
        const demoProfile = {
          id: demoId,
          email: 'google.player@gmail.com',
          name: guestProfile?.name && !guestProfile.name.startsWith('Guest') ? guestProfile.name : 'Google Player',
          role: guestProfile?.role || 'talent',
          age: guestProfile?.age || 19,
          city: guestProfile?.city || 'Karachi',
          avatarUrl: guestProfile?.avatarUrl,
          onboardingCompleted: guestProfile?.onboardingCompleted ?? true,
        };
        saveDemoUserSession(demoUser, demoProfile);

        if (demoProfile.onboardingCompleted) {
          router.push('/');
        } else {
          router.push('/onboarding');
        }
      }
    } catch (err: any) {
      console.error('Unexpected Google Sign-In error:', err);
      setErrorMessage(err.message || 'An error occurred during Google sign-in.');
      setGoogleLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMessage('Please enter your email address and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check and try again.');
      return;
    }

    setLoading(true);

    try {
      if (supabaseConfigured) {
        const supabase = createClient();

        // Sign up user with metadata in Supabase
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (!error && data?.user) {
          // Create initial profile record with onboarding_completed = false
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              name: fullName.trim(),
              onboarding_completed: false,
            });

          // Save to demo session as backup
          saveDemoUserSession(data.user, {
            id: data.user.id,
            email: email.trim(),
            name: fullName.trim(),
            role: null,
            onboardingCompleted: false,
          });

          router.push('/onboarding');
          return;
        } else if (error) {
          console.warn('Supabase signup error, falling back to local registration:', error);
          if (error.message.includes('User already registered')) {
            setErrorMessage('An account with this email address already exists. Please sign in instead.');
            setLoading(false);
            return;
          }
        }
      }

      // Fallback local registration when Supabase is unconfigured or offline
      const demoId = 'user-' + Date.now();
      const demoUser = {
        id: demoId,
        email: email.trim(),
        user_metadata: { full_name: fullName.trim() },
      };
      const demoProfile = {
        id: demoId,
        email: email.trim(),
        name: fullName.trim(),
        role: null,
        onboardingCompleted: false,
      };

      saveDemoUserSession(demoUser, demoProfile);
      router.push('/onboarding');
    } catch (err: any) {
      console.error('Unexpected signup error, creating local user:', err);
      const demoId = 'user-' + Date.now();
      saveDemoUserSession(
        { id: demoId, email: email.trim(), user_metadata: { full_name: fullName.trim() } },
        { id: demoId, email: email.trim(), name: fullName.trim(), role: null, onboardingCompleted: false }
      );
      router.push('/onboarding');
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
          Create your account
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Join the digital scouting platform for football talent
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        
        {guestBannerInfo && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-[#15803D] text-xs font-medium flex items-center gap-2.5 shadow-2xs">
            <Zap className="w-4 h-4 text-[#16A34A] shrink-0 fill-[#16A34A]" />
            <span>
              We'll bring your guest data — <strong>{guestBannerInfo.name}</strong>, <strong>{guestBannerInfo.matchCount}</strong> match{guestBannerInfo.matchCount === 1 ? '' : 'es'} logged — into your new account.
            </span>
          </div>
        )}

        {!supabaseConfigured && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Supabase Setup Required</p>
              <p className="mt-1 text-amber-700">
                Please add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment variables to enable real signup.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white py-8 px-6 shadow-sm border border-[#E5E7EB] rounded-2xl sm:rounded-3xl">

          <form className="space-y-4" onSubmit={handleSignup}>
            
            {/* Inline Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Bilal Khan"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent text-[#111827] placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

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
                  placeholder="your.email@example.com"
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent text-[#111827] placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent text-[#111827] placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#16A34A] hover:bg-[#15803D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16A34A] shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <span>Create Account with Email</span>
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
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          {/* Switch to Login */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB] text-center space-y-3">
            <p className="text-sm text-[#6B7280]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#16A34A] hover:text-[#15803D]">
                Sign in
              </Link>
            </p>
            <div>
              <button
                type="button"
                onClick={() => handleGuestLogin('talent')}
                className="text-xs text-[#6B7280] hover:text-[#111827] underline underline-offset-2 transition-colors cursor-pointer"
              >
                Or explore preview mode as guest
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
