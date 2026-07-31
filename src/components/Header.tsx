import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '../types';
import { Logo } from './Logo';
import { AvatarDisplay } from './AvatarDisplay';
import { Shield, UserCheck, BookmarkCheck, PlusCircle, LogIn, UserPlus, LogOut, ChevronDown, Database, User } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole | null;
  activeTalentName?: string;
  activeScoutName?: string;
  userEmail?: string;
  avatarUrl?: string;
  isGuest?: boolean;
  onOpenLogMatch?: () => void;
  onOpenSchemaModal?: () => void;
  onOpenAvatarModal?: () => void;
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
  avatarUrl,
  isGuest,
  onOpenLogMatch,
  onOpenSchemaModal,
  onOpenAvatarModal,
  shortlistCount = 0,
  onViewShortlist,
  activeTab = 'feed',
  onOpenAuth,
  onLogout,
}) => {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = activeTalentName || activeScoutName || 'User Account';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-3 sm:px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="group">
            <Logo size="md" />
          </div>
        </div>

        {/* Center / Right Role Controls & Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* LANDING / UNAUTHENTICATED HEADER BUTTONS */}
          {currentRole === null && onOpenAuth && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                id="btn-header-signin"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#111827] hover:bg-[#F1F5F9] border border-[#E5E7EB] transition-all cursor-pointer"
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

          {/* AUTHENTICATED USER HEADER CONTROLS */}
          {currentRole !== null && (
            <>
              {currentRole === 'talent' && (
                <>
                  <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-xs font-semibold">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Player Profile</span>
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
                  <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] text-xs font-semibold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Scout Profile</span>
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

              {/* Profile Avatar Button & Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  id="btn-header-profile-menu"
                  className="flex items-center gap-1.5 p-0.5 sm:p-1 rounded-full border-2 border-[#E5E7EB] hover:border-[#16A34A] focus:outline-hidden transition-all cursor-pointer bg-white shadow-2xs"
                  title="User Profile Menu"
                >
                  <AvatarDisplay avatarUrl={avatarUrl} name={displayName} size="sm" />
                  <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xl z-50 overflow-hidden text-[#111827] animate-fade-in">
                    
                    {/* Header User Details Section */}
                    <div className="p-4 bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-3">
                        <AvatarDisplay avatarUrl={avatarUrl} name={displayName} size="lg" />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-sans font-bold text-sm text-[#111827] truncate">
                            {displayName}
                          </h4>
                          {userEmail && (
                            <p className="text-xs text-[#6B7280] truncate font-medium mt-0.5">
                              {userEmail}
                            </p>
                          )}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              currentRole === 'talent' 
                                ? 'bg-[#16A34A]/15 text-[#16A34A]' 
                                : 'bg-[#D97706]/15 text-[#D97706]'
                            }`}>
                              {currentRole === 'talent' ? 'Player Profile' : 'Scout Account'}
                            </span>
                            {isGuest && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
                                Saved Locally
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Guest Local Storage & Sync Notice */}
                      {isGuest && (
                        <div className="mt-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs space-y-2">
                          <p className="text-[11px] text-[#475569]">
                            🔒 Operating in <strong>Guest Mode</strong>. All matches & edits are stored in your local browser.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenAuth) {
                                onOpenAuth('signup');
                              } else {
                                router.push('/signup');
                              }
                            }}
                            className="w-full py-1.5 px-3 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Sync & Save to Cloud Account</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Menu Actions */}
                    <div className="p-2 space-y-1 text-xs font-medium">
                      {onOpenAvatarModal && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenAvatarModal();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#F8FAFC] text-[#374151] hover:text-[#16A34A] transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 text-[#6B7280]" />
                          <span>Change Mascot / Photo</span>
                        </button>
                      )}

                      {currentRole === 'talent' && onOpenLogMatch && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onOpenLogMatch();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#F8FAFC] text-[#374151] hover:text-[#16A34A] transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4 text-[#16A34A]" />
                          <span>Log Match Performance</span>
                        </button>
                      )}

                      {currentRole === 'scout' && onViewShortlist && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onViewShortlist();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#F8FAFC] text-[#374151] hover:text-[#D97706] transition-colors cursor-pointer"
                        >
                          <BookmarkCheck className="w-4 h-4 text-[#D97706]" />
                          <span>View Shortlisted Players ({shortlistCount})</span>
                        </button>
                      )}
                    </div>

                    {/* Logout Footer Section */}
                    {onLogout && (
                      <div className="p-2 border-t border-[#E5E7EB] bg-[#FAF5FF]/30">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onLogout();
                          }}
                          id="btn-header-logout"
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
};


