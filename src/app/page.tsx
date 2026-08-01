'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { TalentDashboard } from '../components/TalentDashboard';
import { ScoutDashboard } from '../components/ScoutDashboard';
import { SupabaseConfigModal } from '../components/SupabaseConfigModal';
import { AvatarSelectorModal, ProfileData } from '../components/AvatarSelectorModal';
import { AuthModal } from '../components/AuthModal';
import { LandingPage } from '../components/LandingPage';
import { createClient } from '../lib/supabase/client';
import { getCurrentUserProfile, getTalentProfileForUser, getTalentsFeedForScout, getScoutPreferences, isSupabaseConfigured, saveMatchLog, saveScoutingReport, getShortlistsForScout, toggleShortlistInSupabase, updateUserProfileAvatar, updateUserProfileFull, clearDemoUserSession, startGuestSession } from '../lib/supabase/helpers';
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
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>(null);

  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    async function initDashboard() {
      setLoading(true);

      try {
        const { user, profile } = await getCurrentUserProfile();

        // If no real user and no guest session exists in localStorage, show LandingPage
        if (!user || !profile) {
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setUserProfile(profile);

        if (!profile.onboardingCompleted) {
          setLoading(false);
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
        setUserProfile(null);
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [router, supabaseConfigured]);

  const handleLogout = async () => {
    try {
      clearDemoUserSession();
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

  const handleUpdateAvatar = async (newAvatarUrl: string) => {
    setUserProfile((prev: any) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : { avatarUrl: newAvatarUrl }));
    setTalentData((prev) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : prev));
    setScoutData((prev) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : prev));

    const userId = userProfile?.id || 'demo-user';
    await updateUserProfileAvatar(userId, newAvatarUrl);
  };

  const handleSaveFullProfile = async (updated: ProfileData) => {
    const userId = userProfile?.id || 'demo-user';

    // 1. Update user profile state
    setUserProfile((prev: any) => ({
      ...(prev || {}),
      name: updated.name,
      city: updated.city || prev?.city,
      age: updated.age || prev?.age,
      avatarUrl: updated.avatarUrl || prev?.avatarUrl,
    }));

    // 2. Update role specific state
    if (currentRole === 'talent') {
      setTalentData((prev) => {
        const base: TalentProfile = prev || {
          id: userId,
          userId: userId,
          name: updated.name,
          age: updated.age || 19,
          position: updated.position || 'forward',
          city: updated.city || 'Lahore',
          bio: updated.bio || '',
          avatarUrl: updated.avatarUrl,
          preferredFoot: 'Right',
          matches: [],
          shortlistedBy: [],
          createdAt: new Date().toISOString(),
        };

        return {
          ...base,
          name: updated.name,
          bio: updated.bio !== undefined ? updated.bio : base.bio,
          city: updated.city || base.city,
          age: updated.age || base.age,
          position: updated.position || base.position,
          avatarUrl: updated.avatarUrl || base.avatarUrl,
        };
      });
    } else if (currentRole === 'scout') {
      setScoutData((prev) => ({
        id: prev?.id || 'scout-' + userId,
        userId: userId,
        name: updated.name,
        organization: updated.organization || prev?.organization || 'Independent Scout',
        avatarUrl: updated.avatarUrl || prev?.avatarUrl,
        targetPositions: prev?.targetPositions || ['forward', 'midfielder'],
        targetCities: prev?.targetCities || ['Karachi', 'Lahore'],
        createdAt: prev?.createdAt || new Date().toISOString(),
      }));
    }

    // 3. Update talents feed state if talent item exists
    setTalentsFeed((prevFeed) =>
      prevFeed.map((item) =>
        item.userId === userId || item.id === userId
          ? {
              ...item,
              name: updated.name,
              bio: updated.bio !== undefined ? updated.bio : item.bio,
              city: updated.city || item.city,
              age: updated.age || item.age,
              position: updated.position || item.position,
              avatarUrl: updated.avatarUrl || item.avatarUrl,
            }
          : item
      )
    );

    // 4. Persist via helper
    await updateUserProfileFull(userId, currentRole, {
      name: updated.name,
      bio: updated.bio,
      city: updated.city,
      age: updated.age,
      position: updated.position,
      organization: updated.organization,
      avatarUrl: updated.avatarUrl,
    });
  };

  const handleUpdateTalent = async (updated: TalentProfile) => {
    setTalentData(updated);

    const userId = userProfile?.id || updated.userId || updated.id;

    // Update in talentsFeed as well
    setTalentsFeed((prevFeed) =>
      prevFeed.map((item) =>
        item.userId === userId || item.id === userId
          ? {
              ...item,
              matches: updated.matches,
              latestReport: updated.latestReport || item.latestReport,
            }
          : item
      )
    );

    // Save matches list to LocalStorage
    if (userId && typeof window !== 'undefined') {
      try {
        const matchesStorageKey = 'footyfolio_user_matches_' + userId;
        const mappedForStorage = updated.matches.map((m) => ({
          id: m.id,
          profile_id: userId,
          opponent: m.opponent,
          goals: m.goals,
          assists: m.assists,
          minutes_played: m.minutesPlayed,
          notes: m.notes,
          match_date: m.matchDate,
        }));
        localStorage.setItem(matchesStorageKey, JSON.stringify(mappedForStorage));
      } catch (e) {}
    }

    // Persist to Supabase if user is logged in
    if (userId && supabaseConfigured) {
      try {
        for (const m of updated.matches) {
          await saveMatchLog(userId, {
            id: m.id,
            opponent: m.opponent || 'Match',
            goals: m.goals,
            assists: m.assists,
            minutesPlayed: m.minutesPlayed,
            notes: m.notes,
            matchDate: m.matchDate,
          });
        }
        if (updated.latestReport) {
          await saveScoutingReport(userId, {
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

  if (!userProfile) {
    return <LandingPage onGuestLogin={() => router.push('/onboarding')} />;
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
        avatarUrl={userProfile?.avatarUrl || talentData?.avatarUrl}
        isGuest={Boolean(userProfile?.id?.startsWith('guest-'))}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        shortlistCount={shortlists.length}
        onViewShortlist={() => setScoutTab('shortlist')}
        activeTab={scoutTab}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        onLogout={handleLogout}
      />

      {/* Main Dashboard Views */}
      <main className="flex-1">
        {currentRole === 'talent' && talentData ? (
          <TalentDashboard
            talent={talentData}
            onUpdateTalent={handleUpdateTalent}
            onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
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
            onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
          />
        )}
      </main>

      {/* Schema / Info Modal */}
      <SupabaseConfigModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

      {/* Edit Profile & Mascot Selector Modal */}
      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={userProfile?.avatarUrl || talentData?.avatarUrl || scoutData?.avatarUrl}
        profile={{
          name: talentData?.name || scoutData?.name || userProfile?.name || '',
          bio: talentData?.bio || '',
          city: talentData?.city || userProfile?.city || 'Lahore',
          age: talentData?.age || userProfile?.age || 19,
          position: talentData?.position || 'forward',
          organization: scoutData?.organization || 'Independent Scout',
          avatarUrl: userProfile?.avatarUrl || talentData?.avatarUrl || scoutData?.avatarUrl,
          role: currentRole,
        }}
        onSelectAvatar={handleUpdateAvatar}
        onSaveProfile={handleSaveFullProfile}
      />

      {/* Cloud Account Sync / Auth Modal */}
      <AuthModal
        isOpen={!!authModalMode}
        initialMode={authModalMode || 'signup'}
        initialRole={currentRole || 'talent'}
        onClose={() => setAuthModalMode(null)}
        onSuccess={() => {
          setAuthModalMode(null);
          window.location.reload();
        }}
      />

    </div>
  );
}
