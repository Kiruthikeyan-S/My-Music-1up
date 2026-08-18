import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Shuffle,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
  Maximize2,
  Mic2,
  Radio,
  Sliders
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
    isShuffle,
    repeatMode,
    playbackSpeed,
    queue,
    isQueueDrawerOpen,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    changePlaybackSpeed,
    toggleLike,
    setIsFullScreenPlayerOpen,
    setIsQueueDrawerOpen
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
    <footer className="fixed bottom-0 inset-x-0 z-40 bg-[#12100d] border-t-2 border-[#2b241c] px-3 sm:px-6 py-2 sm:py-3 shadow-[0_-15px_45px_rgba(0,0,0,0.95)] select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-6">

        {/* ================= 1. LEFT: MOTORIZED CASSETTE TAPE DECK DOOR ================= */}
        <div
          onClick={() => setIsFullScreenPlayerOpen(true)}
          className="group cursor-pointer flex items-center gap-3 w-full md:w-auto flex-shrink-0"
          title="Click to open Fullscreen Tape Deck"
        >
          {/* Acrylic Cassette Door Compartment */}
          <div className="relative w-44 sm:w-52 h-16 sm:h-20 rounded-xl bg-[#090807] border-2 border-[#332b22] p-1.5 shadow-2xl flex items-center justify-between overflow-hidden">
            {/* Ambient Tape Chamber Glow */}
            <div className={`absolute inset-0 bg-amber-500/10 pointer-events-none transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-20'}`} />

            {/* Cassette Tape Inserted Inside */}
            <div className="w-full h-full rounded-lg bg-[#f0eade] border border-[#2b241c] p-1 flex flex-col justify-between relative shadow-inner">
              {/* Top Header on Tape */}
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-[#2c221a] font-bold border-b border-black/10 pb-0.5">
                <div className="flex items-center gap-1 min-w-0 pr-1">
                  <span className="bg-amber-600 text-white px-1 rounded text-[7px] font-black">A</span>
                  <span className="truncate italic font-serif font-bold">{currentSong.title}</span>
                </div>
                <span className="text-[7px] font-mono font-black text-black/40">STEREO</span>
              </div>

              {/* Center Spinning Tape Spools Window */}
              <div className="w-full h-6 sm:h-7 rounded bg-[#100e0b] border border-black/50 px-2 flex items-center justify-between relative shadow-inner">
                {/* Left Reel */}
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#2a241d] border border-white/30 flex items-center justify-center">
                  <div
                    className={`w-full h-full rounded-full border border-dashed border-white/50 flex items-center justify-center ${
                      isPlaying ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '2.5s' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* Magnetic Brown Film */}
                <div className="h-0.5 flex-1 mx-1.5 bg-[#4a2e18] rounded-full" />

                {/* Right Reel */}
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#2a241d] border border-white/30 flex items-center justify-center">
                  <div
                    className={`w-full h-full rounded-full border border-dashed border-white/50 flex items-center justify-center ${
                      isPlaying ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '2.5s' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>

              {/* Bottom Specs */}
              <div className="flex items-center justify-between text-[7px] font-mono text-black/50 font-bold">
                <span className="truncate max-w-[70%]">{currentSong.artist_name || '1UP TAPE'}</span>
                <span>AUTO STOP</span>
              </div>
            </div>
          </div>

          {/* Like Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(currentSong.id);
            }}
            className={`p-2.5 rounded-xl border border-white/10 transition-all hover:scale-110 ${
              currentSong.is_liked
                ? 'text-rose-500 fill-rose-500 bg-rose-500/15 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'text-amber-200/60 hover:text-white bg-black/40'
            }`}
            title={currentSong.is_liked ? 'Liked' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${currentSong.is_liked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* ================= 2. CENTER: RETRO LED SCREEN & TACTILE MECHANICAL CONTROLS ================= */}
        <div className="flex-1 w-full max-w-xl space-y-2">
          {/* Retro Amber/Red Glowing LED Matrix Display */}
          <div className="rounded-2xl bg-[#090807] border border-[#2b241c] p-2.5 shadow-inner relative overflow-hidden">
            {/* LED Status Header & Time Counter */}
            <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-widest text-amber-500">
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-orange-500 animate-pulse' : 'bg-orange-900'}`} />
                NOW PLAYING
              </span>
              <span className="text-amber-300 font-mono tracking-widest">
                {formatTime(progress)} <span className="text-amber-500/40">/</span> {formatTime(duration)}
              </span>
            </div>

            {/* Glowing Song Title & Artist */}
            <div className="flex items-center justify-between gap-3 mt-1">
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-black font-mono text-amber-200 uppercase tracking-wide truncate">
                  {currentSong.title}
                </h4>
                <p className="text-[11px] font-serif italic text-amber-400/70 truncate">
                  {currentSong.artist_name || 'Various Artists'}
                </p>
              </div>
            </div>

            {/* Glowing Analog Scrubber Tape Line */}
            <div className="mt-2 relative group">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={progress}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#201c16] rounded-lg appearance-none cursor-pointer focus:outline-none"
                style={{ accentColor: '#f59e0b' }}
              />
            </div>
          </div>

          {/* Tactile Hardware Tape Push Buttons */}
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {/* REW Button */}
            <button
              onClick={prevTrack}
              className="px-3 py-1.5 rounded-lg bg-[#1a1713] hover:bg-[#28221b] border border-[#332b22] text-amber-200 hover:text-white font-mono text-[10px] font-black flex items-center gap-1 transition active:scale-95 shadow-md"
              title="Rewind (REW)"
            >
              <SkipBack className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">REW</span>
            </button>

            {/* PLAY / PAUSE Main Hardware Button */}
            <button
              onClick={togglePlay}
              className={`px-5 py-1.5 rounded-lg border font-mono text-[11px] font-black flex items-center gap-1.5 transition active:scale-95 shadow-lg ${
                isPlaying
                  ? 'bg-amber-400 text-dark-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105'
                  : 'bg-[#221e18] text-amber-200 border-[#3d3326] hover:bg-[#2c261e]'
              }`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>PLAY</span>
                </>
              )}
            </button>

            {/* FF Button */}
            <button
              onClick={nextTrack}
              className="px-3 py-1.5 rounded-lg bg-[#1a1713] hover:bg-[#28221b] border border-[#332b22] text-amber-200 hover:text-white font-mono text-[10px] font-black flex items-center gap-1 transition active:scale-95 shadow-md"
              title="Fast Forward (FF)"
            >
              <span className="hidden sm:inline">FF</span>
              <SkipForward className="w-3.5 h-3.5 fill-current" />
            </button>

            {/* STOP Button */}
            <button
              onClick={() => {
                seek(0);
                if (isPlaying) togglePlay();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#1a1713] hover:bg-[#28221b] border border-[#332b22] text-amber-200/70 hover:text-white font-mono text-[10px] font-black flex items-center gap-1 transition active:scale-95 shadow-md"
              title="Stop"
            >
              <Square className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">STOP</span>
            </button>

            {/* SHUFFLE Button */}
            <button
              onClick={toggleShuffle}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border font-mono text-[10px] font-black transition active:scale-95 ${
                isShuffle
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                  : 'bg-[#1a1713] text-amber-200/50 border-[#332b22] hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            {/* REPEAT Button */}
            <button
              onClick={cycleRepeat}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border font-mono text-[10px] font-black transition active:scale-95 ${
                repeatMode !== 'off'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                  : 'bg-[#1a1713] text-amber-200/50 border-[#332b22] hover:text-white'
              }`}
              title="Repeat"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            {/* LYRICS Button */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('1up_open_lyrics'));
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#1a1713] hover:bg-[#28221b] border border-[#332b22] text-amber-300 hover:text-white font-mono text-[10px] font-black transition active:scale-95"
              title="Open Lyrics View"
            >
              <Mic2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ================= 3. RIGHT: ANALOG ROTARY VOLUME KNOB & QUEUE ================= */}
        <div className="hidden lg:flex items-center justify-end gap-4 flex-shrink-0">
          {/* Queue Drawer Button */}
          <button
            onClick={() => setIsQueueDrawerOpen(!isQueueDrawerOpen)}
            className={`p-2.5 rounded-xl border transition relative ${
              isQueueDrawerOpen
                ? 'bg-amber-400 text-dark-950 border-amber-300 font-bold shadow-glow-brand'
                : 'bg-[#1a1713] text-amber-200 border-[#332b22] hover:text-white hover:bg-[#28221b]'
            }`}
            title="Toggle Queue"
          >
            <ListMusic className="w-4 h-4" />
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 text-[8px] font-black bg-amber-500 text-dark-950 rounded-full w-4 h-4 flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>

          {/* Analog Rotary Volume Knob Indicator */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-mono font-black text-amber-200/50 tracking-widest">VOLUME</span>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-mono text-amber-200/40 font-bold">MIN</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-[#201c16] rounded-lg appearance-none cursor-pointer focus:outline-none"
                style={{ accentColor: '#f59e0b' }}
              />
              <span className="text-[8px] font-mono text-amber-200/40 font-bold">MAX</span>
            </div>
          </div>

          {/* Fullscreen Expand Trigger */}
          <button
            onClick={() => setIsFullScreenPlayerOpen(true)}
            className="p-2.5 rounded-xl bg-[#1a1713] hover:bg-[#28221b] border border-[#332b22] text-amber-200 hover:text-white transition hover:scale-110"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
}
