import React, { useState } from 'react';
import { Music, Disc } from 'lucide-react';

const GRADIENT_PALETTES = [
  'from-indigo-600 via-purple-600 to-pink-600',
  'from-cyan-500 via-blue-600 to-indigo-700',
  'from-emerald-500 via-teal-600 to-cyan-700',
  'from-rose-500 via-pink-600 to-purple-700',
  'from-amber-500 via-orange-600 to-red-600',
  'from-fuchsia-600 via-indigo-600 to-cyan-500',
  'from-violet-600 via-indigo-700 to-slate-900',
  'from-teal-500 via-emerald-600 to-blue-700'
];

function getGradientIndex(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % GRADIENT_PALETTES.length;
}

export default function ArtworkImage({
  src,
  alt = 'Music Artwork',
  className = '',
  aspectSquare = true,
  isRotating = false,
  fallbackTitle = ''
}) {
  const [hasError, setHasError] = useState(false);

  const gradient = GRADIENT_PALETTES[getGradientIndex(fallbackTitle || alt)];

  // Clean local API image paths if needed
  let safeSrc = src;
  if (safeSrc && !safeSrc.startsWith('http') && !safeSrc.startsWith('data:') && !safeSrc.startsWith('/')) {
    safeSrc = `/${safeSrc}`;
  }

  if (!safeSrc || hasError) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-tr ${gradient} flex items-center justify-center select-none shadow-lg ${aspectSquare ? 'aspect-square' : ''} ${className}`}
      >
        {/* Vinyl Grooves Effect */}
        <div className={`absolute inset-0 flex items-center justify-center opacity-30 ${isRotating ? 'animate-spin-slow' : ''}`}>
          <div className="w-[85%] h-[85%] rounded-full border border-white/30 flex items-center justify-center">
            <div className="w-[70%] h-[70%] rounded-full border border-white/25 flex items-center justify-center">
              <div className="w-[50%] h-[50%] rounded-full border border-white/20 flex items-center justify-center">
                <div className="w-[30%] h-[30%] rounded-full bg-dark-950/80 border border-white/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Title Initials or Icon */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-2">
          <Disc className={`w-1/3 h-1/3 text-white/90 drop-shadow-md ${isRotating ? 'animate-spin-slow' : ''}`} />
          {fallbackTitle && (
            <span className="text-[11px] font-black text-white/90 uppercase tracking-widest mt-1 line-clamp-1 drop-shadow-md px-1 max-w-full">
              {fallbackTitle.slice(0, 15)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      onError={() => setHasError(true)}
      className={`object-cover select-none ${isRotating ? 'animate-spin-slow' : ''} ${className}`}
    />
  );
}
