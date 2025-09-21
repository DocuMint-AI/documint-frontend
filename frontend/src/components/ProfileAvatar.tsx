'use client';

import React from 'react';

interface ProfileAvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Generate consistent colors based on username
const generateProfileColors = (username: string) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  const saturation = 60 + (Math.abs(hash) % 30); // 60-90%
  const lightness = 40 + (Math.abs(hash) % 20); // 40-60%
  
  return {
    background: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    text: `hsl(${hue}, ${saturation}%, 90%)` // Light text
  };
};

// Generate initials from username
const generateInitials = (username: string): string => {
  if (!username) return 'U';
  
  // Split on common separators and take first letters
  const parts = username.split(/[\s._-]+/).filter(part => part.length > 0);
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1) {
    const part = parts[0];
    if (part.length >= 2) {
      return (part[0] + part[1]).toUpperCase();
    } else {
      return part[0].toUpperCase();
    }
  }
  
  return 'U';
};

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  username, 
  size = 'md', 
  className = '' 
}) => {
  const colors = generateProfileColors(username);
  const initials = generateInitials(username);
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };
  
  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        font-semibold 
        border-2 
        border-white/20 
        shadow-sm
        ${className}
      `}
      style={{
        backgroundColor: colors.background,
        color: colors.text
      }}
      title={username}
    >
      {initials}
    </div>
  );
};

export default ProfileAvatar;