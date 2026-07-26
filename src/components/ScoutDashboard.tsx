import React, { useState } from 'react';
import { TalentProfile, ScoutProfile, Position, ShortlistItem } from '../types';
import { Search, Filter, MapPin, Award, BookmarkCheck, ArrowUpRight, Shield, Check, Sparkles, Footprints } from 'lucide-react';
import { TalentDetailModal } from './TalentDetailModal';

interface ScoutDashboardProps {
  scoutProfile: ScoutProfile;
  talents: TalentProfile[];
  shortlists: ShortlistItem[];
  onToggleShortlist: (talentId: string) => void;
  activeTab: 'feed' | 'shortlist';
  onTabChange: (tab: 'feed' | 'shortlist') => void;
}

const CITIES = ['All Cities', 'Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Rawalpindi', 'Quetta', 'Faisalabad', 'Sialkot'];
const POSITIONS: Array<{ value: 'all' | Position; label: string }> = [
  { value: 'all', label: 'All Positions' },
  { value: 'goalkeeper', label: 'Goalkeepers' },
  { value: 'defender', label: 'Defenders' },
  { value: 'midfielder', label: 'Midfielders' },
  { value: 'forward', label: 'Forwards' },
];

export const ScoutDashboard: React.FC<ScoutDashboardProps> = ({
  scoutProfile,
  talents,
  shortlists,
  onToggleShortlist,
  activeTab,
  onTabChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<'all' | Position>('all');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(null);

  // Set of shortlisted talent IDs for fast lookup
  const shortlistedTalentIds = new Set(shortlists.map((s) => s.talentProfileId));

  // Filter logic
  const filteredTalents = talents.filter((t) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCity = t.city.toLowerCase().includes(q);
      const matchPos = t.position.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchPos) return false;
    }

    // Position filter
    if (selectedPosition !== 'all' && t.position !== selectedPosition) {
      return false;
    }

    // City filter
    if (selectedCity !== 'All Cities' && t.city !== selectedCity) {
      return false;
    }

    // Shortlist view tab
    if (activeTab === 'shortlist' && !shortlistedTalentIds.has(t.id)) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Scout Header Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#D97706] text-white p-5 sm:p-6 lg:p-8 shadow-sm border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold">
              {scoutProfile.organization || 'Official Scout'}
            </span>
            <span className="text-xs font-semibold text-white/90 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Scout Discovery Mode
            </span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {scoutProfile.name}
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-xl">
            {talents.length} players match your scouting criteria. Review AI scouting reports, compare match logs, and shortlist local talent.
          </p>
        </div>

        {/* Shortlist Counter Badge */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-[#111827] text-white p-3.5 sm:p-4 rounded-2xl text-center w-full sm:min-w-32 shadow-xs flex sm:flex-col justify-between sm:justify-center items-center">
            <span className="text-[10px] font-mono uppercase text-[#D97706] font-bold block">Shortlisted</span>
            <span className="font-sans text-xl sm:text-2xl font-bold text-white">{shortlists.length} Players</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        
        {/* Top Tab Bar: Talent Feed vs My Shortlist */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E7EB] pb-3 gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onTabChange('feed')}
              id="btn-tab-talent-feed"
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-[#16A34A] text-white'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F5F9]'
              }`}
            >
              All Talent Feed ({talents.length})
            </button>

            <button
              onClick={() => onTabChange('shortlist')}
              id="btn-tab-my-shortlist"
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'shortlist'
                  ? 'bg-[#D97706] text-white'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F5F9]'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>My Shortlist ({shortlists.length})</span>
            </button>
          </div>

          <span className="text-xs text-[#6B7280] hidden sm:inline">
            Showing {filteredTalents.length} candidates
          </span>
        </div>

        {/* Search & Select Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by player name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
            />
          </div>

          {/* Position Select */}
          <div>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value as any)}
              className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] capitalize"
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* City Select */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A]"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Talent Cards Grid */}
      {filteredTalents.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-[#E5E7EB] text-center">
          <p className="font-sans text-xl font-bold text-[#111827]">No Talent Profiles Found</p>
          <p className="text-xs text-[#6B7280] mt-1 mb-4">Try clearing filters or search queries to view all regional players.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedPosition('all');
              setSelectedCity('All Cities');
              onTabChange('feed');
            }}
            className="px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold cursor-pointer hover:bg-[#15803D]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTalents.map((talent) => {
            const isShortlisted = shortlistedTalentIds.has(talent.id);
            const totalGoals = talent.matches.reduce((acc, m) => acc + (m.goals || 0), 0);
            const totalAssists = talent.matches.reduce((acc, m) => acc + (m.assists || 0), 0);
            const totalMinutes = talent.matches.reduce((acc, m) => acc + (m.minutesPlayed || 0), 0);

            return (
              <div
                key={talent.id}
                className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#16A34A]/50 transition-all shadow-xs p-4 sm:p-6 flex flex-col justify-between group relative hover:-translate-y-0.5"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-lg shrink-0">
                        {talent.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] font-bold">
                            {talent.position}
                          </span>
                          <span className="text-[11px] text-[#6B7280] font-semibold">
                            {talent.age} yrs
                          </span>
                        </div>
                        <h3 className="font-sans font-bold text-lg text-[#111827] group-hover:text-[#16A34A] transition-colors leading-tight">
                          {talent.name}
                        </h3>
                        <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#D97706]" />
                          {talent.city}
                        </p>
                      </div>
                    </div>

                    {/* Shortlist Toggle */}
                    <button
                      onClick={() => onToggleShortlist(talent.id)}
                      title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                      id={`btn-shortlist-${talent.id}`}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isShortlisted
                          ? 'bg-[#D97706] text-white border-[#D97706]'
                          : 'bg-[#F8FAFC] text-[#6B7280] border-[#E5E7EB] hover:border-[#D97706] hover:text-[#D97706]'
                      }`}
                    >
                      <BookmarkCheck className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Stat Chips */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-[#F8FAFC] rounded-xl text-center mb-4 border border-[#E5E7EB]">
                    <div>
                      <span className="text-[9px] font-mono text-[#6B7280] uppercase block">Matches</span>
                      <span className="font-sans text-xs font-bold text-[#111827]">{talent.matches.length}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#6B7280] uppercase block">G / A</span>
                      <span className="font-sans text-xs font-bold text-[#16A34A]">{totalGoals}G • {totalAssists}A</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#6B7280] uppercase block">Minutes</span>
                      <span className="font-sans text-xs font-bold text-[#111827]">{totalMinutes}'</span>
                    </div>
                  </div>

                  {/* AI Scouting Report Snippet */}
                  {talent.latestReport ? (
                    <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] mb-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#16A34A] font-bold mb-1">
                        <Sparkles className="w-3 h-3 text-[#D97706]" />
                        <span>AI Scout Verdict</span>
                      </div>
                      <p className="text-xs text-[#111827] font-medium line-clamp-2 italic">
                        "{talent.latestReport.verdict}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#6B7280] italic mb-4">No report generated yet.</p>
                  )}
                </div>

                {/* Footer Action: View Full Profile & Shortlist */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setSelectedTalent(talent)}
                    id={`btn-view-dossier-${talent.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#111827] text-white hover:bg-[#16A34A] text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onToggleShortlist(talent.id)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isShortlisted
                        ? 'bg-[#D97706] text-white border-[#D97706]'
                        : 'bg-white text-[#D97706] border-[#D97706] hover:bg-[#D97706] hover:text-white'
                    }`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Talent Detail Modal */}
      <TalentDetailModal
        talent={selectedTalent}
        isOpen={!!selectedTalent}
        onClose={() => setSelectedTalent(null)}
        isShortlisted={selectedTalent ? shortlistedTalentIds.has(selectedTalent.id) : false}
        onToggleShortlist={onToggleShortlist}
        scoutMode={true}
      />

    </div>
  );
};
