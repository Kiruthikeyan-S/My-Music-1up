import React, { useState } from 'react';
import {
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
  Maximize2,
  Activity,
  Mic2
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import VisualizerCanvas from './VisualizerCanvas';
import ArtworkImage from '../common/ArtworkImage';

export default function AudioPlayer() {
  const {
    currentSong,
    isPlaying,
    isLoadingAudio,
    progress,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    playbackSpeed,
    queue,
    isQueueDrawerOpen,
    playSong,
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

  const [showVisualizer, setShowVisualizer] = useState(false);

  if (!currentSong) return null;

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <footer className="fixed bottom-0 inset-x-0 z-40 bg-dark-900/90 backdrop-blur-2xl border-t border-white/10 px-4 md:px-6 py-3 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Section: Track Metadata & Like */}
        <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
          <div
            className="relative group cursor-pointer flex-shrink-0"
            onClick={() => setIsFullScreenPlayerOpen(true)}
          >
            <ArtworkImage
              src={currentSong.cover_path || currentSong.album_cover}
              alt={currentSong.title}
              fallbackTitle={currentSong.title}
              isRotating={isPlaying}
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl shadow-md border border-white/10 group-hover:opacity-80 transition"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 rounded-xl">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4
                onClick={() => setIsFullScreenPlayerOpen(true)}
                className="text-sm font-semibold text-white truncate cursor-pointer hover:text-brand-300 transition"
              >
                {currentSong.title}
              </h4>
              {currentSong.song_type_name && (
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium bg-white/5 border border-white/10 rounded text-slate-400">
                  {currentSong.song_type_name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {currentSong.artist_name || 'Unknown Artist'}
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentSong.id)}
            className={`p-2 rounded-lg transition hover:scale-110 ${
              currentSong.is_liked
                ? 'text-rose-500 fill-rose-500'
                : 'text-slate-400 hover:text-white'
            }`}
            title={currentSong.is_liked ? 'Remove from Liked' : 'Save to Liked'}
          >
            <Heart className={`w-4 h-4 ${currentSong.is_liked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Center Section: Primary Playback Controls & Scrubber */}
        <div className="flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center gap-4 sm:gap-6 mb-1.5">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-lg transition ${
                isShuffle ? 'text-brand-400 bg-brand-500/10' : 'text-slate-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Prev Track */}
            <button
              onClick={prevTrack}
              className="p-1.5 text-slate-300 hover:text-white transition hover:scale-110 active:scale-95"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5 fill-slate-300" />
            </button>

            {/* Play/Pause Main Button */}
            <button
              onClick={togglePlay}
              disabled={isLoadingAudio}
              className="p-3 rounded-full bg-brand-500 text-white shadow-glow-brand hover:scale-105 active:scale-95 transition disabled:opacity-50"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoadingAudio ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={nextTrack}
              className="p-1.5 text-slate-300 hover:text-white transition hover:scale-110 active:scale-95"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5 fill-slate-300" />
            </button>

            {/* Repeat Mode */}
            <button
              onClick={cycleRepeat}
              className={`p-1.5 rounded-lg relative transition ${
                repeatMode !== 'off' ? 'text-brand-400 bg-brand-500/10' : 'text-slate-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-brand-500 text-white rounded-full w-3 h-3 flex items-center justify-center">1</span>
              )}
            </button>
          </div>

          {/* Progress Slider */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
              {formatTime(progress)}
            </span>
            <div className="flex-1 relative group py-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={progress}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer group-hover:h-1.5 transition-all focus:outline-none"
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400 w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Section: Lyrics, Visualizer, Speed, Queue & Volume */}
        <div className="hidden lg:flex items-center justify-end gap-2.5 w-1/4">
          {/* Lyrics View Switcher Button (Spotify-Style) */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('1up_open_lyrics'));
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition hover:scale-110"
            title="Open Lyrics View"
          >
            <Mic2 className="w-4 h-4 text-amber-300" />
          </button>

          {/* Visualizer Toggle */}
          <button
            onClick={() => setShowVisualizer(prev => !prev)}
            className={`p-2 rounded-lg transition ${
              showVisualizer ? 'text-brand-400 bg-brand-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Visualizer"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <button
            onClick={() => {
              const speeds = [0.75, 1, 1.25, 1.5, 2];
              const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
              changePlaybackSpeed(next);
            }}
            className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono font-medium text-slate-300 hover:bg-white/10 transition"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>

          {/* Queue Drawer Toggle */}
          <button
            onClick={() => setIsQueueDrawerOpen(!isQueueDrawerOpen)}
            className={`p-2 rounded-lg relative transition ${
              isQueueDrawerOpen ? 'text-brand-400 bg-brand-500/15' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Queue"
          >
            <ListMusic className="w-4 h-4" />
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-brand-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>

          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-slate-400 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-white/15 rounded-lg cursor-pointer focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Mini Visualizer Strip */}
      {showVisualizer && (
        <div className="w-full max-w-lg mx-auto h-5 mt-2 transition-all">
          <VisualizerCanvas isPlaying={isPlaying} barCount={64} height={20} color={currentSong.genre_color || '#6366f1'} />
        </div>
      )}
    </footer>
  );
}
