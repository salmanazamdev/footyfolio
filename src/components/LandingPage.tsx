import React from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './Header';
import { LandingHero } from './LandingHero';
import { startGuestSession } from '../lib/supabase/helpers';

interface LandingPageProps {
  onGuestLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGuestLogin }) => {
  const router = useRouter();

  const handleGuest = (role?: 'talent' | 'scout') => {
    startGuestSession(role || 'talent');
    if (onGuestLogin) {
      onGuestLogin();
    } else {
      router.push('/onboarding');
    }
  };

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    if (mode === 'signup') {
      router.push('/signup');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans">
      <Header
        currentRole={null}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
      />
      
      <main className="flex-1">
        <LandingHero
          onSelectRole={(role) => router.push(`/signup?role=${role}`)}
          onOpenAuth={(mode) => handleOpenAuth(mode)}
          onGuestAccess={(role) => handleGuest(role)}
        />
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center text-xs text-[#6B7280]">
          © {new Date().getFullYear()} FootyFolio. Empowering Grassroots Football & Scouting in Pakistan.
        </div>
      </footer>
    </div>
  );
};
