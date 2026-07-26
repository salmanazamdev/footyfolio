import React from 'react';
import { TalentProfile } from '../types';
import { ScoutingReportCard } from './ScoutingReportCard';
import { X, BookmarkCheck, MapPin, Calendar, Activity, Award, User, Clock, Footprints } from 'lucide-react';

interface TalentDetailModalProps {
  talent: TalentProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isShortlisted?: boolean;
  onToggleShortlist?: (talentId: string) => void;
  scoutMode?: boolean;
}

export const TalentDetailModal: React.FC<TalentDetailModalProps> = ({
  talent,
  isOpen,
  onClose,
  isShortlisted = false,
  onToggleShortlist,
  scoutMode = true
}) => {
  if (!isOpen || !talent) return null;

  const totalGoals = talent.matches.reduce((acc, m) => acc + (m.goals || 0), 0);
  const totalAssists = talent.matches.reduce((acc, m) => acc + (m.assists || 0), 0);
  const totalMinutes = talent.matches.reduce((acc, m) => acc + (m.minutesPlayed || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-[#F6F1E7] border-2 border-[#1E1C19] rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl relative">
        
        {/* Header Bar */}
        <div className="bg-[#1E1C19] text-[#F6F1E7] p-6 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2D5D3F] text-[#F6F1E7] flex items-center justify-center text-xl font-bold font-serif-heading border-2 border-[#C9862E]">
              {talent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#2D5D3F] text-white font-bold">
                  {talent.position}
                </span>
                <span className="text-xs text-[#8C8577] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C9862E]" />
                  {talent.city}
                </span>
              </div>
              <h2 className="font-serif-heading text-2xl font-bold text-white">
                {talent.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {scoutMode && onToggleShortlist && (
              <button
                onClick={() => onToggleShortlist(talent.id)}
                id={`btn-modal-shortlist-${talent.id}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isShortlisted
                    ? 'bg-[#C9862E] text-[#1E1C19]'
                    : 'bg-white/10 text-[#F6F1E7] hover:bg-white/20 border border-white/20'
                }`}
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>{isShortlisted ? 'Shortlisted' : 'Shortlist Candidate'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-[#8C8577] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Profile Stats Quick Strip */}
        <div className="grid grid-cols-4 bg-[#2D5D3F] text-[#F6F1E7] divide-x divide-white/10 text-center py-3">
          <div>
            <span className="text-[10px] font-mono text-[#F6F1E7]/70 uppercase block">Age</span>
            <span className="font-serif-heading text-base font-bold">{talent.age} yrs</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#F6F1E7]/70 uppercase block">Matches</span>
            <span className="font-serif-heading text-base font-bold">{talent.matches.length}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#F6F1E7]/70 uppercase block">G / A</span>
            <span className="font-serif-heading text-base font-bold text-[#C9862E]">{totalGoals} G • {totalAssists} A</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#F6F1E7]/70 uppercase block">Minutes</span>
            <span className="font-serif-heading text-base font-bold">{totalMinutes}'</span>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 lg:p-8 space-y-6">
          
          {/* AI Scouting Report Section */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#1E1C19] font-bold mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2D5D3F]" />
              <span>Full AI Scouting Report</span>
            </h3>

            <ScoutingReportCard
              report={talent.latestReport}
              playerName={talent.name}
              position={talent.position}
              showRegenerateButton={false}
            />
          </div>

          {/* Match History Logs */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#1E1C19] font-bold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2D5D3F]" />
              <span>Match History Logs ({talent.matches.length})</span>
            </h3>

            {talent.matches.length === 0 ? (
              <p className="text-xs text-[#8C8577] italic">No matches logged yet.</p>
            ) : (
              <div className="space-y-2.5">
                {talent.matches.map((m) => (
                  <div key={m.id} className="p-4 bg-white rounded-xl border border-[#8C8577]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif-heading font-bold text-sm text-[#1E1C19]">
                          vs. {m.opponent || 'Opponent'}
                        </span>
                        {m.result && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#8C8577]/10 text-[#1E1C19] font-semibold">
                            {m.result}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8C8577] italic leading-relaxed">
                        "{m.notes}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      <span className="px-2.5 py-1 rounded-lg bg-[#2D5D3F]/10 text-[#2D5D3F] text-xs font-bold">
                        {m.goals} Goals
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#C9862E]/10 text-[#C9862E] text-xs font-bold">
                        {m.assists} Assists
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#1E1C19]/10 text-[#1E1C19] text-xs font-mono">
                        {m.minutesPlayed}'
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
