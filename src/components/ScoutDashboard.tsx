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
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Scout Header Banner */}
      <div className="rounded-2xl bg-[#C9862E] text-[#1E1C19] p-6 lg:p-8 shadow-md border-2 border-[#C9862E] flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-black/10 text-[#1E1C19] font-bold">
              {scoutProfile.organization || 'Official Scout'}
            </span>
            <span className="text-xs font-semibold text-[#1E1C19]/80 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Scout Discovery Mode
            </span>
          </div>
          <h1 className="font-serif-heading text-3xl font-bold text-[#1E1C19]">
            {scoutProfile.name}
          </h1>
          <p className="text-xs text-[#1E1C19]/80 mt-1 max-w-xl">
            Review AI scouting reports, compare match logs, and shortlist local amateur prospects across Pakistan.
          </p>
        </div>

        {/* Shortlist Counter Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-[#1E1C19] text-[#F6F1E7] p-4 rounded-xl text-center min-w-32">
            <span className="text-[10px] font-mono uppercase text-[#C9862E] font-bold block">Shortlisted</span>
            <span className="font-serif-heading text-2xl font-bold">{shortlists.length} Players</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#8C8577]/20 shadow-xs space-y-4">
        
        {/* Top Tab Bar: Talent Feed vs My Shortlist */}
        <div className="flex items-center justify-between border-b border-[#8C8577]/20 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange('feed')}
              id="btn-tab-talent-feed"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'feed'
                  ? 'bg-[#2D5D3F] text-[#F6F1E7]'
                  : 'text-[#8C8577] hover:text-[#1E1C19] hover:bg-black/5'
              }`}
            >
              All Talent Feed ({talents.length})
            </button>

            <button
              onClick={() => onTabChange('shortlist')}
              id="btn-tab-my-shortlist"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'shortlist'
                  ? 'bg-[#C9862E] text-[#1E1C19]'
                  : 'text-[#8C8577] hover:text-[#1E1C19] hover:bg-black/5'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>My Shortlist ({shortlists.length})</span>
            </button>
          </div>

          <span className="text-xs text-[#8C8577] hidden sm:inline">
            Showing {filteredTalents.length} candidates
          </span>
        </div>

        {/* Search & Select Controls */}
        <div className="grid md:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C8577] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by player name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#8C8577]/30 bg-[#F6F1E7]/50 text-xs text-[#1E1C19] focus:outline-hidden focus:border-[#C9862E]"
            />
          </div>

          {/* Position Select */}
          <div>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#8C8577]/30 bg-[#F6F1E7]/50 text-xs text-[#1E1C19] focus:outline-hidden focus:border-[#C9862E] capitalize"
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
              className="w-full px-3 py-2 rounded-xl border border-[#8C8577]/30 bg-[#F6F1E7]/50 text-xs text-[#1E1C19] focus:outline-hidden focus:border-[#C9862E]"
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
        <div className="bg-white p-12 rounded-2xl border border-dashed border-[#8C8577]/30 text-center">
          <p className="font-serif-heading text-xl font-bold text-[#1E1C19]">No Talent Profiles Found</p>
          <p className="text-xs text-[#8C8577] mt-1 mb-4">Try clearing filters or search queries to view all regional players.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedPosition('all');
              setSelectedCity('All Cities');
              onTabChange('feed');
            }}
            className="px-4 py-2 rounded-lg bg-[#2D5D3F] text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTalents.map((talent) => {
            const isShortlisted = shortlistedTalentIds.has(talent.id);
            const totalGoals = talent.matches.reduce((acc, m) => acc + (m.goals || 0), 0);
            const totalAssists = talent.matches.reduce((acc, m) => acc + (m.assists || 0), 0);
            const totalMinutes = talent.matches.reduce((acc, m) => acc + (m.minutesPlayed || 0), 0);

            return (
              <div
                key={talent.id}
                className="bg-white rounded-2xl border-2 border-[#1E1C19]/10 hover:border-[#2D5D3F] transition-all shadow-xs p-6 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#2D5D3F] text-[#F6F1E7] flex items-center justify-center font-serif-heading font-bold text-lg">
                        {talent.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.2 rounded bg-[#2D5D3F]/10 text-[#2D5D3F] font-bold">
                            {talent.position}
                          </span>
                          <span className="text-[11px] text-[#8C8577] font-semibold">
                            {talent.age} yrs
                          </span>
                        </div>
                        <h3 className="font-serif-heading font-bold text-lg text-[#1E1C19] group-hover:text-[#2D5D3F] transition-colors leading-tight">
                          {talent.name}
                        </h3>
                        <p className="text-xs text-[#8C8577] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#C9862E]" />
                          {talent.city}
                        </p>
                      </div>
                    </div>

                    {/* Shortlist Toggle */}
                    <button
                      onClick={() => onToggleShortlist(talent.id)}
                      title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                      id={`btn-shortlist-${talent.id}`}
                      className={`p-2 rounded-xl border transition-all ${
                        isShortlisted
                          ? 'bg-[#C9862E] text-white border-[#C9862E]'
                          : 'bg-[#F6F1E7] text-[#8C8577] border-[#8C8577]/30 hover:border-[#C9862E] hover:text-[#C9862E]'
                      }`}
                    >
                      <BookmarkCheck className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Stat Chips */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-[#F6F1E7] rounded-xl text-center mb-4">
                    <div>
                      <span className="text-[9px] font-mono text-[#8C8577] uppercase block">Matches</span>
                      <span className="font-serif-heading text-xs font-bold text-[#1E1C19]">{talent.matches.length}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#8C8577] uppercase block">G / A</span>
                      <span className="font-serif-heading text-xs font-bold text-[#2D5D3F]">{totalGoals}G • {totalAssists}A</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#8C8577] uppercase block">Minutes</span>
                      <span className="font-serif-heading text-xs font-bold text-[#1E1C19]">{totalMinutes}'</span>
                    </div>
                  </div>

                  {/* AI Scouting Report Snippet */}
                  {talent.latestReport ? (
                    <div className="p-3.5 bg-white/80 rounded-xl border border-[#2D5D3F]/20 mb-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#2D5D3F] font-bold mb-1">
                        <Sparkles className="w-3 h-3 text-[#C9862E]" />
                        <span>AI Scout Verdict</span>
                      </div>
                      <p className="text-xs text-[#1E1C19] font-medium line-clamp-2 italic">
                        "{talent.latestReport.verdict}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#8C8577] italic mb-4">No report generated yet.</p>
                  )}
                </div>

                {/* Footer Action: View Full Profile */}
                <button
                  onClick={() => setSelectedTalent(talent)}
                  id={`btn-view-dossier-${talent.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1E1C19] text-[#F6F1E7] hover:bg-[#2D5D3F] text-xs font-bold transition-all"
                >
                  <span>View Full Scouting Dossier</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

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
