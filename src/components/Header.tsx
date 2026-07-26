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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Wordmark Logo */}
        <div className="flex items-center gap-3">
          <div className="cursor-pointer group" onClick={onSwitchRole}>
            <div className="flex items-baseline">
              <span className="font-sans text-2xl lg:text-3xl font-bold tracking-tight text-[#111827] group-hover:text-[#16A34A] transition-colors">
                footyfolio
              </span>
              <span className="text-[#D97706] text-2xl lg:text-3xl font-black leading-none ml-[1px]">.</span>
            </div>
            <p className="text-[10px] font-sans text-[#6B7280] tracking-wider uppercase -mt-0.5 font-semibold">
              get scouted. get seen.
            </p>
          </div>
        </div>

        {/* Center / Right Role Controls */}
        <div className="flex items-center gap-2 lg:gap-3">
          {currentRole === 'talent' && (
            <>
              {/* Role badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Player: {activeTalentName || 'Talent'}</span>
              </div>

              {onOpenLogMatch && (
                <button
                  onClick={onOpenLogMatch}
                  id="btn-header-log-match"
                  className="flex items-center gap-1.5 bg-[#16A34A] text-white hover:bg-[#15803D] px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
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
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Scout Mode</span>
              </div>

              {onViewShortlist && (
                <button
                  onClick={onViewShortlist}
                  id="btn-header-shortlist"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    activeTab === 'shortlist'
                      ? 'bg-[#D97706] text-white border-[#D97706]'
                      : 'bg-white text-[#111827] border-[#E5E7EB] hover:border-[#D97706]'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>My Shortlist</span>
                  {shortlistCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#111827] text-white text-[10px] font-bold">
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
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F5F9] transition-colors"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Switch Role Button */}
          <button
            onClick={onSwitchRole}
            id="btn-header-switch-role"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F5F9] border border-[#E5E7EB] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Switch Role</span>
          </button>
        </div>

      </div>
    </header>
  );
};
