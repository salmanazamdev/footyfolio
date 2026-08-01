import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Check, User, MapPin, Building, FileText, Camera, Shield, Award } from 'lucide-react';
import { UserRole, Position } from '../types';
import { AvatarDisplay } from './AvatarDisplay';

export interface MascotOption {
  id: string;
  name: string;
  category: string;
  svgIcon: string;
  bgGradient: string;
}

export const PRESET_MASCOTS: MascotOption[] = [
  {
    id: 'mascot-lion',
    name: 'Apex Striker Lion',
    category: 'Forward',
    svgIcon: '🦁',
    bgGradient: 'from-amber-500 to-red-600',
  },
  {
    id: 'mascot-falcon',
    name: 'Playmaker Falcon',
    category: 'Midfielder',
    svgIcon: '🦅',
    bgGradient: 'from-emerald-500 to-teal-700',
  },
  {
    id: 'mascot-panther',
    name: 'Defensive Panther',
    category: 'Defender',
    svgIcon: '🐆',
    bgGradient: 'from-indigo-600 to-purple-800',
  },
  {
    id: 'mascot-bear',
    name: 'Goalkeeper Bear',
    category: 'Goalkeeper',
    svgIcon: '🐻',
    bgGradient: 'from-blue-600 to-cyan-700',
  },
  {
    id: 'mascot-eagle',
    name: 'Master Scout Eagle',
    category: 'Scout',
    svgIcon: '🦅',
    bgGradient: 'from-amber-600 to-yellow-500',
  },
  {
    id: 'mascot-lightning',
    name: 'Speed Winger',
    category: 'Winger',
    svgIcon: '⚡',
    bgGradient: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'mascot-shield',
    name: 'Tactical Captain',
    category: 'Captain',
    svgIcon: '🛡️',
    bgGradient: 'from-slate-700 to-slate-900',
  },
  {
    id: 'mascot-trophy',
    name: 'Golden Prodigy',
    category: 'Pro',
    svgIcon: '🏆',
    bgGradient: 'from-amber-400 to-yellow-600',
  },
];

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Rawalpindi', 'Quetta', 'Faisalabad', 'Sialkot'];
const POSITIONS: { value: Position; label: string }[] = [
  { value: 'forward', label: 'Forward / Striker' },
  { value: 'midfielder', label: 'Midfielder' },
  { value: 'defender', label: 'Defender' },
  { value: 'goalkeeper', label: 'Goalkeeper' },
];

