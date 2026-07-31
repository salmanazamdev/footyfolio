import React from 'react';
import { ArrowRight, Activity, Award, Search, CheckCircle2, Zap } from 'lucide-react';

interface LandingHeroProps {
  onSelectRole: (role: 'talent' | 'scout') => void;
  onOpenAuth?: (mode: 'signin' | 'signup', role?: 'talent' | 'scout') => void;
  onGuestAccess?: (role?: 'talent' | 'scout') => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onSelectRole, onOpenAuth, onGuestAccess }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 animate-fade-in">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="space-y-4">
            <h1 className="font-sans text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-[#111827]">
              Your professional <br />
              <span className="text-[#16A34A] italic">pitch record</span>
            </h1>

            <p className="text-base sm:text-lg text-[#6B7280] max-w-xl leading-relaxed">
              Bridging the gap between amateur football and professional scouting across Pakistan. Record your match stats, let AI build your scouting dossier, and get discovered by local coaches.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 max-w-lg">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onOpenAuth ? onOpenAuth('signup', 'talent') : onSelectRole('talent')}
                id="btn-landing-player"
                className="flex-1 flex items-center justify-between px-6 py-4 rounded-xl bg-[#16A34A] text-white font-sans font-bold text-lg hover:bg-[#15803D] shadow-sm transition-all active:scale-[0.98] group cursor-pointer"
              >
                <span>I'm a player</span>
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onOpenAuth ? onOpenAuth('signup', 'scout') : onSelectRole('scout')}
                id="btn-landing-scout"
                className="flex-1 flex items-center justify-between px-6 py-4 rounded-xl bg-[#D97706] text-white font-sans font-bold text-lg hover:bg-[#B45309] shadow-sm transition-all active:scale-[0.98] group cursor-pointer"
              >
                <span>I'm a scout</span>
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {onOpenAuth && (
              <div className="text-center sm:text-left pt-1">
                <p className="text-xs text-[#6B7280]">
                  Already registered?{' '}
                  <button
                    onClick={() => onOpenAuth('signin')}
                    id="btn-landing-signin-link"
                    className="text-[#16A34A] font-bold hover:underline cursor-pointer"
                  >
                    Sign in to your account →
                  </button>
                </p>
              </div>
            )}

            {/* Single Clean Guest Mode Button */}
            <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#6B7280] text-xs">
                <Zap className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>Want to test first without creating an account?</span>
              </div>
              <button
                type="button"
                onClick={() => onGuestAccess ? onGuestAccess() : onSelectRole('talent')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] hover:border-[#16A34A] hover:bg-white text-xs font-bold text-[#111827] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue as Guest</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Featured AI Scouting Dossier Card Preview */}
        <div className="lg:col-span-5 relative">
          <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-3xl border border-[#E5E7EB] shadow-sm relative flex flex-col justify-center items-center">
            
            {/* Dossier Card */}
            <div className="bg-white text-[#111827] w-full p-5 sm:p-6 rounded-2xl shadow-sm relative z-10 border border-[#E5E7EB] border-l-4 border-l-[#16A34A]">
              
              <div className="border-b border-[#E5E7EB] pb-3 mb-4">
                <h3 className="font-sans text-2xl font-bold text-[#111827]">Ahmed Khan, 19</h3>
                <div className="text-[#16A34A] text-xs font-bold uppercase tracking-wider mt-0.5">Forward • Lahore</div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider mb-1">
                    AI Scout Summary
                  </h4>
                  <p className="italic leading-relaxed text-[#334155] bg-[#F8FAFC] p-3 rounded-xl border border-[#E5E7EB]">
                    "Ahmed shows exceptional spatial awareness in the final third. Goal involvement per 90 is significantly above average for his age group."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <h4 className="text-[#16A34A] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                      Strengths
                    </h4>
                    <ul className="font-semibold space-y-1 text-[#111827] text-[11px]">
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" /> Acceleration</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" /> First Touch</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" /> Finishing</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    <h4 className="text-[#D97706] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                      To Develop
                    </h4>
                    <ul className="font-semibold space-y-1 text-[#111827] text-[11px]">
                      <li className="flex items-center gap-1"><span className="text-[#D97706] font-bold">•</span> Defensive Workrate</li>
                      <li className="flex items-center gap-1"><span className="text-[#D97706] font-bold">•</span> Weak-foot utility</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#0F172A] text-white p-3 rounded-xl text-center">
                  <div className="text-[9px] uppercase tracking-wider text-[#D97706] font-bold mb-0.5">Final Verdict</div>
                  <div className="font-sans italic font-semibold text-xs text-slate-100">
                    "Worth a closer look at trial stage. Highly promising."
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Feature Highlights */}
      <div className="mt-16 pt-8 border-t border-[#E5E7EB] grid md:grid-cols-3 gap-6 text-[#111827]">
        <div 
          onClick={() => onOpenAuth ? onOpenAuth('signup', 'talent') : onSelectRole('talent')}
          className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs hover:border-[#16A34A] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mb-3 group-hover:bg-[#16A34A] group-hover:text-white transition-colors">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-lg mb-1 group-hover:text-[#16A34A] transition-colors">Match Statistics Logging</h3>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Record goals, assists, minutes, and match notes after every game in under 30 seconds.
          </p>
        </div>

        <div 
          onClick={() => onOpenAuth ? onOpenAuth('signup', 'talent') : onSelectRole('talent')}
          className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs hover:border-[#16A34A] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mb-3 group-hover:bg-[#16A34A] group-hover:text-white transition-colors">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-lg mb-1 group-hover:text-[#16A34A] transition-colors">AI Scout Dossiers</h3>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Gemini synthesizes match data into professional reports: summary, strengths, areas to develop, and verdict.
          </p>
        </div>

        <div 
          onClick={() => onOpenAuth ? onOpenAuth('signup', 'scout') : onSelectRole('scout')}
          className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs hover:border-[#D97706] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center mb-3 group-hover:bg-[#D97706] group-hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-lg mb-1 group-hover:text-[#D97706] transition-colors">Direct Scout Discovery</h3>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Coaches search by position and city (Lahore, Karachi, Islamabad) to bookmark top talent for trials.
          </p>
        </div>
      </div>

    </div>
  );
};

