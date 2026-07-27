'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { ArrowRight, Lock, Mail, AlertCircle, Shield, UserCheck, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured, saveDemoUserSession, getDemoUserSession } from '../../lib/supabase/helpers';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabaseConfigured = isSupabaseConfigured();

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
        
        {/* FootyFolio Wordmark */}
        <Link href="/" className="inline-flex items-baseline mb-2 group">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111827]">
            footyfolio
          </span>
          <span className="text-[#D97706] text-3xl sm:text-4xl font-black leading-none ml-[1px]">.</span>
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          Get Scouted. Get Seen.
        </p>

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
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#16A34A] hover:bg-[#15803D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16A34A] shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

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
