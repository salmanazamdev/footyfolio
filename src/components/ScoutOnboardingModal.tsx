import React, { useState } from 'react';
import { ScoutProfile, Position } from '../types';
import { Shield, Search, Check, ArrowRight } from 'lucide-react';

interface ScoutOnboardingModalProps {
  isOpen: boolean;
  onComplete: (scoutProfile: ScoutProfile) => void;
  onCancel?: () => void;
}

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Rawalpindi', 'Quetta', 'Faisalabad', 'Sialkot'];
const POSITIONS: Position[] = ['goalkeeper', 'defender', 'midfielder', 'forward'];

export const ScoutOnboardingModal: React.FC<ScoutOnboardingModalProps> = ({
  isOpen,
  onComplete,
  onCancel
}) => {
  const [name, setName] = useState<string>('Coach Tariq Mahmood');
  const [organization, setOrganization] = useState<string>('Lahore Youth Academy');
  const [selectedPositions, setSelectedPositions] = useState<Position[]>(['forward', 'midfielder']);
  const [selectedCities, setSelectedCities] = useState<string[]>(['Lahore', 'Karachi', 'Islamabad']);

  if (!isOpen) return null;

  const togglePosition = (pos: Position) => {
    if (selectedPositions.includes(pos)) {
      if (selectedPositions.length === 1) return; // Keep at least one
      setSelectedPositions(selectedPositions.filter((p) => p !== pos));
    } else {
      setSelectedPositions([...selectedPositions, pos]);
    }
  };

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      if (selectedCities.length === 1) return;
      setSelectedCities(selectedCities.filter((c) => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: ScoutProfile = {
      id: 'scout-' + Date.now(),
      userId: 'scout-user-' + Date.now(),
      name,
      organization,
      targetPositions: selectedPositions,
      targetCities: selectedCities,
      createdAt: new Date().toISOString()
    };
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#F6F1E7] border-2 border-[#1E1C19] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="bg-[#C9862E] text-[#1E1C19] p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E1C19]/80 font-bold block">
              Scout & Coach Registration
            </span>
            <h3 className="font-serif-heading text-xl font-bold">Scout Onboarding</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center text-[#1E1C19]">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-[#1E1C19] mb-1">Your Name / Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[#8C8577]/30 bg-white text-xs text-[#1E1C19] focus:outline-hidden focus:border-[#C9862E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E1C19] mb-1">Club / Organization</label>
            <input
              type="text"
              placeholder="e.g. Lahore Academy / Independent Scout"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[#8C8577]/30 bg-white text-xs text-[#1E1C19] focus:outline-hidden focus:border-[#C9862E]"
            />
          </div>

          {/* Target Positions Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#1E1C19] mb-1.5">Positions You Are Scouting For</label>
            <div className="grid grid-cols-2 gap-2">
              {POSITIONS.map((pos) => {
                const isSel = selectedPositions.includes(pos);
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => togglePosition(pos)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border transition-all capitalize ${
                      isSel
                        ? 'bg-[#C9862E] text-white border-[#C9862E]'
                        : 'bg-white text-[#1E1C19] border-[#8C8577]/30 hover:border-[#C9862E]'
                    }`}
                  >
                    <span>{pos}</span>
                    {isSel && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Cities Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#1E1C19] mb-1.5">Target Scouting Cities</label>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map((c) => {
                const isSel = selectedCities.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCity(c)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      isSel
                        ? 'bg-[#1E1C19] text-[#F6F1E7] border-[#1E1C19]'
                        : 'bg-white text-[#8C8577] border-[#8C8577]/30 hover:border-[#1E1C19]'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#8C8577]/20">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-[#8C8577] hover:text-[#1E1C19] font-medium"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              id="btn-scout-onboarding-submit"
              className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#C9862E] text-[#1E1C19] text-xs font-bold hover:bg-[#b07425] shadow-xs transition-all"
            >
              <span>Access Pre-Filtered Talent Feed</span>
              <Search className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
