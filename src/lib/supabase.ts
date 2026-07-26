/**
 * FootyFolio Supabase Integration & Schema Helper
 * 
 * Provides optional Supabase Postgres client initialization and exportable DDL SQL schema.
 */

export const SUPABASE_SQL_SCHEMA = `-- FootyFolio Supabase Postgres DDL & Security Rules

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('talent', 'scout')),
  name VARCHAR(100) NOT NULL,
  age INT,
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Talent Details Table
CREATE TABLE IF NOT EXISTS public.talent_details (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  position VARCHAR(30) NOT NULL CHECK (position IN ('goalkeeper', 'defender', 'midfielder', 'forward')),
  bio TEXT,
  preferred_foot VARCHAR(20) DEFAULT 'Right'
);

-- 3. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  minutes_played INT DEFAULT 0,
  notes TEXT,
  match_date DATE DEFAULT CURRENT_DATE,
  opponent VARCHAR(100),
  result VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Scouting Reports Table
CREATE TABLE IF NOT EXISTS public.scouting_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  strengths TEXT[] NOT NULL,
  areas_to_develop TEXT[] NOT NULL,
  verdict TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Shortlists Table
CREATE TABLE IF NOT EXISTS public.shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  talent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (scout_profile_id, talent_profile_id)
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

-- Public read access for talent discovery by scouts
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Talent details viewable by everyone" ON public.talent_details FOR SELECT USING (true);
CREATE POLICY "Matches viewable by everyone" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Scouting reports viewable by everyone" ON public.scouting_reports FOR SELECT USING (true);

-- User write access restricted to profile owners
CREATE POLICY "Users can edit own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can edit own talent details" ON public.talent_details FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users can edit own matches" ON public.matches FOR ALL USING (auth.uid() = talent_profile_id);
CREATE POLICY "Scouts can manage own shortlists" ON public.shortlists FOR ALL USING (auth.uid() = scout_profile_id);
`;
