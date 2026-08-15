import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Plus,
  ListPlus,
  Disc,
  User,
  Volume2
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function SongRow({
  song,
  index,
  queue = [],
  showAlbum = true,
  onAddToPlaylist = null,
  onRemove = null
}) {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay, toggleLike, addToQueue, playNext } = useAudio();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const isCurrent = currentSong?.id === song.id;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queue.length > 0 ? queue : [song], index);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
        isCurrent
          ? 'bg-brand-500/15 text-brand-300'
          : 'hover:bg-white/5 text-slate-300 hover:text-white'
      }`}
    >
      {/* Index / Play Button */}
      <div className="w-8 flex-shrink-0 text-center flex items-center justify-center">
        {isCurrent && isPlaying ? (
          <Volume2 className="w-4 h-4 text-brand-400 animate-pulse" />
        ) : (
          <span className="text-xs font-mono text-slate-500 group-hover:hidden">
            {index !== undefined ? index + 1 : '•'}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick();
          }}
          className={`hidden group-hover:block p-1 text-slate-200 hover:text-brand-400 transition`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Cover Image */}
      <img
        src={song.cover_path || song.album_cover || '/storage/covers/album_default.svg'}
        alt={song.title}
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow"
      />

      {/* Title & Artist */}
      <div className="flex-1 min-w-0 pr-2">
        <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-brand-400' : 'text-slate-100'}`}>
          {song.title}
        </p>
        <p className="text-xs text-slate-400 truncate flex items-center gap-2">
          <span
            onClick={(e) => {
              if (song.artist_id) {
                e.stopPropagation();
                navigate(`/artists/${song.artist_id}`);
              }
            }}
            className="hover:underline hover:text-slate-200 cursor-pointer"
          >
            {song.artist_name || 'Unknown Artist'}
          </span>
          {song.genre_name && (
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 bg-white/5 border border-white/10 rounded text-slate-400">
              {song.genre_name}
            </span>
          )}
        </p>
      </div>

      {/* Album Title */}
      {showAlbum && (
        <div className="hidden md:block w-1/4 truncate text-xs text-slate-400">
          <span
            onClick={(e) => {
              if (song.album_id) {
                e.stopPropagation();
                navigate(`/albums/${song.album_id}`);
              }
            }}
            className="hover:underline hover:text-slate-200 cursor-pointer"
          >
            {song.album_title || 'Single'}
          </span>
        </div>
      )}

      {/* Like Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleLike(song.id);
        }}
        className={`p-2 transition ${
          song.is_liked
            ? 'text-rose-500 fill-rose-500 opacity-100'
            : 'text-slate-400 hover:text-white opacity-0 group-hover:opacity-100'
        }`}
      >
        <Heart className={`w-4 h-4 ${song.is_liked ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Duration */}
      <span className="text-xs font-mono text-slate-400 w-12 text-right flex-shrink-0">
        {formatDuration(song.duration)}
      </span>

      {/* 3-Dot Actions Dropdown */}
      <div ref={menuRef} className="relative flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-8 w-48 glass-panel rounded-2xl shadow-2xl p-1.5 z-50 border border-white/15 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playNext(song);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <ListPlus className="w-3.5 h-3.5" />
              Play Next
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToQueue(song);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to Queue
            </button>
            {onAddToPlaylist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToPlaylist(song);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                <Disc className="w-3.5 h-3.5" />
                Add to Playlist
              </button>
            )}
            {song.artist_id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/artists/${song.artist_id}`);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                <User className="w-3.5 h-3.5" />
                Go to Artist
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(song);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition"
              >
                Remove from List
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
