import React from 'react';
import { Play, Pause, Disc, Heart } from 'lucide-react';
import ArtworkImage from './ArtworkImage';

// Color themes for cassette tape stripes
const TAPE_THEMES = [
  {
    stripe: 'from-amber-500 via-orange-500 to-rose-600',
    accent: '#f97316',
    shell: 'bg-[#181614] border-[#2c2824]',
    label: 'bg-[#f4efe6] text-[#2c221a]',
    badge: 'bg-amber-600 text-white'
  },
  {
    stripe: 'from-cyan-500 via-sky-600 to-blue-700',
    accent: '#0ea5e9',
    shell: 'bg-[#14181a] border-[#222b2f]',
    label: 'bg-[#eaf4f7] text-[#16272e]',
    badge: 'bg-cyan-600 text-white'
  },
  {
    stripe: 'from-emerald-500 via-teal-600 to-emerald-800',
    accent: '#10b981',
    shell: 'bg-[#131a15] border-[#202e24]',
    label: 'bg-[#e9f5ed] text-[#14291a]',
    badge: 'bg-emerald-600 text-white'
  },
  {
    stripe: 'from-rose-500 via-pink-600 to-purple-700',
    accent: '#ec4899',
    shell: 'bg-[#1a1417] border-[#2f2229]',
    label: 'bg-[#f7eaef] text-[#2e1622]',
    badge: 'bg-rose-600 text-white'
  },
  {
    stripe: 'from-amber-400 via-amber-600 to-yellow-700',
    accent: '#eab308',
    shell: 'bg-[#1a1813] border-[#2e2a20]',
    label: 'bg-[#f7f4ea] text-[#2e2814]',
    badge: 'bg-amber-500 text-white'
  }
];

export default function CassetteTapeCard({
  song,
  index = 0,
  isActive = false,
  isPlaying = false,
  onPlay,
  onToggleLike
}) {
  const theme = TAPE_THEMES[index % TAPE_THEMES.length];
  const side = index % 2 === 0 ? 'A' : 'B';
  const durationType = index % 3 === 0 ? '60' : '90';

  return (
    <div
      onClick={onPlay}
      className={`group cursor-pointer flex flex-col transition-all duration-300 transform hover:-translate-y-1.5 select-none ${
        isActive ? 'scale-[1.02]' : ''
      }`}
    >
      {/* ================= CASSETTE TAPE SHELL ================= */}
      <div
        className={`relative w-full aspect-[1.58/1] rounded-2xl p-2.5 border-2 shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
          theme.shell
        } ${
          isActive
            ? 'border-amber-400/90 shadow-[0_12px_35px_rgba(229,169,60,0.4)] ring-2 ring-amber-400/40'
            : 'border-white/10 group-hover:border-white/30 group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Screw Corner Accents */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#3a3530] border border-[#1a1714] flex items-center justify-center">
          <div className="w-1 h-[0.5px] bg-[#666]" />
        </div>
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#3a3530] border border-[#1a1714] flex items-center justify-center">
          <div className="w-1 h-[0.5px] bg-[#666]" />
        </div>
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#3a3530] border border-[#1a1714] flex items-center justify-center">
          <div className="w-1 h-[0.5px] bg-[#666]" />
        </div>
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#3a3530] border border-[#1a1714] flex items-center justify-center">
          <div className="w-1 h-[0.5px] bg-[#666]" />
        </div>

        {/* Paper / Vinyl Cassette Label */}
        <div className={`w-full h-full rounded-xl p-2 flex flex-col justify-between relative overflow-hidden shadow-inner ${theme.label}`}>
          {/* Top Label Header (Side Badge + Hand-written Song Title) */}
          <div className="flex items-center justify-between gap-2 z-10 border-b border-black/10 pb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded shadow-sm ${theme.badge}`}>
                {side}
              </span>
              <h4 className="text-xs sm:text-sm font-bold tracking-tight truncate font-serif italic text-[#1a1510]">
                {song.title}
              </h4>
            </div>
            <span className="text-[10px] font-mono font-black text-black/40">
              STEREO
            </span>
          </div>

          {/* Retro Vibrant Magnetic Stripe Waves */}
          <div className={`my-1 h-8 sm:h-10 w-full rounded-md bg-gradient-to-r ${theme.stripe} p-0.5 shadow-sm flex items-center justify-center relative`}>
            {/* Center Acrylic Transparent Tape Window with Dual Spools */}
            <div className="w-3/5 h-full rounded bg-[#0a0908]/90 border border-black/40 px-2 flex items-center justify-between relative shadow-inner">
              {/* Left Tape Reel / Spool */}
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#201d1a] border border-white/20 flex items-center justify-center shadow-md">
                <div
                  className={`w-full h-full rounded-full border-2 border-dashed border-white/40 flex items-center justify-center ${
                    isActive && isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '3s' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
                </div>
              </div>

              {/* Center Magnetic Tape Film */}
              <div className="h-1 flex-1 mx-1.5 bg-[#4a2e18] rounded-full shadow-inner" />

              {/* Right Tape Reel / Spool */}
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#201d1a] border border-white/20 flex items-center justify-center shadow-md">
                <div
                  className={`w-full h-full rounded-full border-2 border-dashed border-white/40 flex items-center justify-center ${
                    isActive && isPlaying ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '3s' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Cassette Specs & Type */}
          <div className="flex items-center justify-between text-[9px] font-mono text-black/50 font-bold z-10">
            <span className="truncate max-w-[60%]">{song.artist_name || '1UP TAPE DECK'}</span>
            <span className="bg-black/10 px-1 rounded font-black">{durationType} MIN</span>
          </div>
        </div>

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-2xl z-20">
          <div className="w-12 h-12 rounded-full bg-amber-400 text-dark-950 flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
            {isActive && isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </div>
        </div>
      </div>

      {/* ================= TITLE & ARTIST UNDER TAPE ================= */}
      <div className="mt-2.5 px-1 flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <h3 className={`text-xs sm:text-sm font-black uppercase tracking-wider truncate font-mono ${
            isActive ? 'text-amber-400' : 'text-slate-100 group-hover:text-white'
          }`}>
            {song.title}
          </h3>
          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-serif italic">
            {song.artist_name || 'Various Artists'}
          </p>
        </div>

        {onToggleLike && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(song.id);
            }}
            className={`p-1.5 rounded-full transition hover:scale-125 ${
              song.is_liked ? 'text-rose-500 fill-rose-500' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${song.is_liked ? 'fill-rose-500' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}
