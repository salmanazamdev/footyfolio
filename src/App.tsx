'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, TalentProfile, ScoutProfile, ShortlistItem, Match, ScoutingReport } from './types';
import { StorageEngine } from './data/storage';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { TalentDashboard } from './components/TalentDashboard';
import { ScoutDashboard } from './components/ScoutDashboard';
import { TalentOnboardingModal } from './components/TalentOnboardingModal';
import { ScoutOnboardingModal } from './components/ScoutOnboardingModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AuthModal } from './components/AuthModal';
import { createClient } from './lib/supabase/client';
import { isSupabaseConfigured, getUserProfile, getTalentsFeedForScout } from './lib/supabase/helpers';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  
  // Data State
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [scouts, setScouts] = useState<ScoutProfile[]>([]);
  const [shortlists, setShortlists] = useState<ShortlistItem[]>([]);

  // Active Users
  const [activeTalentId, setActiveTalentId] = useState<string>('talent-1');
  const [activeScoutId, setActiveScoutId] = useState<string>('scout-1');

  // Scout Dashboard Tab
  const [scoutTab, setScoutTab] = useState<'feed' | 'shortlist'>('feed');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authRole, setAuthRole] = useState<'talent' | 'scout'>('talent');

  const [isTalentOnboardingOpen, setIsTalentOnboardingOpen] = useState(false);
  const [isScoutOnboardingOpen, setIsScoutOnboardingOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  // Initialize storage & check Supabase Auth Session
  useEffect(() => {
    const loadedTalents = StorageEngine.getTalentProfiles();
    const loadedScouts = StorageEngine.getScoutProfiles();
    setTalents(loadedTalents);
    setScouts(loadedScouts);

    if (loadedTalents.length > 0) {
      setActiveTalentId(loadedTalents[0].id);
    }

    if (loadedScouts.length > 0) {
      setActiveScoutId(loadedScouts[0].id);
      setShortlists(StorageEngine.getShortlists(loadedScouts[0].id));
    }

    // Check Supabase Auth state & load talents from Supabase if configured
    if (isSupabaseConfigured()) {
      getTalentsFeedForScout().then((dbTalents) => {
        if (dbTalents && dbTalents.length > 0) {
          setTalents(dbTalents);
          setActiveTalentId(dbTalents[0].id);
        }
      });

      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser(session.user);
          loadProfileForUser(session.user);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            setCurrentUser(session.user);
            loadProfileForUser(session.user);
          } else {
            setCurrentUser(null);
          }
        }
      );

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, []);

  // Helper to load profile for an authenticated user
  const loadProfileForUser = async (user: any) => {
    const userRole = user.user_metadata?.role || 'talent';
    setCurrentRole(userRole as UserRole);

    try {
      const profileData = await getUserProfile(user.id);
      if (profileData?.profile) {
        if (userRole === 'talent' && profileData.details) {
          const tProfile: TalentProfile = {
            id: user.id,
            userId: user.id,
            name: profileData.profile.full_name || 'Player',
            avatarUrl: profileData.profile.avatar_url || 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=250',
            age: profileData.details.age || 18,
            position: profileData.details.primary_position || 'midfielder',
            city: profileData.details.city || 'Lahore',
            preferredFoot: profileData.details.preferred_foot || 'right',
            bio: profileData.details.bio || '',
            matches: [],
            latestReport: undefined,
            shortlistedBy: [],
            createdAt: new Date().toISOString(),
          };
          
          const updatedTalents = StorageEngine.saveTalentProfile(tProfile);
          setTalents(updatedTalents);
          setActiveTalentId(tProfile.id);
        }
      } else if (!profileData) {
        // If profile doesn't exist, prompt onboarding modal
        if (userRole === 'talent') {
          setIsTalentOnboardingOpen(true);
        } else {
          setIsScoutOnboardingOpen(true);
        }
      }
    } catch (e) {
      console.log('Error fetching DB profile:', e);
    }
  };

  // Update shortlists when active scout changes or when toggled
  useEffect(() => {
    if (activeScoutId) {
      setShortlists(StorageEngine.getShortlists(activeScoutId));
    }
  }, [activeScoutId]);

  // Open Auth Modal
  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin', role: 'talent' | 'scout' = 'talent') => {
    setAuthMode(mode);
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  // Auth Success Handler
  const handleAuthSuccess = (user: any, role: 'talent' | 'scout') => {
    setCurrentUser(user);
    setCurrentRole(role);
    
    if (role === 'talent') {
      const existing = talents.find((t) => t.id === user.id);
      if (existing) {
        setActiveTalentId(existing.id);
      } else {
        // Open onboarding to complete profile
        setIsTalentOnboardingOpen(true);
      }
    } else {
      const existing = scouts.find((s) => s.id === user.id);
      if (existing) {
        setActiveScoutId(existing.id);
      } else {
        setIsScoutOnboardingOpen(true);
      }
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setCurrentRole(null);
  };

  // Handle role selection from landing or switch
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'talent') {
      if (talents.length === 0) {
        setIsTalentOnboardingOpen(true);
      }
    } else if (role === 'scout') {
      if (scouts.length === 0) {
        setIsScoutOnboardingOpen(true);
      } else {
        setScoutTab('feed');
      }
    }
  };

  const handleSwitchRole = () => {
    setCurrentRole(null);
  };

  // Complete Talent Onboarding
  const handleTalentOnboardingComplete = (newTalent: TalentProfile) => {
    const updatedTalents = StorageEngine.saveTalentProfile(newTalent);
    setTalents(updatedTalents);
    setActiveTalentId(newTalent.id);
    setIsTalentOnboardingOpen(false);
    setCurrentRole('talent');
  };

  // Complete Scout Onboarding
  const handleScoutOnboardingComplete = (newScout: ScoutProfile) => {
    const updatedScouts = StorageEngine.saveScoutProfile(newScout);
    setScouts(updatedScouts);
    setActiveScoutId(newScout.id);
    setIsScoutOnboardingOpen(false);
    setCurrentRole('scout');
    setScoutTab('feed');
  };

  // Shortlist Toggle
  const handleToggleShortlist = (talentId: string) => {
    const activeScout = scouts.find((s) => s.id === activeScoutId) || scouts[0];
    const scoutName = activeScout ? activeScout.name : 'Coach';
    
    const { updatedProfiles } = StorageEngine.toggleShortlist(activeScoutId, scoutName, talentId);
    setTalents(updatedProfiles);
    setShortlists(StorageEngine.getShortlists(activeScoutId));
  };

  // Update talent profile (e.g., after match logging or AI report update)
  const handleUpdateTalent = (updatedTalent: TalentProfile) => {
    const updatedTalents = StorageEngine.saveTalentProfile(updatedTalent);
    setTalents(updatedTalents);
  };

  const activeTalent = talents.find((t) => t.id === activeTalentId) || talents[0];
  const activeScout = scouts.find((s) => s.id === activeScoutId) || scouts[0];

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#1E1C19] flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Header
        currentRole={currentRole}
        activeTalentName={activeTalent?.name}
        activeScoutName={activeScout?.name}
        userEmail={currentUser?.email}
        onSwitchRole={handleSwitchRole}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        shortlistCount={shortlists.length}
        onViewShortlist={() => {
          setCurrentRole('scout');
          setScoutTab('shortlist');
        }}
        activeTab={scoutTab}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        
        {/* LANDING / ROLE SELECTION */}
        {currentRole === null && (
          <LandingHero
            onSelectRole={(role) => handleOpenAuth('signup', role)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* TALENT DASHBOARD */}
        {currentRole === 'talent' && activeTalent && (
          <TalentDashboard
            talent={activeTalent}
            onUpdateTalent={handleUpdateTalent}
          />
        )}

        {/* SCOUT DASHBOARD */}
        {currentRole === 'scout' && activeScout && (
          <ScoutDashboard
            scoutProfile={activeScout}
            talents={talents}
            shortlists={shortlists}
            onToggleShortlist={handleToggleShortlist}
            activeTab={scoutTab}
            onTabChange={setScoutTab}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#8C8577]/20 py-6 px-4 text-center text-xs text-[#8C8577]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-baseline gap-1">
            <span className="font-serif-heading font-bold text-[#1E1C19]">footyfolio</span>
            <span className="text-[#C9862E] font-bold">.</span>
            <span className="ml-2">— get scouted. get seen.</span>
          </div>

          <p>Built for amateur football talent across Pakistan & South Asia.</p>

          <button
            onClick={() => setIsSchemaModalOpen(true)}
            className="hover:text-[#1E1C19] underline font-medium cursor-pointer"
          >
            Supabase Postgres Schema & API Docs
          </button>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        initialRole={authRole}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <TalentOnboardingModal
        isOpen={isTalentOnboardingOpen}
        onComplete={handleTalentOnboardingComplete}
        onCancel={() => setIsTalentOnboardingOpen(false)}
      />

      <ScoutOnboardingModal
        isOpen={isScoutOnboardingOpen}
        onComplete={handleScoutOnboardingComplete}
        onCancel={() => setIsScoutOnboardingOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

    </div>
  );
}

