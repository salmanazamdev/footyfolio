import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xl text-center space-y-6">
        
        {/* Visual Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center shadow-xs">
          <FileQuestion className="w-8 h-8" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="text-xs font-bold font-mono text-[#D97706] tracking-widest uppercase">
            404 - Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            This page doesn't exist
          </h1>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            The page you're looking for was moved, removed, or doesn't exist in FootyFolio.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>Return to FootyFolio</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
