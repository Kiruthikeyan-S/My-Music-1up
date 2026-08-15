import React from 'react';
import { Play, Pause, Heart, MoreVertical } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function SongCard({ song, queue = null, index = -1 }) {
  const { currentSong, isPlaying, playSong, togglePlay, toggleLike } = useAudio();

  const isCurrent = currentSong?.id === song.id;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queue, index);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLike(song.id);
  };

  return (
    <div
      onClick={handlePlayClick}
      className="group glass-card p-3.5 rounded-2xl cursor-pointer relative transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Cover Artwork & Play Overlay */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-dark-900 border border-white/5">
        <img
          src={song.cover_path || song.album_cover || '/storage/covers/album_default.svg'}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Play Circle */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
          isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <button
            onClick={handlePlayClick}
            className="p-3.5 rounded-full bg-brand-500 text-white shadow-glow-brand hover:scale-110 active:scale-95 transition-transform"
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Top badges */}
        {song.song_type_name && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-dark-950/80 backdrop-blur-md text-slate-300 border border-white/10">
            {song.song_type_name}
          </span>
        )}

        <button
          onClick={handleLikeClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition ${
            song.is_liked
              ? 'bg-rose-500/20 text-rose-500 fill-rose-500'
              : 'bg-dark-950/60 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${song.is_liked ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Info */}
      <h3 className={`text-sm font-semibold truncate ${isCurrent ? 'text-brand-400' : 'text-slate-100'}`}>
        {song.title}
      </h3>
      <p className="text-xs text-slate-400 truncate mt-0.5">
        {song.artist_name || 'Unknown Artist'}
      </p>
    </div>
  );
}
