import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { X, PlusCircle, Activity, Trash2, Edit3, Save } from 'lucide-react';

interface LogMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMatch: (matchData: Omit<Match, 'id' | 'talentProfileId'>, matchId?: string) => void;
  onDeleteMatch?: (matchId: string) => void;
  isGeneratingReport?: boolean;
  editingMatch?: Match | null;
}

export const LogMatchModal: React.FC<LogMatchModalProps> = ({
  isOpen,
  onClose,
  onSubmitMatch,
  onDeleteMatch,
  isGeneratingReport = false,
  editingMatch = null,
}) => {
  const [goals, setGoals] = useState<string>('0');
  const [assists, setAssists] = useState<string>('0');
  const [minutesPlayed, setMinutesPlayed] = useState<string>('90');
  const [opponent, setOpponent] = useState<string>('');
  const [matchDate, setMatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingMatch) {
      setGoals(editingMatch.goals?.toString() || '0');
      setAssists(editingMatch.assists?.toString() || '0');
      setMinutesPlayed(editingMatch.minutesPlayed?.toString() || '90');
      setOpponent(editingMatch.opponent || '');
      setMatchDate(editingMatch.matchDate || new Date().toISOString().split('T')[0]);
      setNotes(editingMatch.notes || '');
    } else {
      setGoals('0');
      setAssists('0');
      setMinutesPlayed('90');
      setOpponent('');
      setMatchDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [editingMatch, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gVal = goals === '' ? 0 : Math.max(0, parseInt(goals, 10) || 0);
    const aVal = assists === '' ? 0 : Math.max(0, parseInt(assists, 10) || 0);
    const mVal = minutesPlayed === '' ? 90 : Math.max(1, parseInt(minutesPlayed, 10) || 90);

    onSubmitMatch(
      {
        goals: gVal,
        assists: aVal,
        minutesPlayed: mVal,
        opponent: opponent || 'Opponent FC',
        matchDate,
        notes: notes || 'Match performance logged.',
      },
      editingMatch?.id
    );

    // Reset form
    setGoals('0');
    setAssists('0');
    setMinutesPlayed('90');
    setOpponent('');
    setNotes('');
  };

  const handleDelete = () => {
    if (editingMatch && onDeleteMatch) {
      if (window.confirm('Are you sure you want to delete this match log?')) {
        onDeleteMatch(editingMatch.id);
        onClose();
      }
    }
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
            {editingMatch ? <Edit3 className="w-5 h-5 text-[#D97706]" /> : <Activity className="w-5 h-5 text-[#D97706]" />}
            <h3 className="font-sans text-xl font-bold">
              {editingMatch ? 'Edit Match Log' : 'Log Your Match'}
            </h3>
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
              <div className="space-y-1.5">
                <select
                  value={['0','1','2','3','4','5'].includes(goals) ? goals : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') setGoals(e.target.value);
                  }}
                  className="w-full px-2 h-8 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#16A34A] focus:outline-none"
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
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setGoals(val);
                  }}
                  className="w-full px-3 h-9 rounded-xl border border-[#E5E7EB] bg-white text-center font-bold text-sm text-[#16A34A] focus:outline-none focus:border-[#16A34A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Assists</label>
              <div className="space-y-1.5">
                <select
                  value={['0','1','2','3','4','5'].includes(assists) ? assists : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') setAssists(e.target.value);
                  }}
                  className="w-full px-2 h-8 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#D97706] focus:outline-none"
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
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setAssists(val);
                  }}
                  className="w-full px-3 h-9 rounded-xl border border-[#E5E7EB] bg-white text-center font-bold text-sm text-[#D97706] focus:outline-none focus:border-[#16A34A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Minutes</label>
              <div className="space-y-1.5">
                <select
                  value={['90','60','45','30','15'].includes(minutesPlayed) ? minutesPlayed : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') setMinutesPlayed(e.target.value);
                  }}
                  className="w-full px-2 h-8 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827] focus:outline-none"
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
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setMinutesPlayed(val);
                  }}
                  className="w-full px-3 h-9 rounded-xl border border-[#E5E7EB] bg-white text-center font-bold text-sm text-[#111827] focus:outline-none focus:border-[#16A34A]"
                />
              </div>
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

          <div className="pt-2 flex items-center justify-between border-t border-[#E5E7EB]">
            {editingMatch && onDeleteMatch ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Log</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                {editingMatch ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                <span>
                  {isGeneratingReport
                    ? 'Updating Scouting Report...'
                    : editingMatch
                    ? 'Save Changes & Refresh Report'
                    : 'Save & Generate Scouting Report'}
                </span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
