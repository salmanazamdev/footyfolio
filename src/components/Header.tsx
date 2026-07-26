import React from 'react';
import { UserRole } from '../types';
import { Shield, UserCheck, RefreshCw, Database, BookmarkCheck, PlusCircle } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole | null;
  activeTalentName?: string;
  activeScoutName?: string;
  onSwitchRole: () => void;
  onOpenLogMatch?: () => void;
  onOpenSchemaModal: () => void;
  shortlistCount?: number;
  onViewShortlist?: () => void;
  activeTab?: 'feed' | 'shortlist';
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  activeTalentName,
  activeScoutName,
  onSwitchRole,
  onOpenLogMatch,
  onOpenSchemaModal,
  shortlistCount = 0,
  onViewShortlist,
  activeTab = 'feed'
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F6F1E7]/95 backdrop-blur-md border-b border-[#8C8577]/20 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Wordmark Logo */}
        <div className="flex items-center gap-3">
          <div className="cursor-pointer group" onClick={onSwitchRole}>
            <div className="flex items-baseline">
              <span className="font-serif-heading text-2xl lg:text-3xl font-bold tracking-tight text-[#1E1C19] group-hover:text-[#2D5D3F] transition-colors">
                footyfolio
              </span>
              <span className="text-[#C9862E] text-2xl lg:text-3xl font-black leading-none ml-[1px]">.</span>
            </div>
            <p className="text-[11px] font-sans text-[#8C8577] tracking-wider uppercase -mt-1 font-medium">
              get scouted. get seen.
            </p>
          </div>
        </div>

        {/* Center / Right Role Controls */}
        <div className="flex items-center gap-2 lg:gap-3">
          {currentRole === 'talent' && (
            <>
              {/* Role badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5D3F]/10 border border-[#2D5D3F]/30 text-[#2D5D3F] text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Player: {activeTalentName || 'Talent'}</span>
              </div>

              {onOpenLogMatch && (
                <button
                  onClick={onOpenLogMatch}
                  id="btn-header-log-match"
                  className="flex items-center gap-1.5 bg-[#2D5D3F] text-[#F6F1E7] hover:bg-[#234932] px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Log Match</span>
                </button>
              )}
            </>
          )}

          {currentRole === 'scout' && (
            <>
              {/* Role badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9862E]/10 border border-[#C9862E]/30 text-[#C9862E] text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Scout Mode</span>
              </div>

              {onViewShortlist && (
                <button
                  onClick={onViewShortlist}
                  id="btn-header-shortlist"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeTab === 'shortlist'
                      ? 'bg-[#C9862E] text-white border-[#C9862E]'
                      : 'bg-white text-[#1E1C19] border-[#8C8577]/30 hover:border-[#C9862E]'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>My Shortlist</span>
                  {shortlistCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#1E1C19] text-[#F6F1E7] text-[10px] font-bold">
                      {shortlistCount}
                    </span>
                  )}
                </button>
              )}
            </>
          )}

          {/* Schema Info Button */}
          <button
            onClick={onOpenSchemaModal}
            title="Supabase Schema & Environment Info"
            id="btn-header-schema"
            className="p-2 rounded-lg text-[#8C8577] hover:text-[#1E1C19] hover:bg-[#8C8577]/10 transition-colors"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Switch Role Button */}
          <button
            onClick={onSwitchRole}
            id="btn-header-switch-role"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8C8577] hover:text-[#1E1C19] hover:bg-[#8C8577]/10 border border-[#8C8577]/20 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Switch Role</span>
          </button>
        </div>

      </div>
    </header>
  );
};
