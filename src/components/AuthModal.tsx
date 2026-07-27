'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { isSupabaseConfigured, selectUserRole } from '../lib/supabase/helpers';
import { Mail, Lock, User, AlertCircle, AlertTriangle, ArrowRight, Shield, UserCheck, X, ExternalLink } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  initialRole?: 'talent' | 'scout';
  onClose: () => void;
  onSuccess: (user: any, role: 'talent' | 'scout') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  initialRole = 'talent',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<'talent' | 'scout'>(initialRole);
  
  // Sync state when modal is opened or props change
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setErrorMessage(null);
    }
  }, [isOpen, initialMode, initialRole]);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabaseConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    if (!supabaseConfigured) {
      setErrorMessage('Supabase is not configured yet. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMessage(err.message || 'An error occurred during Google Sign-In.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!supabaseConfigured) {
      setErrorMessage('Supabase is not configured yet. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables / settings.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role,
            },
          },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            setErrorMessage('An account with this email address already exists. Please sign in instead.');
          } else {
            setErrorMessage(error.message);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          // Store profile role & metadata
          await selectUserRole(data.user.id, role);
          onSuccess(data.user, role);
          onClose();
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(error.message || 'Invalid email or password.');
          setLoading(false);
          return;
        }

        if (data.user) {
          const userRole = data.user.user_metadata?.role || role;
          onSuccess(data.user, userRole as 'talent' | 'scout');
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F5F9] transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-linear-to-b from-[#F8FAFC] to-white border-b border-[#E5E7EB] text-center">
          <div className="inline-flex items-baseline mb-2">
            <span className="text-3xl font-bold tracking-tight text-[#111827]">footyfolio</span>
            <span className="text-[#D97706] text-3xl font-black leading-none ml-[1px]">.</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            Digital Scouting Platform
          </p>

          <div className="mt-6 flex bg-[#F1F5F9] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signin' ? 'bg-white text-[#111827] shadow-xs' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup' ? 'bg-white text-[#111827] shadow-xs' : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body Form */}
        <div className="p-6 sm:p-8 space-y-4">
          
          {!supabaseConfigured && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900 block">Supabase Setup Required</span>
                <span className="text-amber-700 text-[11px]">
                  Please add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable live Supabase Auth.
                </span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google OAuth iFrame Note */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-xs flex items-start gap-2.5">
            <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-blue-900 block">Testing Google Sign-In?</span>
              <span className="text-blue-700 text-[11px] block mb-1.5">
                Google blocks OAuth logins inside embedded preview frames. Open the app in a standalone new browser tab to test Google Sign-In seamlessly.
              </span>
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all shadow-2xs"
              >
                <span>Open App in New Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#111827] bg-white border border-[#E5E7EB] hover:bg-[#F8FAFC] hover:border-[#D1D5DB] transition-all shadow-2xs flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-[#E5E7EB] w-full"></div>
            <span className="bg-white px-2.5 text-[10px] font-bold tracking-wider text-[#9CA3AF] uppercase absolute">
              or email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection in Sign Up */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('talent')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      role === 'talent'
                        ? 'bg-[#16A34A]/10 border-[#16A34A] text-[#16A34A]'
                        : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>Player</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('scout')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      role === 'scout'
                        ? 'bg-[#D97706]/10 border-[#D97706] text-[#D97706]'
                        : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>Scout / Coach</span>
                  </button>
                </div>
              </div>
            )}

            {/* Full Name field in Sign Up */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-fullname" className="block text-[11px] font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="auth-fullname"
                    type="text"
                    required={mode === 'signup'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tariq Ahmad"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827]"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="auth-email" className="block text-[11px] font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="auth-password" className="block text-[11px] font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
                role === 'scout' && mode === 'signup'
                  ? 'bg-[#D97706] hover:bg-[#B45309]'
                  : 'bg-[#16A34A] hover:bg-[#15803D]'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to FootyFolio' : 'Create Account & Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
