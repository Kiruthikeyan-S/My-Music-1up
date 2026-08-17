import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
  Disc,
  Layers,
  Box,
  Sparkles,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useSettings } from '../../context/SettingsContext';
import CircularSpectrumCanvas from './CircularSpectrumCanvas';
import HorizonSpectrumCanvas from './HorizonSpectrumCanvas';
import SiriWaveCanvas from './SiriWaveCanvas';
import ArtworkImage from '../common/ArtworkImage';
import { extractColorsFromImage } from '../../utils/colorExtractor';

export default function FullScreenPlayerModal() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    playbackSpeed,
    isFullScreenPlayerOpen,
    setIsFullScreenPlayerOpen,
    setIsQueueDrawerOpen,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    changePlaybackSpeed,
    toggleLike
  } = useAudio();

  const { defaultArtMode, currentThemeObj, visualizerStyle } = useSettings();

  // Artwork visual presentation mode: '3d' | 'circle' | 'float'
  const [artMode, setArtMode] = useState(defaultArtMode || '3d');
  const [themeColors, setThemeColors] = useState({
    primary: currentThemeObj?.primary || '#e5a93c',
    secondary: currentThemeObj?.secondary || '#f3c66f',
    accent: currentThemeObj?.accent || '#ff8c00',
    glow: 'rgba(229, 169, 60, 0.6)',
    rgb: '229, 169, 60'
  });

  // Touch / Blast Scatter State
  const [isBlasted, setIsBlasted] = useState(false);
  const [blastParticles, setBlastParticles] = useState([]);

  // Sync defaultArtMode if changed in Settings
  useEffect(() => {
    if (defaultArtMode) setArtMode(defaultArtMode);
  }, [defaultArtMode]);

  // Extract vibrant theme color automatically whenever currentSong changes
  useEffect(() => {
    if (currentSong) {
      const coverUrl = currentSong.cover_path || currentSong.album_cover;
      extractColorsFromImage(coverUrl, (colors) => {
        setThemeColors({
          ...colors,
          accent: currentThemeObj?.accent || '#ff8c00'
        });
      });
    }
  }, [currentSong, currentThemeObj]);

  if (!isFullScreenPlayerOpen || !currentSong) return null;

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Trigger Blast Particle Scatter on Touch/PointerDown
  const triggerBlast = () => {
    setIsBlasted(true);
    const particles = [];
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * 2 * Math.PI;
      const dist = 140 + Math.random() * 180;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const rot = (Math.random() - 0.5) * 720;
      const size = 12 + Math.random() * 22;
      const color = i % 2 === 0 ? themeColors.primary : themeColors.secondary;
      particles.push({ id: i, tx: `${tx}px`, ty: `${ty}px`, rot: `${rot}deg`, size, color });
    }
    setBlastParticles(particles);
  };

  // Restore floating animation on PointerUp / TouchEnd / MouseLeave
  const restoreFloat = () => {
    setIsBlasted(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#070605] text-white flex flex-col p-4 sm:p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom duration-300 font-serif"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, rgba(${themeColors.rgb}, 0.35) 0%, rgba(18, 14, 10, 0.96) 55%, #050403 100%)`
      }}
    >
      {/* Top Header Bar with Glassmorphism (Clean) */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => setIsFullScreenPlayerOpen(false)}
          className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-amber-500/30 hover:border-amber-500/60 hover:bg-white/10 text-amber-200 hover:text-white transition flex items-center gap-2 text-xs font-bold shadow-lg group hover:scale-105 active:scale-95"
          title="Minimize player and return to music library"
        >
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsFullScreenPlayerOpen(false);
              setIsQueueDrawerOpen(true);
            }}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 hover:bg-white/10 transition hover:scale-110"
            title="Open Queue"
          >
            <ListMusic className="w-5 h-5 text-amber-200" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage: Circular Spectrum + Slow Smooth Beat Bouncing Plate */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 sm:my-6 relative select-none">
        {/* 1. Surrounding 360-Degree Circular Audio Spectrum Ring */}
        <CircularSpectrumCanvas
          isPlaying={isPlaying}
          primaryColor={themeColors.primary}
          secondaryColor={themeColors.secondary}
          size={410}
        />

        {/* Dynamic Atmospheric Ambient Aura Glow */}
        <div
          className="absolute w-80 h-80 sm:w-[460px] sm:h-[460px] rounded-full blur-3xl -z-10 animate-pulse-glow pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${themeColors.glow} 0%, rgba(${themeColors.rgb}, 0.18) 60%, transparent 100%)`
          }}
        />

        {/* Blast Particle Scatter Explosions on Touch */}
        {isBlasted && blastParticles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-2xl animate-blast-particle shadow-glow-brand pointer-events-none z-30"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              '--tx': p.tx,
              '--ty': p.ty,
              '--rot': p.rot
            }}
          />
        ))}

        {/* 2. Interactive Artwork Plate with Graceful Slower Up-and-Down Rhythm Bounce! */}
        <div
          onPointerDown={triggerBlast}
          onPointerUp={restoreFloat}
          onPointerLeave={restoreFloat}
          onTouchStart={triggerBlast}
          onTouchEnd={restoreFloat}
          className={`cursor-pointer transition-all duration-500 transform ${
            isBlasted
              ? 'scale-125 opacity-0 rotate-12 filter blur-md'
              : isPlaying
              ? artMode === '3d'
                ? 'animate-3d-beat'
                : 'animate-rhythm-bounce'
              : 'animate-float'
          }`}
          title="Touch & hold to blast and scatter! Plays with smooth up & down beat motion."
        >
          {/* 3D Holographic Perspective Mode */}
          {artMode === '3d' && (
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-92 md:h-92 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-2 border-amber-400/40 group">
              <ArtworkImage
                src={currentSong.cover_path || currentSong.album_cover}
                alt={currentSong.title}
                fallbackTitle={currentSong.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-amber-200/20 pointer-events-none" />
            </div>
          )}

          {/* Circular Rotating Vinyl Record Mode */}
          {artMode === 'circle' && (
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-92 md:h-92 rounded-full overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-4 border-amber-500/50">
              <div className={`w-full h-full rounded-full overflow-hidden relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
                <ArtworkImage
                  src={currentSong.cover_path || currentSong.album_cover}
                  alt={currentSong.title}
                  fallbackTitle={currentSong.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 rounded-full border-[12px] border-black/50 pointer-events-none">
                  <div className="w-full h-full rounded-full border border-amber-300/30 flex items-center justify-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-dark-950/90 border-2 border-amber-400/40 flex items-center justify-center shadow-2xl">
                      <div className="w-6 h-6 rounded-full bg-amber-400/90 border-2 border-dark-950" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating Glass Card Mode */}
          {artMode === 'float' && (
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-92 md:h-92 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-2 border-amber-400/30 group">
              <ArtworkImage
                src={currentSong.cover_path || currentSong.album_cover}
                alt={currentSong.title}
                fallbackTitle={currentSong.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Track Details, Scrubber & Siri/Horizon Waveform Visualizer */}
      <div className="max-w-md w-full mx-auto space-y-3.5">
        {/* Track Title & Artist */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide truncate font-serif">
              {currentSong.title}
            </h2>
            <p className="text-sm sm:text-base text-amber-200/80 truncate mt-0.5 italic">
              {currentSong.artist_name || 'Unknown Artist'} {currentSong.album_title ? `• ${currentSong.album_title}` : ''}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentSong.id)}
            className={`p-3 rounded-full transition hover:scale-125 ${
              currentSong.is_liked
                ? 'text-rose-500 fill-rose-500 bg-rose-500/15'
                : 'text-amber-200/60 hover:text-white bg-white/5'
            }`}
          >
            <Heart className={`w-6 h-6 ${currentSong.is_liked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Progress Scrubber Line */}
        <div className="space-y-1">
          <div className="relative group">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/15 rounded-lg appearance-none cursor-pointer focus:outline-none"
              style={{ accentColor: themeColors.primary }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-amber-200/70">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 3. Futuristic Siri-Style Sine Wave or Horizon Visualizer (Underneath the line!) */}
        <div className="w-full h-14 overflow-hidden rounded-2xl bg-black/40 border border-white/10 p-1 flex items-center justify-center">
          {visualizerStyle === 'siri' ? (
            <SiriWaveCanvas
              isPlaying={isPlaying}
              primaryColor={themeColors.primary || '#ffffff'}
              secondaryColor={themeColors.secondary || '#38bdf8'}
              accentColor={themeColors.accent || '#c084fc'}
              height={50}
            />
          ) : (
            <HorizonSpectrumCanvas
              isPlaying={isPlaying}
              primaryColor={themeColors.primary}
              secondaryColor={themeColors.secondary}
              height={44}
            />
          )}
        </div>

        {/* Primary Playback Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full transition hover:scale-110 ${
              isShuffle ? 'text-amber-400' : 'text-amber-200/60 hover:text-white'
            }`}
            style={{ color: isShuffle ? themeColors.primary : undefined }}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-2.5 rounded-full text-amber-100 hover:text-white hover:bg-white/10 transition hover:scale-110"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="p-5 rounded-full text-dark-950 font-black shadow-2xl hover:scale-110 active:scale-95 transition"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              boxShadow: `0 10px 30px -5px ${themeColors.glow}`
            }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-2.5 rounded-full text-amber-100 hover:text-white hover:bg-white/10 transition hover:scale-110"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-2.5 rounded-full transition hover:scale-110 relative ${
              repeatMode !== 'off' ? 'text-amber-400' : 'text-amber-200/60 hover:text-white'
            }`}
            style={{ color: repeatMode !== 'off' ? themeColors.primary : undefined }}
          >
            <Repeat className="w-5 h-5" />
            {repeatMode === 'one' && (
              <span
                className="absolute -top-1 -right-1 text-[9px] font-black text-dark-950 px-1 rounded-full"
                style={{ backgroundColor: themeColors.primary }}
              >
                1
              </span>
            )}
          </button>
        </div>

        {/* Volume & Speed Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
          <div className="flex items-center gap-2.5 w-1/2">
            <button onClick={toggleMute} className="text-amber-200/70 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: themeColors.primary }}
            />
          </div>

          <button
            onClick={changePlaybackSpeed}
            className="px-3 py-1 rounded-full bg-white/5 border border-amber-500/30 text-xs font-mono text-amber-200 hover:text-white transition"
          >
            {playbackSpeed}x Speed
          </button>
        </div>
      </div>
    </div>
  );
}
