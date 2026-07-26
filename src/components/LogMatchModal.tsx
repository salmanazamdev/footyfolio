import React, { useState } from 'react';
import { Match } from '../types';
import { X, PlusCircle, Activity, FileText } from 'lucide-react';

interface LogMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMatch: (matchData: Omit<Match, 'id' | 'talentProfileId'>) => void;
  isGeneratingReport?: boolean;
}

export const LogMatchModal: React.FC<LogMatchModalProps> = ({
  isOpen,
  onClose,
  onSubmitMatch,
  isGeneratingReport = false
}) => {
  const [goals, setGoals] = useState<number>(0);
  const [assists, setAssists] = useState<number>(0);
  const [minutesPlayed, setMinutesPlayed] = useState<number>(90);
  const [opponent, setOpponent] = useState<string>('');
  const [matchDate, setMatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitMatch({
      goals: Number(goals),
      assists: Number(assists),
      minutesPlayed: Number(minutesPlayed),
      opponent: opponent || 'Opponent FC',
      matchDate,
      notes: notes || 'Match performance logged.'
    });
    // Reset form
    setGoals(0);
    setAssists(0);
    setMinutesPlayed(90);
    setOpponent('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#F6F1E7] border-2 border-[#1E1C19] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Modal Header */}
        <div className="bg-[#2D5D3F] text-[#F6F1E7] p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#C9862E]" />
            <h3 className="font-serif-heading text-xl font-bold">Log Match Performance</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#F6F1E7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E1C19] mb-1">Opponent / Event</label>
              <input
                type="text"
                placeholder="e.g. Model Town FC"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#8C8577]/30 bg-white text-xs text-[#1E1C19] focus:outline-hidden focus:border-[#2D5D3F]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1C19] mb-1">Match Date</label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#8C8577]/30 bg-white text-xs text-[#1E1C19] focus:outline-hidden focus:border-[#2D5D3F]"
                required
              />
            </div>
          </div>

          {/* Stats Grid: Goals, Assists, Minutes */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-white/70 rounded-xl border border-[#8C8577]/20">
            <div>
              <label className="block text-xs font-semibold text-[#1E1C19] mb-1">Goals</label>
              <input
                type="number"
                min="0"
                max="20"
                value={goals}
                onChange={(e) => setGoals(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-lg border border-[#8C8577]/30 bg-white text-center font-bold text-sm text-[#2D5D3F]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1C19] mb-1">Assists</label>
              <input
                type="number"
                min="0"
                max="20"
                value={assists}
                onChange={(e) => setAssists(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-lg border border-[#8C8577]/30 bg-white text-center font-bold text-sm text-[#C9862E]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1C19] mb-1">Minutes</label>
              <input
                type="number"
                min="1"
                max="120"
                value={minutesPlayed}
                onChange={(e) => setMinutesPlayed(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-lg border border-[#8C8577]/30 bg-white text-center font-bold text-sm text-[#1E1C19]"
                required
              />
            </div>
          </div>

          {/* Free Text Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#1E1C19] mb-1 flex items-center justify-between">
              <span>Match Notes & Tactical Context</span>
              <span className="text-[10px] text-[#8C8577]">AI scout analyzes these details</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Played left wing, team won 3-1. Created 2 big chances with cross-field passes and pressed defender for opening goal."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#8C8577]/30 bg-white text-xs text-[#1E1C19] focus:outline-hidden focus:border-[#2D5D3F]"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#8C8577]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#8C8577]/30 text-xs font-semibold text-[#1E1C19] hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGeneratingReport}
              id="btn-submit-log-match"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#2D5D3F] text-[#F6F1E7] text-xs font-semibold hover:bg-[#234932] shadow-xs transition-all disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isGeneratingReport ? 'Generating Report...' : 'Save & Update AI Report'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
