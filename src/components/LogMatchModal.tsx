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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="shrink-0 bg-[#16A34A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#D97706]" />
            <h3 className="font-sans text-xl font-bold">Log Your Match</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Opponent / Event</label>
              <input
                type="text"
                placeholder="e.g. Model Town FC"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Match Date</label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
                required
              />
            </div>
          </div>

          {/* Stats Grid: Goals, Assists, Minutes */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Goals</label>
              <input
                type="number"
                min="0"
                max="20"
                value={goals}
                onChange={(e) => setGoals(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 h-10 rounded-xl border border-[#E5E7EB] bg-white text-center font-bold text-sm text-[#16A34A] focus:outline-none focus:border-[#16A34A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Assists</label>
              <input
                type="number"
                min="0"
                max="20"
                value={assists}
                onChange={(e) => setAssists(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 h-10 rounded-xl border border-[#E5E7EB] bg-white text-center font-bold text-sm text-[#D97706] focus:outline-none focus:border-[#16A34A]"
                required
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
                className="w-full px-3 h-10 rounded-xl border border-[#E5E7EB] bg-white text-center font-bold text-sm text-[#111827] focus:outline-none focus:border-[#16A34A]"
                required
              />
            </div>
          </div>

          {/* Free Text Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1 flex items-center justify-between">
              <span>Match Notes & Tactical Context</span>
              <span className="text-[10px] text-[#6B7280]">AI scout analyzes these details</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Played left wing, team won 3-1. Created 2 big chances with cross-field passes and pressed defender for opening goal."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#111827] hover:bg-[#F1F5F9] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGeneratingReport}
              id="btn-submit-log-match"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16A34A] text-white text-xs font-semibold hover:bg-[#15803D] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isGeneratingReport ? 'Generating Scouting Report...' : 'Save & Generate Scouting Report'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
