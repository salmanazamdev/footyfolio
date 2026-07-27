import React from 'react';
import { UserRole } from '../types';
import { Logo } from './Logo';
import { Shield, UserCheck, RefreshCw, BookmarkCheck, PlusCircle, LogIn, UserPlus, LogOut } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole | null;
  activeTalentName?: string;
  activeScoutName?: string;
  userEmail?: string;
  onSwitchRole: () => void;
  onOpenLogMatch?: () => void;
  onOpenSchemaModal: () => void;
  shortlistCount?: number;
  onViewShortlist?: () => void;
  activeTab?: 'feed' | 'shortlist';
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  activeTalentName,
  activeScoutName,
  userEmail,
  onSwitchRole,
  onOpenLogMatch,
  onOpenSchemaModal,
  shortlistCount = 0,
  onViewShortlist,
  activeTab = 'feed',
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-3 sm:px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="cursor-pointer group" onClick={onSwitchRole}>
            <Logo size="md" />
          </div>
        </div>

        {/* Center / Right Role Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
          
          {/* LANDING / UNAUTHENTICATED HEADER BUTTONS */}
          {currentRole === null && onOpenAuth && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                id="btn-header-signin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#111827] hover:bg-[#F1F5F9] border border-[#E5E7EB] transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                id="btn-header-signup"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {currentRole === 'talent' && (
            <>
              {/* Role badge */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Player: {activeTalentName || 'Talent'}</span>
              </div>

              {onOpenLogMatch && (
                <button
                  onClick={onOpenLogMatch}
                  id="btn-header-log-match"
                  className="flex items-center gap-1.5 bg-[#16A34A] text-white hover:bg-[#15803D] px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Match</span>
                </button>
              )}
            </>
          )}

          {currentRole === 'scout' && (
            <>
              {/* Role badge */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Scout Mode</span>
              </div>

              {onViewShortlist && (
                <button
                  onClick={onViewShortlist}
                  id="btn-header-shortlist"
                  className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                    activeTab === 'shortlist'
                      ? 'bg-[#D97706] text-white border-[#D97706]'
                      : 'bg-white text-[#111827] border-[#E5E7EB] hover:border-[#D97706]'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">My Shortlist</span>
                  {shortlistCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#111827] text-white text-[10px] font-bold">
                      {shortlistCount}
                    </span>
                  )}
                </button>
              )}
            </>
          )}

          {/* Logout Button if Logged In */}
          {currentRole !== null && (
            <button
              onClick={onSwitchRole}
              id="btn-header-switch-role"
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F5F9] border border-[#E5E7EB] transition-all cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch View</span>
            </button>
          )}

          {/* Logout Button if Logged In */}
          {onLogout && currentRole !== null && (
            <button
              onClick={onLogout}
              id="btn-header-logout"
              title="Sign Out"
              className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

