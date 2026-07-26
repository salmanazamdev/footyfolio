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
      <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="bg-[#D97706] text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/80 font-bold block">
              Scout & Coach Registration
            </span>
            <h3 className="font-sans text-xl font-bold">Scout Onboarding</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">Your Name / Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">Club / Organization</label>
            <input
              type="text"
              placeholder="e.g. Lahore Academy / Independent Scout"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3.5 h-11 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
            />
          </div>

          {/* Target Positions Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1.5">Positions You Are Scouting For</label>
            <div className="grid grid-cols-2 gap-2">
              {POSITIONS.map((pos) => {
                const isSel = selectedPositions.includes(pos);
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => togglePosition(pos)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all capitalize cursor-pointer ${
                      isSel
                        ? 'bg-[#D97706] text-white border-[#D97706]'
                        : 'bg-[#F8FAFC] text-[#111827] border-[#E5E7EB] hover:border-[#D97706]'
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
            <label className="block text-xs font-semibold text-[#111827] mb-1.5">Target Scouting Cities</label>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map((c) => {
                const isSel = selectedCities.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCity(c)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#111827] text-white border-[#111827]'
                        : 'bg-[#F8FAFC] text-[#6B7280] border-[#E5E7EB] hover:border-[#111827]'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#E5E7EB]">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-[#6B7280] hover:text-[#111827] font-medium cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              id="btn-scout-onboarding-submit"
              className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] shadow-xs transition-all cursor-pointer"
            >
              <span>Access Talent Feed</span>
              <Search className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
