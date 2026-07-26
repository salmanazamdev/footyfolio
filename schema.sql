-- ====================================================================
-- FootyFolio Pure Supabase Schema Script (NO SEED DATA)
-- Copy and paste this directly into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ====================================================================

-- 1. DROP OLD OR CONFLICTING TABLES & POLICIES (CLEAN SLATE)
DROP TABLE IF EXISTS public.shortlists CASCADE;
DROP TABLE IF EXISTS public.scout_preferences CASCADE;
DROP TABLE IF EXISTS public.scouting_reports CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.talent_details CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop legacy table names if they existed in older attempts
DROP TABLE IF EXISTS public.scouts CASCADE;
DROP TABLE IF EXISTS public.talents CASCADE;

-- 2. CREATE USER PROFILES TABLE
-- Primary profile record linked to Supabase Auth UUID (or generated UUID)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('talent', 'scout')),
  name TEXT NOT NULL,
  age INTEGER,
  city TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE TALENT DETAILS TABLE
-- Extra details specific to players (position, foot, bio)
CREATE TABLE public.talent_details (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  position TEXT,
  preferred_foot TEXT DEFAULT 'Right',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE MATCHES TABLE
-- Logged match performance stats created by talent
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opponent TEXT,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 0,
  notes TEXT,
  match_date DATE DEFAULT CURRENT_DATE,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE SCOUTING REPORTS TABLE
-- Generated AI analysis reports for players
CREATE TABLE public.scouting_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  areas_to_develop JSONB NOT NULL DEFAULT '[]'::jsonb,
  verdict TEXT NOT NULL,
  source TEXT DEFAULT 'gemini-3.6-flash',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE SCOUT PREFERENCES TABLE
-- Filters saved by scouts for talent search
CREATE TABLE public.scout_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  positions TEXT[] DEFAULT '{}',
  preferred_city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE SHORTLISTS TABLE
-- Scout saved players
CREATE TABLE public.shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  talent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_scout_talent_shortlist UNIQUE (scout_profile_id, talent_profile_id)
);

-- ====================================================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scout_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 9. CREATE ROW LEVEL SECURITY POLICIES
-- ====================================================================

-- Profiles
CREATE POLICY "Profiles viewable by all users" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (true);

-- Talent Details
CREATE POLICY "Talent details viewable by all users" 
  ON public.talent_details FOR SELECT USING (true);

CREATE POLICY "Users can manage own talent details" 
  ON public.talent_details FOR ALL USING (true);

-- Matches
CREATE POLICY "Matches viewable by all users" 
  ON public.matches FOR SELECT USING (true);

CREATE POLICY "Users can manage own matches" 
  ON public.matches FOR ALL USING (true);

-- Scouting Reports
CREATE POLICY "Scouting reports viewable by all users" 
  ON public.scouting_reports FOR SELECT USING (true);

CREATE POLICY "Users can manage own scouting reports" 
  ON public.scouting_reports FOR ALL USING (true);

-- Scout Preferences
CREATE POLICY "Scout preferences viewable by all users" 
  ON public.scout_preferences FOR SELECT USING (true);

CREATE POLICY "Scouts can manage own preferences" 
  ON public.scout_preferences FOR ALL USING (true);

-- Shortlists
CREATE POLICY "Shortlists viewable by all users" 
  ON public.shortlists FOR SELECT USING (true);

CREATE POLICY "Scouts can manage own shortlists" 
  ON public.shortlists FOR ALL USING (true);
