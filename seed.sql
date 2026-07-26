-- ====================================================================
-- FootyFolio Supabase Seed Data Script
-- Run this AFTER running schema.sql in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ====================================================================

-- 1. SEED PROFILES (Talents & Scouts)
INSERT INTO public.profiles (id, role, name, age, city, avatar_url, onboarding_completed)
VALUES 
  (
    'a1b2c3d4-0001-4000-8000-000000000001', 
    'talent', 
    'Hamza Khan', 
    19, 
    'Lahore', 
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=250', 
    true
  ),
  (
    'a1b2c3d4-0002-4000-8000-000000000002', 
    'talent', 
    'Zain Ul Abideen', 
    21, 
    'Karachi', 
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', 
    true
  ),
  (
    'a1b2c3d4-0003-4000-8000-000000000003', 
    'talent', 
    'Bilal Chaudhry', 
    18, 
    'Islamabad', 
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250', 
    true
  ),
  (
    'a1b2c3d4-0004-4000-8000-000000000004', 
    'scout', 
    'Coach Rashid', 
    42, 
    'Lahore', 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', 
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 2. SEED TALENT DETAILS (Position, Preferred Foot, Bio)
INSERT INTO public.talent_details (profile_id, position, preferred_foot, bio)
VALUES
  (
    'a1b2c3d4-0001-4000-8000-000000000001', 
    'forward', 
    'Right', 
    'Pacey central striker with sharp movement off the ball. Playing for Model Town FC in Lahore division.'
  ),
  (
    'a1b2c3d4-0002-4000-8000-000000000002', 
    'midfielder', 
    'Left', 
    'Deep-lying playmaker with exceptional vision and pass distribution. Karachi Premier League standout.'
  ),
  (
    'a1b2c3d4-0003-4000-8000-000000000003', 
    'defender', 
    'Right', 
    'Strong centre-back with dominant aerial presence and clean tackling record in local youth tournaments.'
  )
ON CONFLICT (profile_id) DO NOTHING;

-- 3. SEED MATCH LOGS
INSERT INTO public.matches (profile_id, opponent, goals, assists, minutes_played, notes, match_date, result)
VALUES
  (
    'a1b2c3d4-0001-4000-8000-000000000001', 
    'Gulberg United', 
    2, 
    1, 
    85, 
    'Played striker. Scored header and clinical finish inside the box.', 
    '2026-07-20', 
    '3-1 Win'
  ),
  (
    'a1b2c3d4-0001-4000-8000-000000000001', 
    'Defence FC', 
    1, 
    0, 
    90, 
    'High pressing game vs Defence FC. Scored counter-attack goal.', 
    '2026-07-12', 
    '1-0 Win'
  ),
  (
    'a1b2c3d4-0002-4000-8000-000000000002', 
    'Lyari Strikers', 
    0, 
    2, 
    90, 
    'Controlled game tempo. 88% pass completion, set up winning goal.', 
    '2026-07-22', 
    '2-1 Win'
  ),
  (
    'a1b2c3d4-0003-4000-8000-000000000003', 
    'Rawalpindi Lions', 
    1, 
    0, 
    90, 
    'Clean sheet. Scored powering header from corner kick.', 
    '2026-07-19', 
    '1-0 Win'
  );

-- 4. SEED SCOUTING REPORTS (AI Evaluations)
INSERT INTO public.scouting_reports (profile_id, summary, strengths, areas_to_develop, verdict, source)
VALUES
  (
    'a1b2c3d4-0001-4000-8000-000000000001', 
    'Hamza Khan demonstrates high goal-involvement efficiency. His off-the-ball runs make him a constant threat inside the penalty area.',
    '["Clinical finishing inside 18-yard box", "Intelligent lateral movement", "Effective crossing from right flank"]'::jsonb,
    '["Sustaining high-intensity pressing beyond 75 minutes", "Physical aerial duels against taller defenders"]'::jsonb,
    'High-potential attacking prospect for regional academy trials.',
    'gemini-3.6-flash'
  ),
  (
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Zain is a technically gifted central midfielder who excels at dictating game tempo from deep positions.',
    '["Exceptional vision and range of passing", "Calm under defensive pressure", "Dangerous set-piece execution"]'::jsonb,
    '["Defensive mobility and recovery speed", "Box-to-box stamina in hot weather"]'::jsonb,
    'Ready for higher-tier competitive league trials.',
    'gemini-3.6-flash'
  );

-- 5. SEED SCOUT PREFERENCES
INSERT INTO public.scout_preferences (profile_id, positions, preferred_city)
VALUES
  (
    'a1b2c3d4-0004-4000-8000-000000000004',
    ARRAY['forward', 'midfielder'],
    'Lahore'
  )
ON CONFLICT (profile_id) DO NOTHING;

-- 6. SEED SHORTLISTS
INSERT INTO public.shortlists (scout_profile_id, talent_profile_id, notes)
VALUES
  (
    'a1b2c3d4-0004-4000-8000-000000000004',
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Top priority forward target for upcoming regional tournament.'
  )
ON CONFLICT (scout_profile_id, talent_profile_id) DO NOTHING;