export interface ProfileData {
  name: string;
  bio?: string;
  city?: string;
  age?: number;
  position?: Position;
  organization?: string;
  avatarUrl?: string;
  role?: UserRole | null;
}

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  profile?: ProfileData;
  onSelectAvatar?: (newAvatarUrl: string) => void;
  onSaveProfile?: (updated: ProfileData) => void;
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  profile,
  onSelectAvatar,
  onSaveProfile,
}) => {
  const [selectedTab, setSelectedTab] = useState<'mascots' | 'upload'>('mascots');
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [city, setCity] = useState(profile?.city || 'Lahore');
  const [age, setAge] = useState<number>(profile?.age || 19);
  const [position, setPosition] = useState<Position>(profile?.position || 'forward');
  const [organization, setOrganization] = useState(profile?.organization || 'Independent Scout');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || profile?.avatarUrl || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setCity(profile.city || 'Lahore');
      setAge(profile.age || 19);
      if (profile.position) setPosition(profile.position);
      if (profile.organization) setOrganization(profile.organization);
      if (profile.avatarUrl) setPreviewUrl(profile.avatarUrl);
    } else if (currentAvatarUrl) {
      setPreviewUrl(currentAvatarUrl);
    }
  }, [profile, currentAvatarUrl, isOpen]);

  if (!isOpen) return null;

  const role = profile?.role || 'talent';

  // Compress image client-side using Canvas to lightweight WebP/Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPreviewUrl(dataUrl);
        }
        setIsProcessing(false);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleSelectMascot = (mascot: MascotOption) => {
    const mascotDataUrl = `mascot:${mascot.id}`;
    setPreviewUrl(mascotDataUrl);
  };

  const handleSave = () => {
    const finalAvatar = previewUrl || currentAvatarUrl || '';

    const updatedData: ProfileData = {
      name: name.trim() || (role === 'talent' ? 'FootyFolio Player' : 'FootyFolio Scout'),
      bio: bio.trim(),
      city,
      age: Number(age) || 19,
      position,
      organization: organization.trim(),
      avatarUrl: finalAvatar,
      role,
    };

    if (onSaveProfile) {
      onSaveProfile(updatedData);
    }

    if (onSelectAvatar && finalAvatar) {
      onSelectAvatar(finalAvatar);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-[#E5E7EB] relative my-6 max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#6B7280] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#F1F5F9] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-[#E5E7EB] shrink-0">
          <div>
            <AvatarDisplay avatarUrl={previewUrl || currentAvatarUrl} name={name || 'User'} size="lg" />
          </div>
          <div>
            <h3 className="text-lg font-sans font-bold text-[#111827]">
              Update Profile & Mascot
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Customize your public profile, bio, and mascot avatar badge.
            </p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-[#111827]">
          
          {/* PROFILE INFORMATION SECTION */}
          <div className="space-y-4 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E5E7EB]">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-[#4B5563] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#16A34A]" />
              Basic Information
            </h4>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ahmed Khan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
              />
            </div>

            {/* Role specific inputs */}
            {role === 'talent' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Primary Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as Position)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#111827] focus:outline-none focus:border-[#16A34A]"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min={12}
                    max={50}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#111827] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  Scouting Organization / Club
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Lahore City FC or Independent Scout"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#111827] focus:outline-none focus:border-[#D97706]"
                  />
                </div>
              </div>
            )}

            {/* City Select */}
            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1">
                Base City (Pakistan)
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9CA3AF]" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#111827] focus:outline-none focus:border-[#16A34A]"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1">
                Player / Scout Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder={
                  role === 'talent'
                    ? 'Highlight your key playing style, favorite foot, or career goals...'
                    : 'Briefly describe your scouting focus, target age groups, or region...'
                }
                className="w-full px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#111827] focus:outline-none focus:border-[#16A34A] resize-none"
              />
            </div>
          </div>

          {/* MASCOT & AVATAR SELECTION SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-[#4B5563] flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#16A34A]" />
                Mascot Badge or Photo
              </h4>
            </div>

            {/* Tab Toggle */}
            <div className="flex items-center gap-2 p-1 bg-[#F1F5F9] rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedTab('mascots')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  selectedTab === 'mascots'
                    ? 'bg-white text-[#111827] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Football Mascot Badges</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('upload')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  selectedTab === 'upload'
                    ? 'bg-white text-[#111827] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Upload Photo</span>
              </button>
            </div>

            {/* TAB 1: MASCOTS GRID */}
            {selectedTab === 'mascots' && (
              <div className="grid grid-cols-4 gap-2.5 pt-1">
                {PRESET_MASCOTS.map((m) => {
                  const mascotToken = `mascot:${m.id}`;
                  const isSelected = previewUrl === mascotToken;

                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => handleSelectMascot(m)}
                      className={`flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer group relative ${
                        isSelected
                          ? 'border-[#16A34A] bg-[#16A34A]/5 scale-102 shadow-xs'
                          : 'border-[#E5E7EB] hover:border-[#16A34A]/50 bg-white'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.bgGradient} flex items-center justify-center text-2xl shadow-xs text-white relative`}>
                        {m.svgIcon}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center border border-white text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-[#111827] mt-1.5 text-center leading-tight truncate w-full">
                        {m.name.split(' ')[0]}
                      </span>
                      <span className="text-[8px] text-[#6B7280] font-mono uppercase">
                        {m.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 2: IMAGE UPLOAD */}
            {selectedTab === 'upload' && (
              <div className="space-y-3 pt-1">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#CBD5E1] hover:border-[#16A34A] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-center text-[#16A34A] mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#111827]">
                    Click to upload custom player photo
                  </p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">
                    PNG, JPG, or WebP (auto-optimized directly in browser)
                  </p>
                </div>

                {isProcessing && (
                  <p className="text-xs text-center text-[#16A34A] font-medium animate-pulse">
                    Optimizing image for fast load...
                  </p>
                )}

                {previewUrl && !previewUrl.startsWith('mascot:') && (
                  <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB]">
                    <img
                      src={previewUrl}
                      alt="Uploaded preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#16A34A]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#111827]">Custom Photo Selected</p>
                      <p className="text-[10px] text-[#6B7280]">Compressed and ready for your profile dossier</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] pt-4 mt-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B7280] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Profile & Mascot</span>
          </button>
        </div>

      </div>
    </div>
  );
};

