import React, { useState } from 'react';

export const getInitials = (name: string): string => {
  if (!name) return '??';
  const clean = name.trim().replace(/[^a-zA-Z\s]/g, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase() || '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface AvatarProps {
  name: string;
  photoUrl?: string;
  className?: string;
  shape?: 'rounded' | 'circle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  photoUrl,
  className = '',
  shape = 'rounded',
  size = 'md'
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-14 h-14 text-base'
  }[size];

  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const initials = getInitials(name);

  // If no photoUrl, or failed loading, render Surname Initial Badge
  if (!photoUrl || hasError) {
    return (
      <div
        className={`${sizeClasses} ${shapeClasses} bg-slate-900 text-white font-black flex items-center justify-center border-2 border-slate-900 shadow-neo-sm shrink-0 select-none tracking-wider ${className}`}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={name}
      onError={() => setHasError(true)}
      className={`${sizeClasses} ${shapeClasses} object-cover border-2 border-slate-900 shadow-neo-sm shrink-0 ${className}`}
    />
  );
};
