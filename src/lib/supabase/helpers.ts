import { createClient } from './client';
import { TalentProfile, ScoutProfile, Match, ScoutingReport } from '../../types';
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

// 1. Get current logged in user and profile
export async function getCurrentUserProfile(): Promise<{ user: any; profile: UserProfileData | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, profile: null };
  }

  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return {
      user,
      profile: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: null,
        onboardingCompleted: false,
      },
    };
  }

  return {
    user,
    profile: {
      id: profile.id,
      email: user.email || '',
      name: profile.name || user.user_metadata?.full_name || 'User',
      role: profile.role || null,
      age: profile.age,
      city: profile.city,
      avatarUrl: profile.avatar_url,
      onboardingCompleted: !!profile.onboarding_completed,
    },
  };
}

// 2. Select initial role during onboarding
export async function selectUserRole(userId: string, role: 'talent' | 'scout', name?: string, avatarUrl?: string) {
  const supabase = createClient();
  
  // First check if profile already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .eq('id', userId)
    .single();

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      role,
      name: existing?.name || name || 'FootyFolio User',
      avatar_url: existing?.avatar_url || avatarUrl || null,
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error setting role:', error);
    throw new Error(error.message);
  }
}

// 3. Save Talent Onboarding Step 1 (Basics)
export async function saveTalentBasics(userId: string, data: { name: string; age: number; position: string; city: string }) {
  const supabase = createClient();

  // Upsert profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      role: 'talent',
      name: data.name,
      age: data.age,
      city: data.city,
    }, { onConflict: 'id' });

  if (profileError) {
    console.error('Error updating talent profile:', profileError);
    throw new Error(profileError.message);
  }

  // Upsert talent_details
  const { error: detailsError } = await supabase
    .from('talent_details')
    .upsert({
      profile_id: userId,
      position: data.position,
    });

  if (detailsError) {
    console.error('Error saving talent details:', detailsError);
    throw new Error(detailsError.message);
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

  if (error) {
    console.error('Error logging match:', error);
    throw new Error(error.message);
  }

  return data;
}

// 5. Save AI Scouting Report
export async function saveScoutingReport(userId: string, report: {
  summary: string;
  strengths: string[];
  areasToDevelop: string[];
  verdict: string;
  source?: string;
}) {
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

  if (error) {
    console.error('Error saving scouting report:', error);
    throw new Error(error.message);
  }

  return data;
}

// 6. Complete Onboarding
export async function completeOnboarding(userId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', userId);

  if (error) {
    console.error('Error completing onboarding:', error);
    throw new Error(error.message);
  }
}

// 7. Save Scout Preferences
export async function saveScoutPreferences(userId: string, data: { name: string; city: string; positions: string[] }) {
  const supabase = createClient();

  // Upsert profile basic info
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      role: 'scout',
      name: data.name,
      city: data.city,
    }, { onConflict: 'id' });

  if (profileError) {
    console.error('Error updating scout profile:', profileError);
    throw new Error(profileError.message);
  }

  // Upsert scout_preferences
  const { error: prefError } = await supabase
    .from('scout_preferences')
    .upsert({
      profile_id: userId,
      positions: data.positions,
      preferred_city: data.city,
    });

  if (prefError) {
    console.error('Error saving scout preferences:', prefError);
    throw new Error(prefError.message);
  }
}

// 8. Fetch Full Talent Profile for Dashboard
export async function getTalentProfileForUser(userId: string): Promise<TalentProfile | null> {
  if (!isSupabaseConfigured()) {
    return INITIAL_TALENT_PROFILES[0];
  }

  const supabase = createClient();

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const { data: details } = await supabase
      .from('talent_details')
      .select('*')
      .eq('profile_id', userId)
      .single();

    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });

    const { data: reports } = await supabase
      .from('scouting_reports')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

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
      createdAt: profile.created_at || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error fetching talent profile:', err);
    return INITIAL_TALENT_PROFILES[0];
  }
}

// 9. Fetch All Talents for Scout Feed
export async function getTalentsFeedForScout(): Promise<TalentProfile[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_TALENT_PROFILES;
  }

  const supabase = createClient();

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'talent');

    if (error || !profiles || profiles.length === 0) {
      return INITIAL_TALENT_PROFILES;
    }

    const talentProfiles: TalentProfile[] = [];

    for (const p of profiles) {
      const { data: details } = await supabase
        .from('talent_details')
        .select('*')
        .eq('profile_id', p.id)
        .single();

      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('profile_id', p.id)
        .order('created_at', { ascending: false });

      const { data: reports } = await supabase
        .from('scouting_reports')
        .select('*')
        .eq('profile_id', p.id)
        .order('created_at', { ascending: false })
        .limit(1);

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

      talentProfiles.push({
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
        createdAt: p.created_at || new Date().toISOString(),
      });
    }

    // Merge mock talents if fewer than 2 real profiles so scout feed remains rich during testing
    if (talentProfiles.length < 2) {
      const existingIds = new Set(talentProfiles.map(t => t.id));
      for (const mockItem of INITIAL_TALENT_PROFILES) {
        if (!existingIds.has(mockItem.id)) {
          talentProfiles.push(mockItem);
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
      .single();

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
