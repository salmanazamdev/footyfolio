import { createClient } from './client';
import { TalentProfile, ScoutProfile, Match, ScoutingReport, ShortlistItem } from '../../types';
import { INITIAL_TALENT_PROFILES } from '../../data/mockData';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url !== 'https://your-supabase-project.supabase.co' && !url.includes('placeholder'));
}

export interface UserProfileData {
  id: string;
  email: string;
  name: string;
  role: 'talent' | 'scout' | null;
  age?: number;
  city?: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
}

// Local Demo Session Storage Helpers
const DEMO_SESSION_KEY = 'footyfolio_demo_session';

export function getDemoUserSession(): { user: any; profile: UserProfileData } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveDemoUserSession(user: any, profile: UserProfileData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ user, profile }));
    const cookiePayload = encodeURIComponent(JSON.stringify({
      id: user.id,
      onboardingCompleted: !!profile.onboardingCompleted,
      role: profile.role || null
    }));
    document.cookie = `footyfolio_guest=${cookiePayload}; path=/; max-age=2592000; SameSite=Lax`;
  } catch (e) {
    console.error('Failed to save demo session to localStorage:', e);
  }
}

export function clearDemoUserSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DEMO_SESSION_KEY);
    document.cookie = 'footyfolio_guest=; path=/; max-age=0; SameSite=Lax';
  } catch (e) {}
}

export function isGuestId(userId?: string | null): boolean {
  if (!userId) return true;
  return userId.startsWith('guest-') || userId.startsWith('demo-') || userId === 'demo-id' || userId === 'scout-demo';
}

export function startGuestSession(role?: 'talent' | 'scout', forceNew: boolean = false): { user: any; profile: UserProfileData } {
  const existing = getDemoUserSession();
  if (existing && !forceNew) {
    return existing;
  }

  const selectedRole = role || null;
  const guestId = 'guest-' + (selectedRole || 'user') + '-' + Date.now();
  
  const guestUser = {
    id: guestId,
    email: 'guest@footyfolio.local',
    user_metadata: {
      full_name: selectedRole ? (selectedRole === 'talent' ? 'Guest Player' : 'Guest Scout') : 'Guest User',
      role: selectedRole,
      isGuest: true,
    },
  };

  const guestProfile: UserProfileData = {
    id: guestId,
    email: 'guest@footyfolio.local',
    name: selectedRole ? (selectedRole === 'talent' ? 'Guest Player' : 'Guest Scout') : 'Guest User',
    role: selectedRole,
    age: selectedRole === 'talent' ? 19 : undefined,
    city: 'Karachi',
    avatarUrl: selectedRole === 'talent' ? 'mascot:mascot-lion' : selectedRole === 'scout' ? 'mascot:mascot-eagle' : undefined,
    onboardingCompleted: false,
  };

  saveDemoUserSession(guestUser, guestProfile);
  return { user: guestUser, profile: guestProfile };
}

