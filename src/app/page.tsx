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
    if (talentData) {
      setTalentData({ ...talentData, avatarUrl: newAvatarUrl });
    }
    if (scoutData) {
      setScoutData({ ...scoutData, avatarUrl: newAvatarUrl });
    }

    const userId = userProfile?.id || 'demo-user';
    await updateUserProfileAvatar(userId, newAvatarUrl);
  };

  const handleSaveFullProfile = async (updated: ProfileData) => {
    const userId = userProfile?.id || 'demo-user';

    // 1. Update user profile state
    setUserProfile((prev: any) => ({
      ...prev,
      name: updated.name,
      city: updated.city || prev?.city,
      age: updated.age || prev?.age,
      avatarUrl: updated.avatarUrl || prev?.avatarUrl,
    }));

    // 2. Update role specific state
    if (currentRole === 'talent' && talentData) {
      const updatedTalent: TalentProfile = {
        ...talentData,
        name: updated.name,
        bio: updated.bio || '',
        city: updated.city || talentData.city,
        age: updated.age || talentData.age,
        position: updated.position || talentData.position,
        avatarUrl: updated.avatarUrl || talentData.avatarUrl,
      };
      setTalentData(updatedTalent);
    } else if (currentRole === 'scout') {
      const updatedScout: ScoutProfile = {
        id: scoutData?.id || 'scout-' + userId,
        userId: userId,
        name: updated.name,
        organization: updated.organization || scoutData?.organization || 'Independent Scout',
        avatarUrl: updated.avatarUrl || scoutData?.avatarUrl,
        targetPositions: scoutData?.targetPositions || ['forward', 'midfielder'],
        targetCities: scoutData?.targetCities || ['Karachi', 'Lahore'],
        createdAt: scoutData?.createdAt || new Date().toISOString(),
      };
      setScoutData(updatedScout);
    }

    // 3. Persist via helper
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
