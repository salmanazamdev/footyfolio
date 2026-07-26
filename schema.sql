-- FootyFolio Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('talent', 'scout')),
  name TEXT NOT NULL,
  age INTEGER,
  city TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Talent Details Table
CREATE TABLE IF NOT EXISTS public.talent_details (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  position TEXT CHECK (position IN ('Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'goalkeeper', 'defender', 'midfielder', 'forward')),
  preferred_foot TEXT DEFAULT 'Right',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
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

-- 4. Scouting Reports Table
CREATE TABLE IF NOT EXISTS public.scouting_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  strengths JSONB NOT NULL,
  areas_to_develop JSONB NOT NULL,
  verdict TEXT NOT NULL,
  source TEXT DEFAULT 'gemini-3.6-flash',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Scout Preferences Table
CREATE TABLE IF NOT EXISTS public.scout_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  positions TEXT[] DEFAULT '{}',
  preferred_city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Shortlists Table
CREATE TABLE IF NOT EXISTS public.shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  talent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (scout_profile_id, talent_profile_id)
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scout_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running script
DROP POLICY IF EXISTS "Public profiles viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Talent details viewable by authenticated users" ON public.talent_details;
DROP POLICY IF EXISTS "Users can edit own talent details" ON public.talent_details;

DROP POLICY IF EXISTS "Matches viewable by authenticated users" ON public.matches;
DROP POLICY IF EXISTS "Users can edit own matches" ON public.matches;

DROP POLICY IF EXISTS "Scouting reports viewable by authenticated users" ON public.scouting_reports;
DROP POLICY IF EXISTS "Users can edit own scouting reports" ON public.scouting_reports;

DROP POLICY IF EXISTS "Scout preferences viewable by owner" ON public.scout_preferences;
DROP POLICY IF EXISTS "Scouts can manage own preferences" ON public.scout_preferences;

DROP POLICY IF EXISTS "Shortlists viewable by scout owner" ON public.shortlists;
DROP POLICY IF EXISTS "Scouts can manage own shortlists" ON public.shortlists;

-- 1. Profiles RLS
CREATE POLICY "Public profiles viewable by authenticated users" 
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Talent Details RLS
CREATE POLICY "Talent details viewable by authenticated users" 
  ON public.talent_details FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can edit own talent details" 
  ON public.talent_details FOR ALL TO authenticated USING (auth.uid() = profile_id);

-- 3. Matches RLS
CREATE POLICY "Matches viewable by authenticated users" 
  ON public.matches FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can edit own matches" 
  ON public.matches FOR ALL TO authenticated USING (auth.uid() = profile_id);

-- 4. Scouting Reports RLS
CREATE POLICY "Scouting reports viewable by authenticated users" 
  ON public.scouting_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can edit own scouting reports" 
  ON public.scouting_reports FOR ALL TO authenticated USING (auth.uid() = profile_id);

-- 5. Scout Preferences RLS
CREATE POLICY "Scout preferences viewable by owner" 
  ON public.scout_preferences FOR SELECT TO authenticated USING (auth.uid() = profile_id);

CREATE POLICY "Scouts can manage own preferences" 
  ON public.scout_preferences FOR ALL TO authenticated USING (auth.uid() = profile_id);

-- 6. Shortlists RLS
CREATE POLICY "Shortlists viewable by scout owner" 
  ON public.shortlists FOR SELECT TO authenticated USING (auth.uid() = scout_profile_id);

CREATE POLICY "Scouts can manage own shortlists" 
  ON public.shortlists FOR ALL TO authenticated USING (auth.uid() = scout_profile_id);
