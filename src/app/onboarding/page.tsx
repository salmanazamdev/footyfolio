'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserProfile, selectUserRole, saveTalentBasics, saveMatchLog, saveScoutingReport, completeOnboarding, saveScoutPreferences } from '../../lib/supabase/helpers';
import { UserCheck, Shield, ArrowRight, CheckCircle2, AlertCircle, PlusCircle, Sparkles, Trophy, Search, MapPin, User, ChevronRight, Activity, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../../components/Logo';

const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Quetta',
  'Faisalabad',
  'Multan',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Sukkur',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Mardan',
  'Larkana',
  'Sheikhupura',
  'Gujrat',
  'Sahiwal',
  'Mirpur (AJK)',
  'Gilgit',
  'Skardu',
  'Other',
];

export default function OnboardingPage() {
  const router = useRouter();

  // User and profile state
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<'talent' | 'scout' | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [savingStep, setSavingStep] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Talent Step 1 State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<string>('19');
  const [position, setPosition] = useState<string>('Forward');
  const [city, setCity] = useState('Karachi');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [bio, setBio] = useState('');

  // Talent Step 2 State
  const [opponent, setOpponent] = useState('');
  const [goals, setGoals] = useState<string>('0');
  const [assists, setAssists] = useState<string>('0');
  const [minutesPlayed, setMinutesPlayed] = useState<string>('90');
  const [tacticalNotes, setTacticalNotes] = useState('');

  // Talent Step 3 State (AI Report)
  const [generatingReport, setGeneratingReport] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [aiReport, setAiReport] = useState<{ summary: string; strengths: string[]; areasToDevelop: string[]; verdict: string } | null>(null);

  // Scout Step State
  const [selectedPositions, setSelectedPositions] = useState<string[]>(['Forward', 'Midfielder']);
  const [scoutCity, setScoutCity] = useState('Karachi');
  const [isCustomScoutCity, setIsCustomScoutCity] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const { user, profile } = await getCurrentUserProfile();
        if (user) {
          setUserId(user.id);
          if (profile) {
            if (profile.name && !profile.name.startsWith('Guest')) {
              setFullName(profile.name);
            } else {
              setFullName('');
            }
            if (profile.role) setRole(profile.role);
            if (profile.age) setAge(String(profile.age));
            if (profile.city) {
              setCity(profile.city);
              setScoutCity(profile.city);
            }
          }
        } else {
          // Initialize fallback demo user ID for smooth local onboarding
          const fallbackId = 'demo-user-' + Date.now();
          setUserId(fallbackId);
        }
      } catch (err) {
        console.error('Error loading onboarding user profile:', err);
        setUserId('demo-user-' + Date.now());
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Handle Role Selection (Step 1 of Onboarding if role is null)
  const handleSelectRole = async (selectedRole: 'talent' | 'scout') => {
    setErrorMessage(null);
    setSavingStep(true);
    try {
      if (userId) {
        await selectUserRole(userId, selectedRole);
      }
      setRole(selectedRole);
      setCurrentStep(1);
    } catch (err: any) {
      console.error('Failed to save role:', err);
      setErrorMessage('Could not update role. Proceeding locally.');
      setRole(selectedRole);
      setCurrentStep(1);
    } finally {
      setSavingStep(false);
    }
  };

  // Handle Talent Step 1 Submit
  const handleTalentBasicsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSavingStep(true);

    const numAge = age === '' ? 19 : Math.max(12, Math.min(45, parseInt(age, 10) || 19));

    try {
      if (userId) {
        await saveTalentBasics(userId, { name: fullName, age: numAge, position, city: city || 'Karachi', bio });
      }
      setCurrentStep(2);
    } catch (err: any) {
      console.error('Error saving talent basics:', err);
      setErrorMessage(err.message || 'Failed to save profile details. Try again.');
    } finally {
      setSavingStep(false);
    }
  };

  // Handle Talent Step 2 Submit (Match Log -> Trigger AI Report)
  const handleTalentMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSavingStep(true);

    const gVal = goals === '' ? 0 : Math.max(0, parseInt(goals, 10) || 0);
    const aVal = assists === '' ? 0 : Math.max(0, parseInt(assists, 10) || 0);
    const mVal = minutesPlayed === '' ? 90 : Math.max(1, parseInt(minutesPlayed, 10) || 90);

    try {
      if (userId) {
        await saveMatchLog(userId, {
          opponent: opponent || 'Competitive Match',
          goals: gVal,
          assists: aVal,
          minutesPlayed: mVal,
          notes: tacticalNotes,
        });
      }

      setCurrentStep(3);
      generateReportAndFinish();
    } catch (err: any) {
      console.error('Error saving match log:', err);
      setErrorMessage(err.message || 'Failed to log match. Try again.');
    } finally {
      setSavingStep(false);
    }
  };

  // Generate AI Scouting Report for Talent Step 3
  const generateReportAndFinish = async () => {
    setGeneratingReport(true);
    setErrorMessage(null);

    const numAge = age === '' ? 19 : Math.max(12, Math.min(45, parseInt(age, 10) || 19));
    const gVal = goals === '' ? 0 : Math.max(0, parseInt(goals, 10) || 0);
    const aVal = assists === '' ? 0 : Math.max(0, parseInt(assists, 10) || 0);
    const mVal = minutesPlayed === '' ? 90 : Math.max(1, parseInt(minutesPlayed, 10) || 90);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName || 'Talent Player',
          age: numAge,
          position,
          city: city || 'Karachi',
          matches: [
            {
              opponent: opponent || 'Competitive Match',
              goals: gVal,
              assists: aVal,
              minutesPlayed: mVal,
              notes: tacticalNotes,
              matchDate: new Date().toISOString().split('T')[0],
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.report) {
        setAiReport(data.report);

        // Save report to database if userId exists
        if (userId) {
          await saveScoutingReport(userId, data.report);
          await completeOnboarding(userId);
        }
      } else {
        throw new Error(data.error || 'Failed to generate scouting report');
      }
    } catch (err: any) {
      console.error('Error generating AI report during onboarding:', err);
      setErrorMessage('Could not generate AI report. You can proceed to dashboard and generate it anytime.');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Complete Talent Onboarding & Go to Dashboard
  const handleFinishTalentOnboarding = async () => {
    setFinishing(true);
    setErrorMessage(null);
    try {
      if (userId) {
        await completeOnboarding(userId);
      }
      window.location.href = '/';
    } catch (err: any) {
      console.error('Error marking onboarding complete:', err);
      window.location.href = '/';
    }
  };

  // Scout Step 1 Submit
  const handleScoutBasicsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSavingStep(true);

    try {
      if (userId) {
        try {
          await saveScoutPreferences(userId, {
            name: fullName,
            city: scoutCity,
            positions: selectedPositions,
          });
        } catch (e) {
          console.warn('Scout basics save warning:', e);
        }
      }
      setCurrentStep(2);
    } catch (err: any) {
      console.error('Error in scout basics submit:', err);
      setCurrentStep(2);
    } finally {
      setSavingStep(false);
    }
  };

  // Scout Step 2 Submit (Save Preferences & Complete Onboarding)
  const handleScoutPreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSavingStep(true);

    try {
      if (userId) {
        try {
          await saveScoutPreferences(userId, {
            name: fullName,
            city: scoutCity,
            positions: selectedPositions,
          });
        } catch (e) {
          console.warn('Scout preferences save warning:', e);
        }
        await completeOnboarding(userId);
      } else {
        await completeOnboarding('scout-demo');
      }
      window.location.href = '/';
    } catch (err: any) {
      console.error('Error completing scout onboarding:', err);
      window.location.href = '/';
    }
  };

  const togglePosition = (pos: string) => {
    if (selectedPositions.includes(pos)) {
      if (selectedPositions.length > 1) {
        setSelectedPositions(selectedPositions.filter((p) => p !== pos));
      }
    } else {
      setSelectedPositions([...selectedPositions, pos]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#16A34A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-[#6B7280]">Loading your FootyFolio profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* Header Bar */}
      <header className="border-b border-[#E5E7EB] bg-white px-4 lg:px-8 py-3.5 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" showTagline={false} />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        
        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ROLE SELECTION SCREEN (Shown if role is not set yet)          */}
        {/* ------------------------------------------------------------- */}
        {!role && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] tracking-tight">
                How will you use FootyFolio?
              </h1>
              <p className="text-sm sm:text-base text-[#6B7280] max-w-md mx-auto">
                Select your primary role to customize your dashboard and scouting workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2">
              
              {/* Player Card */}
              <button
                type="button"
                onClick={() => handleSelectRole('talent')}
                disabled={savingStep}
                className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border-2 border-[#16A34A]/30 hover:border-[#16A34A] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between gap-6 cursor-pointer overflow-hidden hover:-translate-y-0.5"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#16A34A]/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                
                <div className="space-y-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center group-hover:bg-[#16A34A] group-hover:text-white transition-colors shadow-xs">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#16A34A]/10 text-[#16A34A] mb-2">
                      For Athletes
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#111827] group-hover:text-[#16A34A] transition-colors">
                      I'm a player
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] mt-2 leading-relaxed">
                      Build your digital scouting profile, log match statistics, and generate AI-powered scouting notes to get noticed by coaches.
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-xs font-bold text-[#16A34A] group-hover:translate-x-1 transition-transform relative z-10">
                  <span>Start Player Profile</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </button>

              {/* Scout Card */}
              <button
                type="button"
                onClick={() => handleSelectRole('scout')}
                disabled={savingStep}
                className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border-2 border-[#D97706]/30 hover:border-[#D97706] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between gap-6 cursor-pointer overflow-hidden hover:-translate-y-0.5"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D97706]/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

                <div className="space-y-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center group-hover:bg-[#D97706] group-hover:text-white transition-colors shadow-xs">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D97706]/10 text-[#D97706] mb-2">
                      For Scouts & Clubs
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#111827] group-hover:text-[#D97706] transition-colors">
                      I'm a scout / coach
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] mt-2 leading-relaxed">
                      Discover top amateur talent near you, filter by position and city, and evaluate players with structured tactical reports.
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-xs font-bold text-[#D97706] group-hover:translate-x-1 transition-transform relative z-10">
                  <span>Start Scouting Feed</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </button>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TALENT ONBOARDING FLOW (3 STEPS)                              */}
        {/* ------------------------------------------------------------- */}
        {role === 'talent' && (
          <div className="space-y-6">
            
            {/* Step Indicator Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                  Player Onboarding • Step {currentStep} of 3
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
                  {currentStep === 1 && "Build Your Player Portfolio"}
                  {currentStep === 2 && "Log Your First Match"}
                  {currentStep === 3 && "AI Scouting Report Reveal"}
                </h1>
              </div>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      step === currentStep
                        ? 'w-8 bg-[#16A34A]'
                        : step < currentStep
                        ? 'w-4 bg-[#16A34A]/40'
                        : 'w-4 bg-[#E5E7EB]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: TALENT BASICS */}
            {currentStep === 1 && (
              <form onSubmit={handleTalentBasicsSubmit} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-xs space-y-5">
                
                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Hamza Khan"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Age
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      placeholder="19"
                      value={age}
                      onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Primary Position
                    </label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827] bg-white"
                    >
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                    City / Region (Pakistan)
                  </label>
                  <select
                    value={PAKISTAN_CITIES.includes(city) ? city : (isCustomCity || city ? 'Other' : 'Karachi')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Other') {
                        setCity('');
                        setIsCustomCity(true);
                      } else {
                        setCity(val);
                        setIsCustomCity(false);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827] bg-white cursor-pointer font-medium"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c === 'Other' ? 'Other City (Type below)...' : c}
                      </option>
                    ))}
                  </select>

                  {(isCustomCity || (!PAKISTAN_CITIES.includes(city) && city !== '')) && (
                    <input
                      type="text"
                      placeholder="Type your city name (e.g. Kasur)..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827] mt-2 font-medium"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                    Player Bio / Pitch Summary
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Explosive left winger with strong dribbling, high work rate, and district league experience."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827]"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingStep}
                    className="flex items-center gap-2 bg-[#16A34A] text-white hover:bg-[#15803D] px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <span>Continue to Match Log</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: LOG FIRST MATCH */}
            {currentStep === 2 && (
              <form onSubmit={handleTalentMatchSubmit} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-xs space-y-5">
                <p className="text-xs text-[#6B7280]">
                  Log your most recent game. FootyFolio's AI engine uses this data to write your initial scouting report.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                    Opponent Club / Team
                  </label>
                  <input
                    type="text"
                    required
                    value={opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    placeholder="e.g. Korangi Football Club"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Goals
                    </label>
                    <div className="space-y-1">
                      <select
                        value={['0','1','2','3','4','5'].includes(goals) ? goals : 'custom'}
                        onChange={(e) => {
                          if (e.target.value !== 'custom') setGoals(e.target.value);
                        }}
                        className="w-full px-2 h-7 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#16A34A] focus:outline-none"
                      >
                        <option value="0">0 Goals</option>
                        <option value="1">1 Goal</option>
                        <option value="2">2 Goals</option>
                        <option value="3">3 Goals (Hat-trick)</option>
                        <option value="4">4 Goals</option>
                        <option value="5">5+ Goals</option>
                        <option value="custom">Custom value...</option>
                      </select>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        value={goals}
                        onChange={(e) => setGoals(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-1.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827] text-center font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Assists
                    </label>
                    <div className="space-y-1">
                      <select
                        value={['0','1','2','3','4','5'].includes(assists) ? assists : 'custom'}
                        onChange={(e) => {
                          if (e.target.value !== 'custom') setAssists(e.target.value);
                        }}
                        className="w-full px-2 h-7 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#D97706] focus:outline-none"
                      >
                        <option value="0">0 Assists</option>
                        <option value="1">1 Assist</option>
                        <option value="2">2 Assists</option>
                        <option value="3">3 Assists</option>
                        <option value="4">4 Assists</option>
                        <option value="5">5+ Assists</option>
                        <option value="custom">Custom value...</option>
                      </select>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        value={assists}
                        onChange={(e) => setAssists(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-1.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827] text-center font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Minutes
                    </label>
                    <div className="space-y-1">
                      <select
                        value={['90','60','45','30','15'].includes(minutesPlayed) ? minutesPlayed : 'custom'}
                        onChange={(e) => {
                          if (e.target.value !== 'custom') setMinutesPlayed(e.target.value);
                        }}
                        className="w-full px-2 h-7 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827] focus:outline-none"
                      >
                        <option value="90">90 mins (Full)</option>
                        <option value="60">60 mins</option>
                        <option value="45">45 mins (Half)</option>
                        <option value="30">30 mins (Sub)</option>
                        <option value="15">15 mins</option>
                        <option value="custom">Custom value...</option>
                      </select>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="90"
                        value={minutesPlayed}
                        onChange={(e) => setMinutesPlayed(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3 py-1.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827] text-center font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                    Tactical & Match Performance Notes
                  </label>
                  <textarea
                    rows={3}
                    value={tacticalNotes}
                    onChange={(e) => setTacticalNotes(e.target.value)}
                    placeholder="Describe your movement, defensive duties, key passes, or tactical highlights..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#16A34A] text-[#111827]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
                  >
                    ← Back to basics
                  </button>

                  <button
                    type="submit"
                    disabled={savingStep}
                    className="flex items-center gap-2 bg-[#16A34A] text-white hover:bg-[#15803D] px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <span>Generate AI Scouting Report</span>
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: AI REPORT REVEAL */}
            {currentStep === 3 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-xs space-y-6">
                
                {generatingReport ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center animate-pulse">
                      <Sparkles className="w-6 h-6 animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#111827]">Generating AI Scouting Note</h3>
                      <p className="text-xs text-[#6B7280] mt-1 max-w-sm">
                        Analyzing match stats for {fullName} ({position}, {city}). Evaluating goals, minutes, and tactical notes...
                      </p>
                    </div>
                  </div>
                ) : aiReport ? (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#16A34A] uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Report Ready</span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                        Scout Summary
                      </h4>
                      <p className="text-sm text-[#111827] leading-relaxed font-medium">
                        {aiReport.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                          Key Strengths
                        </h4>
                        <ul className="space-y-1.5 text-xs text-[#111827]">
                          {aiReport.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                          Development Areas
                        </h4>
                        <ul className="space-y-1.5 text-xs text-[#111827]">
                          {aiReport.areasToDevelop.map((dev, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0 mt-1.5" />
                              <span>{dev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#111827] text-white space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
                        Scout Verdict
                      </div>
                      <p className="text-xs sm:text-sm italic font-serif">
                        "{aiReport.verdict}"
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={finishing}
                        onClick={handleFinishTalentOnboarding}
                        className="flex items-center gap-2 bg-[#16A34A] text-white hover:bg-[#15803D] px-6 py-3 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        {finishing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Redirecting to Dashboard...</span>
                          </>
                        ) : (
                          <>
                            <span>Go to My Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-4">
                    <p className="text-sm text-[#6B7280]">
                      Report generation was skipped or unavailable.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        disabled={finishing || generatingReport}
                        onClick={generateReportAndFinish}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retry AI Report
                      </button>
                      <button
                        type="button"
                        disabled={finishing}
                        onClick={handleFinishTalentOnboarding}
                        className="px-4 py-2 border border-[#E5E7EB] text-[#111827] rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        {finishing ? 'Redirecting...' : 'Skip to Dashboard'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCOUT ONBOARDING FLOW (2 STEPS)                               */}
        {/* ------------------------------------------------------------- */}
        {role === 'scout' && (
          <div className="space-y-6">
            
            {/* Step Indicator Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                  Scout Setup • Step {currentStep} of 2
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
                  {currentStep === 1 && "Scout Profile Basics"}
                  {currentStep === 2 && "Scouting Filter Preferences"}
                </h1>
              </div>

              <div className="flex items-center gap-1.5">
                {[1, 2].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      step === currentStep
                        ? 'w-8 bg-[#D97706]'
                        : step < currentStep
                        ? 'w-4 bg-[#D97706]/40'
                        : 'w-4 bg-[#E5E7EB]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* SCOUT STEP 1: BASICS */}
            {currentStep === 1 && (
              <form onSubmit={handleScoutBasicsSubmit} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-xs space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                    Full Name / Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Coach Rashid or Karachi City Scout"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#D97706] text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                    Primary Region / City (Pakistan)
                  </label>
                  <select
                    value={PAKISTAN_CITIES.includes(scoutCity) ? scoutCity : (isCustomScoutCity || scoutCity ? 'Other' : 'Karachi')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Other') {
                        setScoutCity('');
                        setIsCustomScoutCity(true);
                      } else {
                        setScoutCity(val);
                        setIsCustomScoutCity(false);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#D97706] text-[#111827] bg-white cursor-pointer font-medium"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c === 'Other' ? 'Other Region (Type below)...' : c}
                      </option>
                    ))}
                  </select>

                  {(isCustomScoutCity || (!PAKISTAN_CITIES.includes(scoutCity) && scoutCity !== '')) && (
                    <input
                      type="text"
                      placeholder="Type your scouting city or region (e.g. South Punjab)..."
                      value={scoutCity}
                      onChange={(e) => setScoutCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#D97706] text-[#111827] mt-2 font-medium"
                      required
                    />
                  )}
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingStep}
                    className="flex items-center gap-2 bg-[#D97706] text-white hover:bg-[#B45309] px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingStep ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Configure Search Filters</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* SCOUT STEP 2: PREFERENCES */}
            {currentStep === 2 && (
              <form onSubmit={handleScoutPreferencesSubmit} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] shadow-xs space-y-6">
                
                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-2">
                    Target Positions to Discover
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map((pos) => {
                      const active = selectedPositions.includes(pos);
                      return (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => togglePosition(pos)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#D97706] text-white shadow-xs'
                              : 'bg-[#F1F5F9] text-[#6B7280] hover:text-[#111827]'
                          }`}
                        >
                          {pos}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                    Preferred Scouting Location
                  </label>
                  <input
                    type="text"
                    required
                    value={scoutCity}
                    onChange={(e) => setScoutCity(e.target.value)}
                    placeholder="e.g. Karachi"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#D97706] text-[#111827]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={savingStep}
                    className="flex items-center gap-2 bg-[#D97706] text-white hover:bg-[#B45309] px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingStep ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Launching Feed...</span>
                      </>
                    ) : (
                      <>
                        <span>Launch Scout Feed</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
