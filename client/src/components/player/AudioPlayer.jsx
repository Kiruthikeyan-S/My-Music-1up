import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
  Mic2,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import ArtworkImage from '../common/ArtworkImage';

export default function AudioPlayer() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleLike,
    setIsFullScreenPlayerOpen,
    setIsQueueDrawerOpen,
    isQueueDrawerOpen
  } = useAudio();

  if (!currentSong) return null;

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <footer className="fixed bottom-4 sm:bottom-6 inset-x-0 z-40 flex items-center justify-center gap-3 px-3 sm:px-6 pointer-events-none select-none">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-5xl w-full">

        {/* ================= 1. LEFT CARD PILL (SPOTIFY EMBED PREVIEW) ================= */}
        <div className="pointer-events-auto hidden md:flex items-center gap-3 bg-black/85 backdrop-blur-2xl border border-white/15 px-4 py-2.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.85)] group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-white/10 flex-shrink-0">
            <ArtworkImage
              src={currentSong.cover_path || currentSong.album_cover}
              alt={currentSong.title}
              fallbackTitle={currentSong.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 pr-1">
            <h4 className="text-xs font-black text-white truncate max-w-[130px] font-sans">
              {currentSong.title}
            </h4>
            <p className="text-[10px] text-slate-300 truncate max-w-[130px] font-mono">
              {currentSong.artist_name || 'Unknown Artist'}
            </p>
            <button
              onClick={() => setIsFullScreenPlayerOpen(true)}
              className="text-[9px] font-mono font-bold text-[#1ed760] hover:text-white uppercase flex items-center gap-1 mt-0.5 transition"
            >
              <span>OPEN IN 1UP</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* ================= 2. MAIN FLOATING PLAYER PILL (SONG//DECK PLAYER) ================= */}
        <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-2xl border border-white/20 px-4 sm:px-5 py-2.5 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-between gap-3 sm:gap-5 w-full sm:w-auto max-w-xl">
          {/* Mini Cover Thumbnail */}
          <div
            onClick={() => setIsFullScreenPlayerOpen(true)}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-lg border border-white/15 flex-shrink-0 cursor-pointer group"
          >
            <ArtworkImage
              src={currentSong.cover_path || currentSong.album_cover}
              alt={currentSong.title}
              fallbackTitle={currentSong.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          {/* Track Info & Badge */}
          <div
            onClick={() => setIsFullScreenPlayerOpen(true)}
            className="min-w-0 flex-1 cursor-pointer pr-1"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white truncate font-sans">
                {currentSong.title}
              </h3>
              <span className="text-[9px] font-mono font-bold bg-white/15 text-amber-300 px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                Preview
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate font-mono mt-0.5">
              {currentSong.artist_name || 'Various Artists'}
            </p>
          </div>

          {/* Player Actions & Control Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Like / Add (+) Button */}
            <button
              onClick={() => toggleLike(currentSong.id)}
              className={`p-2 rounded-full transition hover:scale-110 ${
                currentSong.is_liked
                  ? 'text-rose-500 fill-rose-500 bg-rose-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title={currentSong.is_liked ? 'Liked' : 'Add to Favorites'}
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Lyrics / More Options Button */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('1up_open_lyrics'));
              }}
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition hover:scale-110 hidden sm:flex"
              title="Lyrics View"
            >
              <Mic2 className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setIsQueueDrawerOpen(!isQueueDrawerOpen)}
              className={`p-2 rounded-full transition hidden sm:flex ${
                isQueueDrawerOpen ? 'text-[#1ed760] bg-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Circular White Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-black hover:bg-slate-100 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition flex-shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black" />
              ) : (
                <Play className="w-5 h-5 fill-black ml-0.5" />
              )}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
