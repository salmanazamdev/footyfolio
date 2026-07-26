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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl relative">
        
        {/* Header Bar */}
        <div className="bg-[#111827] text-white p-6 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white text-[#15803D] flex items-center justify-center text-xl font-bold shrink-0 border-2 border-white/90 shadow-sm">
              {talent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white font-bold">
                  {talent.position}
                </span>
                <span className="text-xs text-[#9CA3AF] flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                  {talent.city}
                </span>
              </div>
              <h2 className="font-sans text-2xl font-bold text-white">
                {talent.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {scoutMode && onToggleShortlist && (
              <button
                onClick={() => onToggleShortlist(talent.id)}
                id={`btn-modal-shortlist-${talent.id}`}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isShortlisted
                    ? 'bg-[#D97706] text-white'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>{isShortlisted ? 'Shortlisted' : 'Shortlist Candidate'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Profile Stats Quick Strip */}
        <div className="grid grid-cols-4 bg-[#16A34A] text-white divide-x divide-white/20 text-center py-3">
          <div>
            <span className="text-[10px] font-mono text-white/80 uppercase block">Age</span>
            <span className="font-sans text-base font-bold">{talent.age} yrs</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-white/80 uppercase block">Matches</span>
            <span className="font-sans text-base font-bold">{talent.matches.length}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-white/80 uppercase block">G / A</span>
            <span className="font-sans text-base font-bold text-[#FEF08A]">{totalGoals} G • {totalAssists} A</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-white/80 uppercase block">Minutes</span>
            <span className="font-sans text-base font-bold">{totalMinutes}'</span>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 lg:p-8 space-y-6">
          
          {/* AI Scouting Report Section */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#111827] font-bold mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#16A34A]" />
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
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#111827] font-bold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#16A34A]" />
              <span>Match History Logs ({talent.matches.length})</span>
            </h3>

            {talent.matches.length === 0 ? (
              <p className="text-xs text-[#6B7280] italic">No matches logged yet.</p>
            ) : (
              <div className="space-y-2.5">
                {talent.matches.map((m) => (
                  <div key={m.id} className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans font-bold text-sm text-[#111827]">
                          vs. {m.opponent || 'Opponent'}
                        </span>
                        {m.result && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5E7EB] text-[#111827] font-semibold">
                            {m.result}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280] italic leading-relaxed">
                        "{m.notes}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      <span className="px-2.5 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] text-xs font-bold">
                        {m.goals} Goals
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#D97706]/10 text-[#D97706] text-xs font-bold">
                        {m.assists} Assists
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#E5E7EB] text-[#111827] text-xs font-mono font-medium">
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
