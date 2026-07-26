import React from 'react';
import { UserCheck, Shield, Sparkles, ArrowRight, Activity, Award, Search, CheckCircle2 } from 'lucide-react';

interface LandingHeroProps {
  onSelectRole: (role: 'talent' | 'scout') => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onSelectRole }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 animate-fade-in">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1C19] text-[#F6F1E7] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#C9862E]" />
              <span className="text-[#2D5D3F] font-bold uppercase tracking-widest text-[11px]">get scouted. get seen.</span>
            </div>

            <h1 className="font-serif-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-[#1E1C19]">
              Your professional <br />
              <span className="text-[#2D5D3F] italic">pitch record</span>
            </h1>

            <p className="text-base sm:text-lg text-[#8C8577] max-w-xl leading-relaxed">
              Bridging the gap between amateur football and professional scouting across Pakistan. Record your match stats, let AI build your scouting dossier, and get discovered by local coaches.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
            <button
              onClick={() => onSelectRole('talent')}
              id="btn-landing-player"
              className="flex-1 flex items-center justify-between px-6 py-4 rounded-xl bg-[#2D5D3F] text-[#F6F1E7] font-serif-heading font-bold text-lg hover:bg-[#234932] shadow-md transition-all active:scale-[0.98] group"
            >
              <span>I'm a player</span>
              <ArrowRight className="w-5 h-5 text-[#C9862E] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onSelectRole('scout')}
              id="btn-landing-scout"
              className="flex-1 flex items-center justify-between px-6 py-4 rounded-xl bg-[#C9862E] text-[#1E1C19] font-serif-heading font-bold text-lg hover:bg-[#b07425] shadow-md transition-all active:scale-[0.98] group"
            >
              <span>I'm a scout</span>
              <ArrowRight className="w-5 h-5 text-[#1E1C19] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Stats Ticker Row */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#8C8577]/30 max-w-lg">
            <div>
              <div className="text-3xl font-serif-heading font-bold text-[#1E1C19]">4.8k</div>
              <div className="text-[10px] text-[#8C8577] uppercase font-bold tracking-wider">Active Players</div>
            </div>
            <div>
              <div className="text-3xl font-serif-heading font-bold text-[#1E1C19]">150+</div>
              <div className="text-[10px] text-[#8C8577] uppercase font-bold tracking-wider">Verified Scouts</div>
            </div>
            <div>
              <div className="text-3xl font-serif-heading font-bold text-[#1E1C19]">12</div>
              <div className="text-[10px] text-[#8C8577] uppercase font-bold tracking-wider">Cities Covered</div>
            </div>
          </div>

        </div>

        {/* Right Column: Featured AI Scouting Dossier Card Preview */}
        <div className="lg:col-span-5 relative">
          <div className="bg-[#2D5D3F] p-6 sm:p-8 rounded-3xl border-2 border-[#1E1C19] shadow-2xl relative overflow-hidden flex flex-col justify-center items-center">
            
            {/* Background Texture Overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #F6F1E7 25%, #F6F1E7 75%, #000 75%, #000)`,
                backgroundSize: `20px 20px`
              }}
            />

            {/* Dossier Card */}
            <div className="bg-[#F6F1E7] text-[#1E1C19] w-full p-6 sm:p-7 rounded-2xl shadow-xl relative z-10 border-l-4 border-[#C9862E] border-t border-r border-b border-[#8C8577]/30">
              
              <div className="flex justify-between items-start mb-4 border-b border-[#8C8577]/30 pb-3">
                <div>
                  <div className="text-[#8C8577] text-[10px] font-bold font-mono uppercase tracking-widest mb-1">
                    DOSSIER ID: 772-LHR
                  </div>
                  <h3 className="font-serif-heading text-2xl font-bold">Ahmed Khan, 19</h3>
                  <div className="text-[#2D5D3F] text-xs font-bold uppercase tracking-wider">Forward • Lahore</div>
                </div>
                <div className="bg-[#2D5D3F] text-[#F6F1E7] px-2.5 py-1 text-xs font-mono font-bold rounded">
                  VERIFIED
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="text-[#8C8577] text-[10px] font-bold font-mono uppercase tracking-widest mb-1">
                    AI Scout Summary
                  </h4>
                  <p className="italic leading-relaxed text-[#1E1C19] bg-white p-3 rounded-lg border border-[#8C8577]/20">
                    "Ahmed shows exceptional spatial awareness in the final third. Goal involvement per 90 is significantly above average for his age group."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-[#8C8577]/20">
                    <h4 className="text-[#2D5D3F] text-[10px] font-bold font-mono uppercase tracking-widest mb-1">
                      Strengths
                    </h4>
                    <ul className="font-semibold space-y-1 text-[#1E1C19]">
                      <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#2D5D3F]" /> Acceleration</li>
                      <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#2D5D3F]" /> First Touch</li>
                      <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#2D5D3F]" /> Finishing</li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#8C8577]/20">
                    <h4 className="text-[#C9862E] text-[10px] font-bold font-mono uppercase tracking-widest mb-1">
                      To Develop
                    </h4>
                    <ul className="font-semibold space-y-1 text-[#1E1C19]">
                      <li>• Defensive Workrate</li>
                      <li>• Weak-foot utility</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#1E1C19] text-[#F6F1E7] p-3 rounded-lg text-center">
                  <div className="text-[9px] uppercase tracking-widest text-[#C9862E] font-bold mb-0.5">Final Verdict</div>
                  <div className="font-serif-heading italic font-bold text-xs text-white">
                    "Worth a closer look at trial stage. Highly promising."
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Feature Matchday Program Highlights */}
      <div className="mt-12 pt-8 border-t border-[#8C8577]/30 grid md:grid-cols-3 gap-6 text-[#1E1C19]">
        <div className="p-5 rounded-2xl bg-white border border-[#8C8577]/20 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#2D5D3F]/10 text-[#2D5D3F] flex items-center justify-center mb-3">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-serif-heading font-bold text-lg mb-1">Match Statistics Logging</h3>
          <p className="text-xs text-[#8C8577] leading-relaxed">
            Record goals, assists, minutes, and match notes after every game in under 30 seconds.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#8C8577]/20 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#C9862E]/10 text-[#C9862E] flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-serif-heading font-bold text-lg mb-1">AI Scout Dossiers</h3>
          <p className="text-xs text-[#8C8577] leading-relaxed">
            Gemini synthesizes match data into professional reports: summary, strengths, areas to develop, and verdict.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#8C8577]/20 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#1E1C19]/10 text-[#1E1C19] flex items-center justify-center mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-serif-heading font-bold text-lg mb-1">Direct Scout Discovery</h3>
          <p className="text-xs text-[#8C8577] leading-relaxed">
            Coaches search by position and city (Lahore, Karachi, Islamabad) to bookmark top talent for trials.
          </p>
        </div>
      </div>

    </div>
  );
};

