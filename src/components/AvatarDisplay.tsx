import React from 'react';
import { PRESET_MASCOTS } from './AvatarSelectorModal';

interface AvatarDisplayProps {
  avatarUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarUrl,
  name,
  size = 'md',
  className = '',
}) => {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl',
  }[size];

  // 1. Check if avatarUrl is a mascot token
  if (avatarUrl && avatarUrl.startsWith('mascot:')) {
    const mascotId = avatarUrl.replace('mascot:', '');
    const mascot = PRESET_MASCOTS.find((m) => m.id === mascotId) || PRESET_MASCOTS[0];

    return (
      <div
        className={`${sizeClasses} rounded-full bg-gradient-to-br ${mascot.bgGradient} flex items-center justify-center shadow-xs border-2 border-white/90 text-white shrink-0 ${className}`}
        title={mascot.name}
      >
        <span>{mascot.svgIcon}</span>
      </div>
    );
  }

  // 2. Check if avatarUrl is a custom URL / Base64 photo
  if (avatarUrl && avatarUrl.trim() !== '') {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover border-2 border-white/90 shadow-xs shrink-0 ${className}`}
      />
    );
  }

  // 3. Fallback Initial Circle
  return (
    <div
      className={`${sizeClasses} rounded-full bg-[#16A34A] text-white font-bold flex items-center justify-center border-2 border-white/90 shadow-xs shrink-0 ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
};
