import React, { useState, useRef } from 'react';
import { X, Upload, Check, User, Image as ImageIcon } from 'lucide-react';

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

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  onSelectAvatar: (newAvatarUrl: string) => void;
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSelectAvatar,
}) => {
  const [selectedTab, setSelectedTab] = useState<'mascots' | 'upload'>('mascots');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compress image client-side using Canvas to lightweight WebP/Base64 under ~50KB
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
          // Compress to WebP / JPEG
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
    // We encode mascots as mascot SVG data URLs or custom tokens
    const mascotDataUrl = `mascot:${mascot.id}`;
    setPreviewUrl(mascotDataUrl);
  };

  const handleSave = () => {
    if (previewUrl) {
      onSelectAvatar(previewUrl);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E7EB] relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6B7280] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#F1F5F9] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-sans font-bold text-[#111827]">
              Choose Profile Avatar
            </h3>
            <p className="text-xs text-[#6B7280]">
              Select a cool football mascot or upload your own picture (100% Free)
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 p-1 bg-[#F1F5F9] rounded-2xl mb-6">
          <button
            onClick={() => setSelectedTab('mascots')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTab === 'mascots'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            🔥 Cool Mascot Badges
          </button>
          <button
            onClick={() => setSelectedTab('upload')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTab === 'upload'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            📷 Upload My Photo
          </button>
        </div>

        {/* TAB 1: MASCOTS GRID */}
        {selectedTab === 'mascots' && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {PRESET_MASCOTS.map((m) => {
              const mascotToken = `mascot:${m.id}`;
              const isSelected = previewUrl === mascotToken;

              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMascot(m)}
                  className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all cursor-pointer group relative ${
                    isSelected
                      ? 'border-[#16A34A] bg-[#16A34A]/5 scale-105 shadow-md'
                      : 'border-[#E5E7EB] hover:border-[#16A34A]/50 bg-white'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.bgGradient} flex items-center justify-center text-2xl shadow-sm text-white relative`}>
                    {m.svgIcon}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center border-2 border-white text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-[#111827] mt-2 text-center leading-tight">
                    {m.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-[#6B7280] font-mono uppercase">
                    {m.category}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 2: IMAGE UPLOAD */}
        {selectedTab === 'upload' && (
          <div className="space-y-4 mb-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5E1] hover:border-[#16A34A] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-center text-[#16A34A] mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#111827]">
                Click to upload profile photo
              </p>
              <p className="text-xs text-[#6B7280] mt-1">
                PNG, JPG, or WebP (auto-compressed directly in browser)
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
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#16A34A]"
                />
                <div>
                  <p className="text-xs font-bold text-[#111827]">Custom Image Ready</p>
                  <p className="text-[11px] text-[#6B7280]">Compressed and ready for your player dossier</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B7280] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!previewUrl}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            Save Avatar
          </button>
        </div>

      </div>
    </div>
  );
};
