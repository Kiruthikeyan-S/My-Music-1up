import React from 'react';
import { X, Play, Pause, Trash2, ListMusic, Volume2, ArrowUp, ArrowDown } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function QueueDrawer() {
  const {
    queue,
    queueIndex,
    currentSong,
    isPlaying,
    isQueueDrawerOpen,
    setIsQueueDrawerOpen,
    playSong,
    togglePlay,
    removeFromQueue,
    reorderQueue,
    clearQueue
  } = useAudio();

  if (!isQueueDrawerOpen) return null;

  const moveItem = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= queue.length) return;
    const newQueue = [...queue];
    const [moved] = newQueue.splice(fromIdx, 1);
    newQueue.splice(toIdx, 0, moved);
    reorderQueue(newQueue);
  };

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-dark-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Play Queue</h2>
            <p className="text-xs text-slate-400">{queue.length} track{queue.length !== 1 ? 's' : ''} in queue</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Clear queue"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsQueueDrawerOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Current Playing Section */}
      {currentSong && (
        <div className="p-4 bg-brand-500/5 border-b border-white/5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 mb-2 block">
            Now Playing
          </span>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
            <img
              src={currentSong.cover_path || currentSong.album_cover || '/storage/covers/album_default.svg'}
              alt={currentSong.title}
              className="w-12 h-12 rounded-lg object-cover shadow"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{currentSong.title}</h4>
              <p className="text-xs text-slate-400 truncate">{currentSong.artist_name || 'Unknown Artist'}</p>
            </div>
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-full bg-brand-500 text-white shadow-glow-brand hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
          Up Next
        </span>

        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center px-4">
            <ListMusic className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm font-medium">Your queue is empty</p>
            <p className="text-xs mt-1">Play a song or add songs from your library</p>
          </div>
        ) : (
          queue.map((song, idx) => {
            const isCurrent = idx === queueIndex;
            return (
              <div
                key={`${song.id}-${idx}`}
                className={`group flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
                    : 'bg-dark-850/60 border-white/5 hover:bg-dark-800 hover:border-white/10 text-slate-300'
                }`}
              >
                {/* Index / Indicator */}
                <div className="w-6 text-center text-xs font-mono text-slate-500">
                  {isCurrent && isPlaying ? (
                    <Volume2 className="w-4 h-4 text-brand-400 animate-pulse inline" />
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Cover */}
                <img
                  src={song.cover_path || song.album_cover || '/storage/covers/album_default.svg'}
                  alt={song.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />

                {/* Info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => playSong(song, queue, idx)}
                >
                  <p className={`text-sm font-medium truncate ${isCurrent ? 'text-brand-300 font-semibold' : 'text-slate-200'}`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {song.artist_name || 'Unknown Artist'}
                  </p>
                </div>

                {/* Duration */}
                <span className="text-xs text-slate-400 font-mono">
                  {formatDuration(song.duration)}
                </span>

                {/* Reorder / Remove Controls */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveItem(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveItem(idx, idx + 1)}
                    disabled={idx === queue.length - 1}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="p-1 text-slate-400 hover:text-red-400"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
