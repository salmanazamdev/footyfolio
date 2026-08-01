'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Shield } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging in Vercel/server logs
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xl text-center space-y-6">
        
        {/* Brand Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] text-xs font-bold font-mono uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            FootyFolio Protection
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            Something went wrong
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Something went wrong on our end. Don't worry, your match data and scouting progress remain safe.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#E5E7EB] text-[#374151] hover:bg-[#F1F5F9] text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
