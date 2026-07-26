import React, { useState } from 'react';
import { TalentProfile, Position, Match } from '../types';
import { User, Activity, Sparkles, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { ScoutingReportCard } from './ScoutingReportCard';

interface TalentOnboardingModalProps {
  isOpen: boolean;
  onComplete: (talentProfile: TalentProfile) => void;
  onCancel?: () => void;
}

const CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Rawalpindi', 
  'Quetta', 'Faisalabad', 'Sialkot', 'Multan', 'Hyderabad'
];

export const TalentOnboardingModal: React.FC<TalentOnboardingModalProps> = ({
  isOpen,
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Step 1 State
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number>(19);
  const [position, setPosition] = useState<Position>('forward');
  const [city, setCity] = useState<string>('Lahore');
  const [preferredFoot, setPreferredFoot] = useState<string>('Right');
  const [bio, setBio] = useState<string>('');

  // Step 2 State
  const [goals, setGoals] = useState<number>(1);
  const [assists, setAssists] = useState<number>(1);
  const [minutesPlayed, setMinutesPlayed] = useState<number>(90);
  const [opponent, setOpponent] = useState<string>('Gulberg United');
  const [notes, setNotes] = useState<string>('Played left wing, team won 3-1. Scored opening goal and provided key assist.');

  // Step 3 State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedProfile, setGeneratedProfile] = useState<TalentProfile | null>(null);

  if (!isOpen) return null;

  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  const handleGenerateFirstReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
    setIsGenerating(true);

    const initialMatch: Match = {
      id: 'm-' + Date.now(),
      talentProfileId: 'talent-new',
      goals: Number(goals),
      assists: Number(assists),
      minutesPlayed: Number(minutesPlayed),
      opponent: opponent || 'Opponent FC',
      matchDate: new Date().toISOString().split('T')[0],
      notes: notes || 'Played full match.'
    };

    const newTalentId = 'talent-' + Date.now();

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          age,
          position,
          city,
          matches: [initialMatch]
        })
      });

      const data = await res.json();
      const report = data?.report || {
        summary: `${name} is a ${age}-year-old ${position} from ${city} with strong direct goal involvement.`,
        strengths: [`High attacking involvement with ${goals} goals and ${assists} assists in logged match.`, 'Demonstrates high match fitness.'],
        areasToDevelop: ['Requires further match history entries to verify tactical consistency under pressure.'],
        verdict: `Promising profile in ${city}; worth following for upcoming trials.`
      };

      const fullProfile: TalentProfile = {
        id: newTalentId,
        userId: 'user-' + Date.now(),
        name,
        age: Number(age),
        position,
        city,
        preferredFoot,
        bio: bio || `Amateur ${position} based in ${city}.`,
        matches: [initialMatch],
        latestReport: {
          id: 'rep-' + Date.now(),
          talentProfileId: newTalentId,
          summary: report.summary,
          strengths: report.strengths,
          areasToDevelop: report.areasToDevelop,
          verdict: report.verdict,
          generatedAt: new Date().toISOString()
        },
        shortlistedBy: [],
        createdAt: new Date().toISOString()
      };

      setGeneratedProfile(fullProfile);
    } catch (err) {
      console.error('Report generation error:', err);
      // Fallback profile
      const fullProfile: TalentProfile = {
        id: newTalentId,
        userId: 'user-' + Date.now(),
        name,
        age: Number(age),
        position,
        city,
        preferredFoot,
        bio: bio || `Amateur ${position} based in ${city}.`,
        matches: [initialMatch],
        latestReport: {
          id: 'rep-' + Date.now(),
          talentProfileId: newTalentId,
          summary: `${name} is an energetic ${position} from ${city} who makes immediate impact in offensive plays.`,
          strengths: [`Direct goal contribution recorded: ${goals} goals and ${assists} assists.`, 'Good positional mobility.'],
          areasToDevelop: ['Needs multi-match statistics logging for deep trend analysis.'],
          verdict: `High-workrate player for ${city} local selection.`,
          generatedAt: new Date().toISOString()
        },
        shortlistedBy: [],
        createdAt: new Date().toISOString()
      };
      setGeneratedProfile(fullProfile);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishOnboarding = () => {
    if (generatedProfile) {
      onComplete(generatedProfile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Onboarding Header Banner */}
        <div className="bg-[#16A34A] text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FEF08A] font-bold block">
              Player Registration • Step {step} of 3
            </span>
            <h3 className="font-sans text-xl font-bold">Create Your FootyFolio Profile</h3>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === s ? 'bg-[#D97706] scale-125' : step > s ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <form onSubmit={handleNextToStep2} className="space-y-4">
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E5E7EB] flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-[#16A34A]" />
                <p className="text-xs text-[#111827]">
                  Set up your player identity. Scouts filter players by position and region.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shahzaib Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Age</label>
                  <input
                    type="number"
                    min="12"
                    max="45"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                    className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Position</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as Position)}
                    className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] capitalize"
                  >
                    <option value="goalkeeper">Goalkeeper</option>
                    <option value="defender">Defender</option>
                    <option value="midfielder">Midfielder</option>
                    <option value="forward">Forward</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">City / Region</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A]"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Preferred Foot</label>
                  <select
                    value={preferredFoot}
                    onChange={(e) => setPreferredFoot(e.target.value)}
                    className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A]"
                  >
                    <option value="Right">Right</option>
                    <option value="Left">Left</option>
                    <option value="Both">Both Feet</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#E5E7EB]">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs text-[#6B7280] hover:text-[#111827] font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  id="btn-talent-step1-next"
                  className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D] shadow-xs transition-all cursor-pointer"
                >
                  <span>Continue to Match Stats</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Seed Match Stats */}
          {step === 2 && (
            <form onSubmit={handleGenerateFirstReport} className="space-y-4">
              <div className="bg-[#D97706]/10 border border-[#D97706]/30 p-3.5 rounded-xl flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-[#D97706]" />
                <p className="text-xs text-[#111827]">
                  Log your most recent match performance. Gemini AI will convert this into your initial professional scouting report.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Opponent Club / Tournament</label>
                <input
                  type="text"
                  placeholder="e.g. Model Town FC"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Goals</label>
                  <input
                    type="number"
                    min="0"
                    value={goals}
                    onChange={(e) => setGoals(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 h-10 rounded-xl border border-[#E5E7EB] bg-white text-center font-bold text-base text-[#16A34A] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Assists</label>
                  <input
                    type="number"
                    min="0"
                    value={assists}
                    onChange={(e) => setAssists(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 h-10 rounded-xl border border-[#E5E7EB] bg-white text-center font-bold text-base text-[#D97706] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">Minutes</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={minutesPlayed}
                    onChange={(e) => setMinutesPlayed(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 h-10 rounded-xl border border-[#E5E7EB] bg-white text-center font-bold text-base text-[#111827] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">Match Notes & Tactical Context</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your role, key moments, team result, etc."
                  className="w-full p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#6B7280] hover:text-[#111827] font-medium cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  id="btn-generate-initial-report"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D] shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#FEF08A]" />
                  <span>Generate AI Scouting Report</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Payoff Moment — Reveal Report */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center pb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Your Initial Scouting Dossier</span>
                </span>
                <h3 className="font-sans text-2xl font-bold text-[#111827]">
                  Scout Analysis Revealed
                </h3>
              </div>

              <ScoutingReportCard
                report={generatedProfile?.latestReport}
                playerName={name}
                position={position}
                isGenerating={isGenerating}
                showRegenerateButton={false}
              />

              {!isGenerating && generatedProfile && (
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleFinishOnboarding}
                    id="btn-finish-talent-onboarding"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#16A34A] text-white text-sm font-bold hover:bg-[#15803D] shadow-sm transition-all active:scale-98 cursor-pointer"
                  >
                    <span>Enter Player Dashboard</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
