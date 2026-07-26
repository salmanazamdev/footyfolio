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

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  
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
  const [isTalentOnboardingOpen, setIsTalentOnboardingOpen] = useState(false);
  const [isScoutOnboardingOpen, setIsScoutOnboardingOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  // Initialize storage
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
  }, []);

  // Update shortlists when active scout changes or when toggled
  useEffect(() => {
    if (activeScoutId) {
      setShortlists(StorageEngine.getShortlists(activeScoutId));
    }
  }, [activeScoutId]);

  // Handle role selection from landing or switch
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'talent') {
      // Check if we need onboarding
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
        onSwitchRole={handleSwitchRole}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        shortlistCount={shortlists.length}
        onViewShortlist={() => {
          setCurrentRole('scout');
          setScoutTab('shortlist');
        }}
        activeTab={scoutTab}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        
        {/* LANDING / ROLE SELECTION */}
        {currentRole === null && (
          <LandingHero
            onSelectRole={(role) => {
              if (role === 'talent') {
                setIsTalentOnboardingOpen(true);
              } else {
                setIsScoutOnboardingOpen(true);
              }
            }}
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
            className="hover:text-[#1E1C19] underline font-medium"
          >
            Supabase Postgres Schema & API Docs
          </button>
        </div>
      </footer>

      {/* Modals */}
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
