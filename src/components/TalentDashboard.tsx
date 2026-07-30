import React, { useState } from 'react';
import { TalentProfile, Match, ScoutingReport } from '../types';
import { ScoutingReportCard } from './ScoutingReportCard';
import { LogMatchModal } from './LogMatchModal';
import { UserCheck, PlusCircle, MapPin, Activity, Award, BookmarkCheck, Calendar, RefreshCw, Mail } from 'lucide-react';

interface TalentDashboardProps {
  talent: TalentProfile;
  onUpdateTalent: (updated: TalentProfile) => void;
}

export const TalentDashboard: React.FC<TalentDashboardProps> = ({ talent, onUpdateTalent }) => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalGoals = talent.matches.reduce((acc, m) => acc + (m.goals || 0), 0);
  const totalAssists = talent.matches.reduce((acc, m) => acc + (m.assists || 0), 0);
  const totalMinutes = talent.matches.reduce((acc, m) => acc + (m.minutesPlayed || 0), 0);

  // Trigger Gemini API to regenerate report
  const handleRegenerateReport = async (updatedMatches: Match[]) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: talent.name,
          age: talent.age,
          position: talent.position,
          city: talent.city,
          matches: updatedMatches
        })
      });

      const data = await res.json();
      if (data?.report) {
        const newReport: ScoutingReport = {
          id: 'rep-' + Date.now(),
          talentProfileId: talent.id,
          summary: data.report.summary,
          strengths: data.report.strengths,
          areasToDevelop: data.report.areasToDevelop,
          verdict: data.report.verdict,
          generatedAt: new Date().toISOString()
        };

        const updatedProfile = {
          ...talent,
          matches: updatedMatches,
          latestReport: newReport
        };
        onUpdateTalent(updatedProfile);
      }
    } catch (err) {
      console.error('Error generating scouting report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddMatch = async (matchData: Omit<Match, 'id' | 'talentProfileId'>) => {
    const newMatch: Match = {
      id: 'm-' + Date.now(),
      talentProfileId: talent.id,
      ...matchData
    };

    const updatedMatches = [newMatch, ...talent.matches];
    setIsLogModalOpen(false);
    await handleRegenerateReport(updatedMatches);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Player Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#16A34A] text-white p-5 sm:p-6 lg:p-8 shadow-sm border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-[#15803D] flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0 shadow-sm border-2 border-white/90">
            {talent.name.charAt(0)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold">
                {talent.position}
              </span>
              <span className="text-xs text-white/90 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#FEF08A]" />
                {talent.city}
              </span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-white">
              {talent.name}
            </h1>
            <p className="text-xs text-white/80 mt-1 max-w-xl">
              {talent.bio || `Amateur ${talent.position} based in ${talent.city}, Pakistan.`}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsLogModalOpen(true)}
            id="btn-talent-dash-log-match"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D97706] text-white hover:bg-[#B45309] text-xs font-bold shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Match Performance</span>
          </button>
        </div>
      </div>

      {/* Scout Interest Banner Alert */}
      {talent.shortlistedBy && talent.shortlistedBy.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#D97706]/10 via-[#F59E0B]/10 to-[#16A34A]/10 border border-[#D97706]/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#B45309] font-bold">Scout Notification</span>
                <span className="px-2 py-0.5 rounded-full bg-[#D97706] text-white text-[10px] font-bold">
                  {talent.shortlistedBy.length} {talent.shortlistedBy.length === 1 ? 'Scout' : 'Scouts'}
                </span>
              </div>
              <p className="font-sans text-sm font-bold text-[#111827]">
                🎉 You have been shortlisted by a scout!
              </p>
              <p className="text-xs text-[#4B5563] mt-0.5">
                {talent.shortlistedBy.length === 1 
                  ? 'A verified scout has saved your player dossier to their shortlist for talent evaluation.' 
                  : `${talent.shortlistedBy.length} verified scouts have saved your player dossier to their shortlist for talent evaluation.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#6B7280] font-bold block mb-1">Matches Logged</span>
          <span className="font-sans text-2xl sm:text-3xl font-bold text-[#111827]">{talent.matches.length}</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#6B7280] font-bold block mb-1">Total Goals</span>
          <span className="font-sans text-2xl sm:text-3xl font-bold text-[#16A34A]">{totalGoals}</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#6B7280] font-bold block mb-1">Total Assists</span>
          <span className="font-sans text-2xl sm:text-3xl font-bold text-[#D97706]">{totalAssists}</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#6B7280] font-bold block mb-1">Minutes Played</span>
          <span className="font-sans text-2xl sm:text-3xl font-bold text-[#111827]">{totalMinutes}'</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D97706]/30 bg-[#FFFBEB] shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#B45309] font-bold block mb-1">Scout Shortlists</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-2xl sm:text-3xl font-bold text-[#D97706]">
              {talent.shortlistedBy?.length || 0}
            </span>
            <span className="text-xs text-[#92400E] font-medium">scouts</span>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Report + Shortlist Scouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left 2 Cols: AI Scouting Report & Matches */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Prominent Scouting Report */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-sans text-2xl font-bold text-[#111827]">
                Scout Dossier & AI Analysis
              </h2>
            </div>

            <ScoutingReportCard
              report={talent.latestReport}
              playerName={talent.name}
              position={talent.position}
              isGenerating={isGenerating}
              onRegenerate={() => handleRegenerateReport(talent.matches)}
              showRegenerateButton={true}
            />
          </div>

          {/* Running Match Logs History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans text-xl font-bold text-[#111827] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#16A34A]" />
                <span>Logged Matches & Stats</span>
              </h2>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="text-xs text-[#16A34A] hover:underline font-bold cursor-pointer"
              >
                + Log your match
              </button>
            </div>

            {talent.matches.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-[#E5E7EB] text-center">
                <p className="font-sans text-base font-bold text-[#111827]">No matches logged yet</p>
                <p className="text-xs text-[#6B7280] mt-1 mb-4">Log your match performance to generate your AI scout write-up.</p>
                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold cursor-pointer hover:bg-[#15803D]"
                >
                  Log First Match
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {talent.matches.map((m) => (
                  <div key={m.id} className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#16A34A]/40 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans text-base font-bold text-[#111827]">
                          vs. {m.opponent || 'Opponent'}
                        </span>
                        <span className="text-[11px] text-[#6B7280] font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {m.matchDate}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] leading-relaxed italic">
                        "{m.notes}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] text-xs font-bold">
                        {m.goals} G
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#D97706]/10 text-[#D97706] text-xs font-bold">
                        {m.assists} A
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#F1F5F9] text-[#111827] text-xs font-mono font-medium">
                        {m.minutesPlayed}'
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Shortlist Activity / Scout Interest */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <h3 className="font-sans text-lg font-bold text-[#111827] mb-1 flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-[#D97706]" />
              <span>Scout Interest</span>
            </h3>
            <p className="text-xs text-[#6B7280] mb-4">
              Coaches and scouts who have saved your profile to their shortlist.
            </p>

            {(talent.shortlistedBy && talent.shortlistedBy.length > 0) ? (
              <div className="space-y-2">
                {talent.shortlistedBy.map((scoutId, idx) => (
                  <div key={idx} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D97706] text-white flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <div>
                      <p className="font-sans text-xs font-bold text-[#111827]">
                        Verified Academy Scout
                      </p>
                      <p className="text-[10px] text-[#6B7280]">Shortlisted your dossier for open trials</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-dashed border-[#E5E7EB] text-center text-xs text-[#6B7280]">
                No scouts have shortlisted you yet. Keep logging match stats to increase visibility on the talent feed.
              </div>
            )}
          </div>

          <div className="bg-[#111827] text-white p-6 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D97706] font-bold block mb-1">
              Scout Tip
            </span>
            <p className="font-sans text-sm font-bold text-white mb-2">
              Consistently Log Matches
            </p>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Scouts value players who log at least 3-5 consecutive matches with detailed tactical notes over single isolated performances.
            </p>
          </div>
        </div>

      </div>

      {/* Log Match Modal */}
      <LogMatchModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSubmitMatch={handleAddMatch}
        isGeneratingReport={isGenerating}
      />

    </div>
  );
};
