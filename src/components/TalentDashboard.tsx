import React, { useState } from 'react';
import { TalentProfile, Match, ScoutingReport } from '../types';
import { ScoutingReportCard } from './ScoutingReportCard';
import { LogMatchModal } from './LogMatchModal';
import { UserCheck, PlusCircle, MapPin, Activity, Award, BookmarkCheck, Calendar, RefreshCw } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Player Header Banner */}
      <div className="rounded-2xl bg-[#2D5D3F] text-[#F6F1E7] p-6 lg:p-8 shadow-md border-2 border-[#2D5D3F] flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center text-2xl font-bold font-serif-heading border border-white/20">
            {talent.name.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-white/20 text-[#F6F1E7] font-bold">
                {talent.position}
              </span>
              <span className="text-xs text-[#F6F1E7]/80 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C9862E]" />
                {talent.city}
              </span>
            </div>
            <h1 className="font-serif-heading text-3xl font-bold text-white">
              {talent.name}
            </h1>
            <p className="text-xs text-[#F6F1E7]/80 mt-1 max-w-xl">
              {talent.bio || `Amateur ${talent.position} based in ${talent.city}, Pakistan.`}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLogModalOpen(true)}
            id="btn-talent-dash-log-match"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C9862E] text-[#1E1C19] hover:bg-[#b07425] text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Match Performance</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#8C8577]/20 shadow-xs">
          <span className="text-xs font-mono uppercase text-[#8C8577] font-bold block mb-1">Matches Logged</span>
          <span className="font-serif-heading text-3xl font-bold text-[#1E1C19]">{talent.matches.length}</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#8C8577]/20 shadow-xs">
          <span className="text-xs font-mono uppercase text-[#8C8577] font-bold block mb-1">Total Goals</span>
          <span className="font-serif-heading text-3xl font-bold text-[#2D5D3F]">{totalGoals}</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#8C8577]/20 shadow-xs">
          <span className="text-xs font-mono uppercase text-[#8C8577] font-bold block mb-1">Total Assists</span>
          <span className="font-serif-heading text-3xl font-bold text-[#C9862E]">{totalAssists}</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#8C8577]/20 shadow-xs">
          <span className="text-xs font-mono uppercase text-[#8C8577] font-bold block mb-1">Minutes Played</span>
          <span className="font-serif-heading text-3xl font-bold text-[#1E1C19]">{totalMinutes}'</span>
        </div>
      </div>

      {/* Main Grid: AI Report + Shortlist Scouts */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: AI Scouting Report & Matches */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Prominent Scouting Report */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif-heading text-2xl font-bold text-[#1E1C19]">
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
              <h2 className="font-serif-heading text-xl font-bold text-[#1E1C19] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#2D5D3F]" />
                <span>Logged Matches & Stats</span>
              </h2>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="text-xs text-[#2D5D3F] hover:underline font-bold"
              >
                + Add Match
              </button>
            </div>

            {talent.matches.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-[#8C8577]/30 text-center">
                <p className="font-serif-heading text-base font-bold text-[#1E1C19]">No matches logged yet</p>
                <p className="text-xs text-[#8C8577] mt-1 mb-4">Add your first match to feed your AI scouting report.</p>
                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#2D5D3F] text-white text-xs font-bold"
                >
                  Log First Match
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {talent.matches.map((m) => (
                  <div key={m.id} className="p-4 bg-white rounded-xl border border-[#8C8577]/20 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#2D5D3F]/40 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif-heading text-base font-bold text-[#1E1C19]">
                          vs. {m.opponent || 'Opponent'}
                        </span>
                        <span className="text-[11px] text-[#8C8577] font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {m.matchDate}
                        </span>
                      </div>
                      <p className="text-xs text-[#8C8577] leading-relaxed italic">
                        "{m.notes}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1 rounded-lg bg-[#2D5D3F]/10 text-[#2D5D3F] text-xs font-bold">
                        {m.goals} G
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-[#C9862E]/10 text-[#C9862E] text-xs font-bold">
                        {m.assists} A
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-[#1E1C19]/10 text-[#1E1C19] text-xs font-mono">
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
          <div className="bg-white p-6 rounded-2xl border border-[#8C8577]/20 shadow-xs">
            <h3 className="font-serif-heading text-lg font-bold text-[#1E1C19] mb-1 flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-[#C9862E]" />
              <span>Scout Interest</span>
            </h3>
            <p className="text-xs text-[#8C8577] mb-4">
              Coaches and scouts who have saved your profile to their shortlist.
            </p>

            {(talent.shortlistedBy && talent.shortlistedBy.length > 0) ? (
              <div className="space-y-2">
                {talent.shortlistedBy.map((scoutId, idx) => (
                  <div key={idx} className="p-3 bg-[#F6F1E7] rounded-xl border border-[#C9862E]/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C9862E] text-[#1E1C19] flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <div>
                      <p className="font-serif-heading text-xs font-bold text-[#1E1C19]">
                        Verified Academy Scout
                      </p>
                      <p className="text-[10px] text-[#8C8577]">Shortlisted your dossier for open trials</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#F6F1E7] border border-dashed border-[#8C8577]/30 text-center text-xs text-[#8C8577]">
                No scouts have shortlisted you yet. Keep logging match stats to increase visibility on the talent feed.
              </div>
            )}
          </div>

          <div className="bg-[#1E1C19] text-[#F6F1E7] p-6 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9862E] font-bold block mb-1">
              Scout Tip
            </span>
            <p className="font-serif-heading text-sm font-bold text-white mb-2">
              Consistently Log Matches
            </p>
            <p className="text-xs text-[#F6F1E7]/70 leading-relaxed">
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
