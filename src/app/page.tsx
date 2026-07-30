'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { TalentDashboard } from '../components/TalentDashboard';
import { ScoutDashboard } from '../components/ScoutDashboard';
import { SupabaseConfigModal } from '../components/SupabaseConfigModal';
import { createClient } from '../lib/supabase/client';
import { getCurrentUserProfile, getTalentProfileForUser, getTalentsFeedForScout, getScoutPreferences, isSupabaseConfigured, saveMatchLog, saveScoutingReport, getShortlistsForScout, toggleShortlistInSupabase } from '../lib/supabase/helpers';
import { TalentProfile, ScoutProfile, ShortlistItem, Match, ScoutingReport } from '../types';
import { LogOut, AlertTriangle, UserCheck, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<'talent' | 'scout' | null>(null);

  // Dashboard state
  const [talentData, setTalentData] = useState<TalentProfile | null>(null);
  const [scoutData, setScoutData] = useState<ScoutProfile | null>(null);
  const [talentsFeed, setTalentsFeed] = useState<TalentProfile[]>([]);
  const [shortlists, setShortlists] = useState<ShortlistItem[]>([]);
  const [scoutTab, setScoutTab] = useState<'feed' | 'shortlist'>('feed');

  // Modals
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    async function initDashboard() {
      setLoading(true);

      try {
        if (!supabaseConfigured) {
          // Fallback if Supabase credentials are missing
          setCurrentRole('talent');
          const mockTalent = await getTalentProfileForUser('demo-id');
          if (mockTalent) setTalentData(mockTalent);
          const feed = await getTalentsFeedForScout();
          setTalentsFeed(feed);
          const sls = await getShortlistsForScout('scout-demo');
          setShortlists(sls);
          setLoading(false);
          return;
        }

        const { user, profile } = await getCurrentUserProfile();

        if (!user) {
          router.push('/login');
          return;
        }

        setUserProfile(profile);

        if (!profile || !profile.onboardingCompleted) {
          router.push('/onboarding');
          return;
        }

        const userRole = profile.role || 'talent';
        setCurrentRole(userRole);

        if (userRole === 'talent') {
          const tProfile = await getTalentProfileForUser(user.id);
          if (tProfile) {
            setTalentData(tProfile);
          }
        } else {
          const sProfile = await getScoutPreferences(user.id);
          if (sProfile) {
            setScoutData(sProfile);
          }
          const feed = await getTalentsFeedForScout();
          setTalentsFeed(feed);
          const sls = await getShortlistsForScout(user.id);
          setShortlists(sls);
        }
      } catch (err) {
        console.error('Error initializing dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [router, supabaseConfigured]);

  const handleLogout = async () => {
    try {
      if (supabaseConfigured) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      router.push('/login');
    }
  };

  const handleUpdateTalent = async (updated: TalentProfile) => {
    setTalentData(updated);

    // Persist new match and report to Supabase if user is logged in
    if (userProfile?.id && supabaseConfigured) {
      try {
        if (updated.matches.length > 0) {
          const latestMatch = updated.matches[0];
          await saveMatchLog(userProfile.id, {
            opponent: latestMatch.opponent || 'Match',
            goals: latestMatch.goals,
            assists: latestMatch.assists,
            minutesPlayed: latestMatch.minutesPlayed,
            notes: latestMatch.notes,
            matchDate: latestMatch.matchDate,
          });
        }
        if (updated.latestReport) {
          await saveScoutingReport(userProfile.id, {
            summary: updated.latestReport.summary,
            strengths: updated.latestReport.strengths,
            areasToDevelop: updated.latestReport.areasToDevelop,
            verdict: updated.latestReport.verdict,
          });
        }
      } catch (err) {
        console.error('Error saving match update to Supabase:', err);
      }
    }
  };

  const handleToggleShortlist = async (talentId: string) => {
    const userId = userProfile?.id || 'scout-demo';
    const scoutId = scoutData?.id || userId;
    const isCurrentlyShortlisted = shortlists.some((s) => s.talentProfileId === talentId);
    
    // 1. Optimistic shortlists state update
    let updatedShortlists: ShortlistItem[];
    if (isCurrentlyShortlisted) {
      updatedShortlists = shortlists.filter((s) => s.talentProfileId !== talentId);
    } else {
      const talent = talentsFeed.find((t) => t.id === talentId);
      const newItem: ShortlistItem = {
        id: 'sl-' + Date.now(),
        scoutProfileId: scoutId,
        scoutName: scoutData?.name || 'Scout',
        talentProfileId: talentId,
        notes: talent ? `Shortlisted ${talent.name} (${talent.position}, ${talent.city})` : 'Shortlisted player',
        createdAt: new Date().toISOString(),
      };
      updatedShortlists = [newItem, ...shortlists];
    }
    setShortlists(updatedShortlists);

    // 2. Update talentsFeed state so talent cards have fresh shortlistedBy
    setTalentsFeed((prevFeed) =>
      prevFeed.map((t) => {
        if (t.id === talentId) {
          const currentList = t.shortlistedBy || [];
          const newList = isCurrentlyShortlisted
            ? currentList.filter((id) => id !== scoutId)
            : Array.from(new Set([...currentList, scoutId]));
          return { ...t, shortlistedBy: newList };
        }
        return t;
      })
    );

    // 3. Update talentData state if current user's profile matches
    if (talentData) {
      if (talentData.id === talentId || talentData.userId === talentId) {
        const currentList = talentData.shortlistedBy || [];
        const newList = isCurrentlyShortlisted
          ? currentList.filter((id) => id !== scoutId)
          : Array.from(new Set([...currentList, scoutId]));
        setTalentData({ ...talentData, shortlistedBy: newList });
      }
    }

    // 4. Persist in Supabase and LocalStorage
    const talent = talentsFeed.find((t) => t.id === talentId);
    await toggleShortlistInSupabase(userId, talentId, isCurrentlyShortlisted, talent?.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#16A34A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-[#6B7280]">Loading FootyFolio Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* Configuration Alert Banner if Supabase URL is missing */}
      {!supabaseConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-3 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Supabase Setup Warning:</strong> Add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in project settings to enable real authentication and persistence.
            </span>
          </div>
          <button
            onClick={() => setIsSchemaModalOpen(true)}
            className="px-2.5 py-1 bg-amber-800 text-white font-semibold rounded-lg text-[11px] shrink-0 hover:bg-amber-900 cursor-pointer"
          >
            View SQL Schema
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentRole={currentRole}
        activeTalentName={talentData?.name || userProfile?.name}
        activeScoutName={scoutData?.name || userProfile?.name}
        userEmail={userProfile?.email}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        shortlistCount={shortlists.length}
        onViewShortlist={() => setScoutTab('shortlist')}
        activeTab={scoutTab}
      />

      {/* User Account Bar */}
      <div className="bg-white border-b border-[#E5E7EB] px-4 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#6B7280]">
            <span className="font-semibold text-[#111827]">{userProfile?.name || talentData?.name || scoutData?.name || 'Account'}</span>
            <span>•</span>
            <span>{userProfile?.email || 'Authenticated User'}</span>
            <span className="hidden sm:inline">•</span>
            <span className={`hidden sm:inline px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
              currentRole === 'talent' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#D97706]/10 text-[#D97706]'
            }`}>
              {currentRole === 'talent' ? 'Player Profile' : 'Scout Profile'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            id="btn-header-logout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Views */}
      <main className="flex-1">
        {currentRole === 'talent' && talentData ? (
          <TalentDashboard
            talent={talentData}
            userEmail={userProfile?.email}
            onUpdateTalent={handleUpdateTalent}
          />
        ) : (
          <ScoutDashboard
            scoutProfile={
              scoutData || {
                id: 'scout-default',
                userId: userProfile?.id || 'scout-1',
                name: userProfile?.name || 'Scout',
                organization: 'Independent Scout',
                targetPositions: ['forward', 'midfielder'],
                targetCities: ['Karachi', 'Lahore'],
                createdAt: new Date().toISOString(),
              }
            }
            talents={talentsFeed}
            shortlists={shortlists}
            onToggleShortlist={handleToggleShortlist}
            activeTab={scoutTab}
            onTabChange={setScoutTab}
          />
        )}
      </main>

      {/* Schema / Info Modal */}
      <SupabaseConfigModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

    </div>
  );
}