// Sync local guest onboarding & profile data to real Supabase account upon login/signup
export async function syncGuestDataToSupabaseUser(userId: string) {
  if (typeof window === 'undefined') return;
  const demo = getDemoUserSession();
  if (!demo || !demo.profile) return;

  const guestProfile = demo.profile;
  const baseGuestId = demo.user?.id || 'demo_guest_talent';

  // Migrate local storage matches & reports from guest ID to the target userId
  try {
    const guestMatches = localStorage.getItem('footyfolio_user_matches_' + baseGuestId) || localStorage.getItem('footyfolio_user_matches_demo_guest_talent');
    if (guestMatches && !localStorage.getItem('footyfolio_user_matches_' + userId)) {
      localStorage.setItem('footyfolio_user_matches_' + userId, guestMatches);
    }

    const guestReport = localStorage.getItem('footyfolio_user_report_' + baseGuestId) || localStorage.getItem('footyfolio_user_report_demo_guest_talent');
    if (guestReport && !localStorage.getItem('footyfolio_user_report_' + userId)) {
      localStorage.setItem('footyfolio_user_report_' + userId, guestReport);
    }

    const isGuestOnboarded = guestProfile.onboardingCompleted || 
      localStorage.getItem('footyfolio_onboarded_demo_guest_talent') === 'true' ||
      localStorage.getItem('footyfolio_onboarded_demo_guest_scout') === 'true';

    if (isGuestOnboarded) {
      localStorage.setItem('footyfolio_onboarded_' + userId, 'true');
    }
  } catch (e) {
    console.warn('Error migrating local storage guest records:', e);
  }

  if (isSupabaseConfigured() && !isGuestId(userId)) {
    try {
      const supabase = createClient();
      
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const newRole = existingProfile?.role || guestProfile.role || 'talent';
      const newName = (existingProfile?.name && existingProfile.name !== 'User' && existingProfile.name !== 'FootyFolio User') 
        ? existingProfile.name 
        : (guestProfile.name && !guestProfile.name.includes('Guest') ? guestProfile.name : (existingProfile?.name || 'FootyFolio User'));
      const newAge = existingProfile?.age || guestProfile.age || 19;
      const newCity = existingProfile?.city || guestProfile.city || 'Karachi';
      const newAvatar = existingProfile?.avatar_url || guestProfile.avatarUrl;
      
      const guestWasOnboarded = guestProfile.onboardingCompleted || 
        localStorage.getItem('footyfolio_onboarded_demo_guest_talent') === 'true' ||
        localStorage.getItem('footyfolio_onboarded_demo_guest_scout') === 'true';

      const newCompleted = Boolean(existingProfile?.onboarding_completed) || guestWasOnboarded;

      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: newRole,
          name: newName,
          age: newAge,
          city: newCity,
          avatar_url: newAvatar,
          onboarding_completed: newCompleted,
        }, { onConflict: 'id' });

      if (newCompleted) {
        localStorage.setItem('footyfolio_onboarded_' + userId, 'true');
      }

      // Sync talent position if present in guest session
      if (newRole === 'talent' && (guestProfile as any).position) {
        await supabase
          .from('talent_details')
          .upsert({
            profile_id: userId,
            position: (guestProfile as any).position,
          }, { onConflict: 'profile_id' });
      }

      // Sync scout preferences if present in guest session
      if (newRole === 'scout' && (guestProfile as any).positions) {
        await supabase
          .from('scout_preferences')
          .upsert({
            profile_id: userId,
            positions: (guestProfile as any).positions,
            preferred_city: newCity || 'Karachi',
          }, { onConflict: 'profile_id' });
      }
    } catch (e) {
      console.warn('Failed to sync guest session to Supabase account:', e);
    }
  }

  clearDemoUserSession();
}

/**
 * Directly triggers Google Sign-In and auto-syncs local storage guest data
 */
export async function triggerGoogleAuthSync(preferredRole: 'talent' | 'scout' = 'talent') {
  if (typeof window === 'undefined') return;

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectUrl = `${siteUrl.replace(/\/$/, '')}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google Auth Error:', error.message);
      alert('Google Auth Error: ' + error.message);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  } else {
    // Demo Mode: simulate instant Google OAuth sign-in & sync guest data
    const existingDemo = getDemoUserSession();
    const demoId = 'google-user-' + Date.now();
    await syncGuestDataToSupabaseUser(demoId);

    const guestProfile = existingDemo?.profile;
    const demoUser = {
      id: demoId,
      email: 'google.player@gmail.com',
      user_metadata: { full_name: guestProfile?.name && !guestProfile.name.startsWith('Guest') ? guestProfile.name : 'Google Player' },
    };
    const demoProfile = {
      id: demoId,
      email: 'google.player@gmail.com',
      name: guestProfile?.name && !guestProfile.name.startsWith('Guest') ? guestProfile.name : 'Google Player',
      role: guestProfile?.role || preferredRole,
      age: guestProfile?.age || 19,
      city: guestProfile?.city || 'Karachi',
      avatarUrl: guestProfile?.avatarUrl,
      onboardingCompleted: true,
    };
    saveDemoUserSession(demoUser, demoProfile);
    window.location.href = '/';
  }
}

// 1. Get current logged in user and profile
export async function getCurrentUserProfile(): Promise<{ user: any; profile: UserProfileData | null }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!userError && user) {
        // Sync local guest onboarding session to Supabase account if guest data exists
        await syncGuestDataToSupabaseUser(user.id);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const localCompleted = typeof window !== 'undefined' && (
          localStorage.getItem('footyfolio_onboarded_' + user.id) === 'true' ||
          localStorage.getItem('footyfolio_onboarded_demo_guest_talent') === 'true' ||
          localStorage.getItem('footyfolio_onboarded_demo_guest_scout') === 'true'
        );

        if (!profile) {
          return {
            user,
            profile: {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              role: 'talent',
              onboardingCompleted: localCompleted,
            },
          };
        }

        return {
          user,
          profile: {
            id: profile.id,
            email: user.email || '',
            name: profile.name || user.user_metadata?.full_name || 'User',
            role: profile.role || 'talent',
            age: profile.age,
            city: profile.city,
            avatarUrl: profile.avatar_url,
            onboardingCompleted: Boolean(profile.onboarding_completed) || localCompleted,
          },
        };
      }
    } catch (e) {
      console.warn('Supabase auth check failed, checking local demo session...', e);
    }
  }

  // Fallback to local demo / guest session if no authenticated Supabase user
  const demoSession = getDemoUserSession();
  if (demoSession) {
    return demoSession;
  }

  return { user: null, profile: null };
}

// 2. Select initial role during onboarding
export async function selectUserRole(userId: string, role: 'talent' | 'scout', name?: string, avatarUrl?: string) {
  if (isSupabaseConfigured() && !isGuestId(userId)) {
    try {
      const supabase = createClient();
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role,
          name: existing?.name || name || 'FootyFolio User',
          avatar_url: existing?.avatar_url || avatarUrl || null,
        }, { onConflict: 'id' });

      if (error) console.error('Error setting role in Supabase:', error);
    } catch (e) {
      console.warn('Supabase update role failed, proceeding locally:', e);
    }
  }

  // Also update demo session if active
  const demo = getDemoUserSession();
  if (demo) {
    demo.profile.role = role;
    if (name) demo.profile.name = name;
    if (!demo.profile.name || demo.profile.name === 'Guest User') {
      demo.profile.name = role === 'talent' ? 'Guest Player' : 'Guest Scout';
    }
    saveDemoUserSession(demo.user, demo.profile);
  }
}

// Update profile avatar (Base64 photo or mascot ID)
export async function updateUserProfileAvatar(userId: string, avatarUrl: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);
    } catch (e) {
      console.warn('Supabase avatar update failed, updating local state:', e);
    }
  }

  // Update demo session & local storage
  const demo = getDemoUserSession();
  if (demo && demo.user.id === userId) {
    demo.profile.avatarUrl = avatarUrl;
    saveDemoUserSession(demo.user, demo.profile);
  } else if (demo) {
    demo.profile.avatarUrl = avatarUrl;
    saveDemoUserSession(demo.user, demo.profile);
  }

  // Also store in localStorage fallback for instant reload
  if (typeof window !== 'undefined') {
    localStorage.setItem(`footyfolio_avatar_${userId}`, avatarUrl);
  }
}

// 3. Save Talent Onboarding Step 1 (Basics)
export async function saveTalentBasics(userId: string, data: { name: string; age: number; position: string; city: string; bio?: string }) {
  if (isSupabaseConfigured() && !isGuestId(userId)) {
    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: 'talent',
          name: data.name,
          age: data.age,
          city: data.city,
        }, { onConflict: 'id' });

      await supabase
        .from('talent_details')
        .upsert({
          profile_id: userId,
          position: data.position,
          bio: data.bio || '',
        }, { onConflict: 'profile_id' });
    } catch (e) {
      console.warn('Supabase save talent basics failed, updating local state:', e);
    }
  }

  // Update demo session
  const demo = getDemoUserSession();
  if (demo) {
    demo.profile.name = data.name;
    demo.profile.age = data.age;
    demo.profile.city = data.city;
    demo.profile.role = 'talent';
    (demo.profile as any).position = data.position;
    (demo.profile as any).bio = data.bio || '';
    saveDemoUserSession(demo.user, demo.profile);
  }
}

// 4. Log a match for talent
export async function saveMatchLog(userId: string, matchData: {
  opponent: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  notes: string;
  matchDate?: string;
}) {
  const newMatchItem = {
    id: 'match-' + Date.now(),
    profile_id: userId,
    opponent: matchData.opponent || 'Competitive Match',
    goals: matchData.goals || 0,
    assists: matchData.assists || 0,
    minutes_played: matchData.minutesPlayed || 0,
    notes: matchData.notes || '',
    match_date: matchData.matchDate || new Date().toISOString().split('T')[0],
  };

  if (typeof window !== 'undefined') {
    try {
      const existingKey = 'footyfolio_user_matches_' + userId;
      const raw = localStorage.getItem(existingKey);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(newMatchItem);
      localStorage.setItem(existingKey, JSON.stringify(list));
    } catch (e) {}
  }

  if (isSupabaseConfigured() && !isGuestId(userId)) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('matches')
        .insert({
          profile_id: userId,
          opponent: matchData.opponent || 'Competitive Match',
          goals: matchData.goals || 0,
          assists: matchData.assists || 0,
          minutes_played: matchData.minutesPlayed || 0,
          notes: matchData.notes || '',
          match_date: matchData.matchDate || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase match log failed, saving locally:', e);
    }
  }

  return newMatchItem;
}

// 5. Save AI Scouting Report
export async function saveScoutingReport(userId: string, report: {
  summary: string;
  strengths: string[];
  areasToDevelop: string[];
  verdict: string;
  source?: string;
}) {
  const newReportItem = {
    id: 'report-' + Date.now(),
    profile_id: userId,
    summary: report.summary,
    strengths: report.strengths,
    areas_to_develop: report.areasToDevelop,
    verdict: report.verdict,
    source: report.source || 'gemini-3.6-flash',
    created_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('footyfolio_user_report_' + userId, JSON.stringify(newReportItem));
    } catch (e) {}
  }

  if (isSupabaseConfigured() && !isGuestId(userId)) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('scouting_reports')
        .insert({
          profile_id: userId,
          summary: report.summary,
          strengths: report.strengths,
          areas_to_develop: report.areasToDevelop,
          verdict: report.verdict,
          source: report.source || 'gemini-3.6-flash',
        })
        .select()
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase scouting report save failed, returning local report:', e);
    }
  }

  return newReportItem;
}

// 6. Complete Onboarding
export async function completeOnboarding(userId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('footyfolio_onboarded_' + userId, 'true');
  }

  if (isSupabaseConfigured() && !isGuestId(userId)) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId);

      if (error) {
        console.error('Error completing onboarding in Supabase update:', error);
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            onboarding_completed: true,
          }, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('Supabase complete onboarding failed, updating demo state:', e);
    }
  }

  const demo = getDemoUserSession();
  if (demo) {
    demo.profile.onboardingCompleted = true;
    saveDemoUserSession(demo.user, demo.profile);
  }
}

// 7. Save Scout Preferences
export async function saveScoutPreferences(userId: string, data: { name: string; city: string; positions: string[] }) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('footyfolio_onboarded_' + userId, 'true');
  }

  if (isSupabaseConfigured() && !isGuestId(userId)) {
    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: 'scout',
          name: data.name,
          city: data.city,
          onboarding_completed: true,
        }, { onConflict: 'id' });

      await supabase
        .from('scout_preferences')
        .upsert({
          profile_id: userId,
          positions: data.positions,
          preferred_city: data.city,
        }, { onConflict: 'profile_id' });
    } catch (e) {
      console.warn('Supabase scout prefs save failed:', e);
    }
  }

  const demo = getDemoUserSession();
  if (demo) {
    demo.profile.name = data.name;
    demo.profile.city = data.city;
    demo.profile.role = 'scout';
    (demo.profile as any).positions = data.positions;
    demo.profile.onboardingCompleted = true;
    saveDemoUserSession(demo.user, demo.profile);
  }
}

// 8. Fetch Full Talent Profile for Dashboard
export async function getTalentProfileForUser(userId: string): Promise<TalentProfile | null> {
  const getLocalShortlistedBy = (talentId: string): string[] => {
    const scoutIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('footyfolio_shortlists_') || key === 'footyfolio_shortlists_v1')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const items: ShortlistItem[] = JSON.parse(raw);
              items.forEach((item) => {
                if (item.talentProfileId === talentId && !scoutIds.includes(item.scoutProfileId)) {
                  scoutIds.push(item.scoutProfileId);
                }
              });
            }
          }
        }
      } catch (e) {}
    }
    return scoutIds;
  };

  if (!isSupabaseConfigured() || userId.startsWith('guest-') || userId.startsWith('demo-')) {
    const demo = getDemoUserSession();
    const demoTalent = demo?.profile?.role === 'talent' ? demo.profile : null;
    const baseId = demoTalent?.id || userId || 'talent-demo';
    const localShortlistedBy = getLocalShortlistedBy(baseId);

    let localMatches: Match[] = [];
    let localReport: ScoutingReport | undefined = undefined;

    if (typeof window !== 'undefined') {
      try {
        const rawMatches = localStorage.getItem('footyfolio_user_matches_' + baseId);
        if (rawMatches) {
          const list = JSON.parse(rawMatches);
          localMatches = list.map((m: any) => ({
            id: m.id || m.profile_id + '-' + Date.now(),
            talentProfileId: baseId,
            goals: m.goals || 0,
            assists: m.assists || 0,
            minutesPlayed: m.minutesPlayed || m.minutes_played || 0,
            notes: m.notes || '',
            matchDate: m.matchDate || m.match_date || new Date().toISOString().split('T')[0],
            opponent: m.opponent || 'Competitive Match',
          }));
        }

        const rawReport = localStorage.getItem('footyfolio_user_report_' + baseId);
        if (rawReport) {
          const r = JSON.parse(rawReport);
          localReport = {
            id: r.id || 'rep-' + Date.now(),
            talentProfileId: baseId,
            summary: r.summary || '',
            strengths: Array.isArray(r.strengths) ? r.strengths : [],
            areasToDevelop: Array.isArray(r.areasToDevelop) ? r.areasToDevelop : Array.isArray(r.areas_to_develop) ? r.areas_to_develop : [],
            verdict: r.verdict || '',
            generatedAt: r.created_at || r.generatedAt || new Date().toISOString(),
          };
        }
      } catch (e) {}
    }

    return {
      id: baseId,
      userId: baseId,
      name: demoTalent?.name || 'Player',
      age: demoTalent?.age || 19,
      position: (demoTalent as any)?.position || 'Forward',
      city: demoTalent?.city || 'Karachi',
      bio: (demoTalent as any)?.bio || '',
      avatarUrl: demoTalent?.avatarUrl,
      preferredFoot: 'Right',
      matches: localMatches,
      latestReport: localReport,
      shortlistedBy: localShortlistedBy,
      createdAt: new Date().toISOString(),
    };
  }

  const supabase = createClient();

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) return null;

    const [{ data: details }, { data: matches }, { data: reports }, { data: shortlistsData }] = await Promise.all([
      supabase.from('talent_details').select('*').eq('profile_id', userId).maybeSingle(),
      supabase.from('matches').select('*').eq('profile_id', userId).order('created_at', { ascending: false }),
      supabase.from('scouting_reports').select('*').eq('profile_id', userId).order('created_at', { ascending: false }).limit(1),
      supabase.from('shortlists').select('scout_profile_id').eq('talent_profile_id', userId),
    ]);

    const formattedMatches: Match[] = (matches || []).map((m: any) => ({
      id: m.id,
      talentProfileId: userId,
      goals: m.goals || 0,
      assists: m.assists || 0,
      minutesPlayed: m.minutes_played || 0,
      notes: m.notes || '',
      matchDate: m.match_date || new Date().toISOString().split('T')[0],
      opponent: m.opponent || 'Match',
    }));

    const latestReportRaw = reports && reports[0];
    const latestReport: ScoutingReport | undefined = latestReportRaw ? {
      id: latestReportRaw.id,
      talentProfileId: userId,
      summary: latestReportRaw.summary,
      strengths: Array.isArray(latestReportRaw.strengths) ? latestReportRaw.strengths : [],
      areasToDevelop: Array.isArray(latestReportRaw.areas_to_develop) ? latestReportRaw.areas_to_develop : [],
      verdict: latestReportRaw.verdict,
      generatedAt: latestReportRaw.created_at || new Date().toISOString(),
    } : undefined;

    let shortlistedBy: string[] = (shortlistsData || []).map((s: any) => s.scout_profile_id);
    const localBy = getLocalShortlistedBy(userId);
    localBy.forEach((sId) => {
      if (!shortlistedBy.includes(sId)) {
        shortlistedBy.push(sId);
      }
    });

    return {
      id: profile.id,
      userId: profile.id,
      name: profile.name || 'Player',
      age: profile.age || 18,
      position: (details?.position as any) || 'forward',
      city: profile.city || 'Karachi',
      bio: details?.bio || 'Amateur footballer building scouting profile on FootyFolio.',
      avatarUrl: profile.avatar_url,
      preferredFoot: details?.preferred_foot || 'Right',
      matches: formattedMatches,
      latestReport,
      shortlistedBy,
      createdAt: profile.created_at || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error fetching talent profile:', err);
    return null;
  }
}

// 9. Fetch All Talents for Scout Feed
export async function getTalentsFeedForScout(): Promise<TalentProfile[]> {
  const getLocalShortlistedBy = (talentId: string): string[] => {
    const scoutIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('footyfolio_shortlists_') || key === 'footyfolio_shortlists_v1')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const items: ShortlistItem[] = JSON.parse(raw);
              items.forEach((item) => {
                if (item.talentProfileId === talentId && !scoutIds.includes(item.scoutProfileId)) {
                  scoutIds.push(item.scoutProfileId);
                }
              });
            }
          }
        }
      } catch (e) {}
    }
    return scoutIds;
  };

  if (!isSupabaseConfigured()) {
    return INITIAL_TALENT_PROFILES.map((t) => ({
      ...t,
      shortlistedBy: getLocalShortlistedBy(t.id),
    }));
  }

  const supabase = createClient();

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'talent');

    if (error || !profiles || profiles.length === 0) {
      return INITIAL_TALENT_PROFILES.map((t) => ({
        ...t,
        shortlistedBy: getLocalShortlistedBy(t.id),
      }));
    }

    const talentProfiles: TalentProfile[] = await Promise.all(
      profiles.map(async (p) => {
        const [detailsRes, matchesRes, reportsRes, shortlistsRes] = await Promise.all([
          supabase.from('talent_details').select('*').eq('profile_id', p.id).maybeSingle(),
          supabase.from('matches').select('*').eq('profile_id', p.id).order('created_at', { ascending: false }),
          supabase.from('scouting_reports').select('*').eq('profile_id', p.id).order('created_at', { ascending: false }).limit(1),
          supabase.from('shortlists').select('scout_profile_id').eq('talent_profile_id', p.id),
        ]);

        const details = detailsRes.data;
        const matches = matchesRes.data;
        const reports = reportsRes.data;

        const formattedMatches: Match[] = (matches || []).map((m: any) => ({
          id: m.id,
          talentProfileId: p.id,
          goals: m.goals || 0,
          assists: m.assists || 0,
          minutesPlayed: m.minutes_played || 0,
          notes: m.notes || '',
          matchDate: m.match_date || new Date().toISOString().split('T')[0],
          opponent: m.opponent || 'Match',
        }));

        const latestReportRaw = reports && reports[0];
        const latestReport: ScoutingReport | undefined = latestReportRaw ? {
          id: latestReportRaw.id,
          talentProfileId: p.id,
          summary: latestReportRaw.summary,
          strengths: Array.isArray(latestReportRaw.strengths) ? latestReportRaw.strengths : [],
          areasToDevelop: Array.isArray(latestReportRaw.areas_to_develop) ? latestReportRaw.areas_to_develop : [],
          verdict: latestReportRaw.verdict,
          generatedAt: latestReportRaw.created_at || new Date().toISOString(),
        } : undefined;

        let shortlistedBy: string[] = (shortlistsRes.data || []).map((s: any) => s.scout_profile_id);
        const localBy = getLocalShortlistedBy(p.id);
        localBy.forEach((sId) => {
          if (!shortlistedBy.includes(sId)) shortlistedBy.push(sId);
        });

        return {
          id: p.id,
          userId: p.id,
          name: p.name || 'Talent Player',
          age: p.age || 18,
          position: (details?.position as any) || 'forward',
          city: p.city || 'Karachi',
          bio: details?.bio || 'Talented amateur player logged on FootyFolio.',
          avatarUrl: p.avatar_url,
          preferredFoot: details?.preferred_foot || 'Right',
          matches: formattedMatches,
          latestReport,
          shortlistedBy,
          createdAt: p.created_at || new Date().toISOString(),
        };
      })
    );

    // Merge mock talents if fewer than 2 real profiles so scout feed remains rich during testing
    if (talentProfiles.length < 2) {
      const existingIds = new Set(talentProfiles.map(t => t.id));
      for (const mockItem of INITIAL_TALENT_PROFILES) {
        if (!existingIds.has(mockItem.id)) {
          talentProfiles.push({
            ...mockItem,
            shortlistedBy: getLocalShortlistedBy(mockItem.id),
          });
        }
      }
    }

    return talentProfiles;
  } catch (err) {
    console.error('Error fetching scout feed:', err);
    return INITIAL_TALENT_PROFILES;
  }
}

// Fetch Profile for user ID
export async function getUserProfile(userId: string): Promise<{ profile: any; details?: any } | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) return null;
    const { data: details } = await supabase.from('talent_details').select('*').eq('profile_id', userId).single();
    return { profile, details };
  } catch (err) {
    return null;
  }
}

// 10. Fetch Scout Preferences
export async function getScoutPreferences(userId: string): Promise<ScoutProfile | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: 'scout-demo',
      userId,
      name: 'Professional Scout',
      targetPositions: ['forward', 'midfielder'],
      targetCities: ['Karachi', 'Lahore', 'Islamabad'],
      createdAt: new Date().toISOString(),
    };
  }

  const supabase = createClient();

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: prefs } = await supabase
      .from('scout_preferences')
      .select('*')
      .eq('profile_id', userId)
      .maybeSingle();

    return {
      id: userId,
      userId,
      name: profile?.name || 'Scout',
      organization: 'Independent Scout',
      targetPositions: prefs?.positions || ['forward', 'midfielder', 'defender', 'goalkeeper'],
      targetCities: prefs?.preferred_city ? [prefs.preferred_city] : ['Karachi', 'Lahore', 'Islamabad'],
      createdAt: profile?.created_at || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error fetching scout preferences:', err);
    return null;
  }
}

// 11. Fetch Shortlists for Scout
export async function getShortlistsForScout(scoutUserId: string): Promise<ShortlistItem[]> {
  const localKey = 'footyfolio_shortlists_' + scoutUserId;
  let localItems: ShortlistItem[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) localItems = JSON.parse(raw);
    } catch (e) {}
  }

  if (!isSupabaseConfigured()) {
    return localItems;
  }

  const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid(scoutUserId)) {
    return localItems;
  }

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('shortlists')
      .select('*')
      .eq('scout_profile_id', scoutUserId);

    if (error || !data) {
      if (error) console.warn('Supabase getShortlists error:', error.message);
      return localItems;
    }

    const fetched: ShortlistItem[] = data.map((item: any) => ({
      id: item.id,
      scoutProfileId: item.scout_profile_id,
      scoutName: 'Scout',
      talentProfileId: item.talent_profile_id,
      notes: item.notes || 'Shortlisted player',
      createdAt: item.created_at || new Date().toISOString(),
    }));

    // Sync to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(localKey, JSON.stringify(fetched));
    }

    return fetched;
  } catch (err) {
    console.error('Error fetching shortlists from Supabase:', err);
    return localItems;
  }
}

// 12. Toggle Shortlist in Supabase & LocalStorage
export async function toggleShortlistInSupabase(
  scoutUserId: string,
  talentId: string,
  isCurrentlyShortlisted: boolean,
  talentName?: string
): Promise<void> {
  const localKey = 'footyfolio_shortlists_' + scoutUserId;
  if (typeof window !== 'undefined') {
    try {
      let currentLocal: ShortlistItem[] = [];
      const raw = localStorage.getItem(localKey);
      if (raw) currentLocal = JSON.parse(raw);

      if (isCurrentlyShortlisted) {
        currentLocal = currentLocal.filter((s) => s.talentProfileId !== talentId);
      } else {
        const newItem: ShortlistItem = {
          id: 'sl-' + Date.now(),
          scoutProfileId: scoutUserId,
          scoutName: 'Scout',
          talentProfileId: talentId,
          notes: `Shortlisted ${talentName || 'Player'}`,
          createdAt: new Date().toISOString(),
        };
        currentLocal = [newItem, ...currentLocal.filter((s) => s.talentProfileId !== talentId)];
      }
      localStorage.setItem(localKey, JSON.stringify(currentLocal));
    } catch (e) {
      console.warn('LocalStorage shortlist update failed:', e);
    }
  }

  if (isSupabaseConfigured()) {
    const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (!isUuid(scoutUserId) || !isUuid(talentId)) {
      console.warn('Cannot persist shortlist to Supabase: scoutUserId or talentId is not a valid UUID.', { scoutUserId, talentId });
      return;
    }

    const supabase = createClient();
    try {
      // 1. Ensure scout profile exists in public.profiles table
      const { data: scoutProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', scoutUserId)
        .maybeSingle();

      if (!scoutProfile) {
        await supabase
          .from('profiles')
          .upsert({
            id: scoutUserId,
            role: 'scout',
            name: 'Scout',
            onboarding_completed: true
          }, { onConflict: 'id' });
      }

      // 2. Ensure talent profile exists in public.profiles table
      const { data: talentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', talentId)
        .maybeSingle();

      if (!talentProfile) {
        await supabase
          .from('profiles')
          .upsert({
            id: talentId,
            role: 'talent',
            name: talentName || 'Player',
            onboarding_completed: true
          }, { onConflict: 'id' });
      }

      // 3. Perform toggle in public.shortlists table
      if (isCurrentlyShortlisted) {
        const { error: deleteErr } = await supabase
          .from('shortlists')
          .delete()
          .eq('scout_profile_id', scoutUserId)
          .eq('talent_profile_id', talentId);

        if (deleteErr) {
          console.error('Error deleting shortlist from Supabase:', deleteErr);
        }
      } else {
        const { error: insertErr } = await supabase
          .from('shortlists')
          .upsert(
            {
              scout_profile_id: scoutUserId,
              talent_profile_id: talentId,
              notes: `Shortlisted ${talentName || 'Player'}`,
            },
            { onConflict: 'scout_profile_id,talent_profile_id' }
          );

        if (insertErr) {
          console.error('Error upserting shortlist to Supabase:', insertErr);
        }
      }
    } catch (err) {
      console.error('Supabase shortlist toggle exception:', err);
    }
  }
}
