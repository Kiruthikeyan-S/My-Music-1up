import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  Music2,
  Clock,
  Plus,
  Play,
  Shuffle,
  Disc,
  Library as LibraryIcon
} from 'lucide-react';
import { libraryAPI, playlistsAPI } from '../services/api';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import SongRow from '../components/cards/SongRow';
import PlaylistModal from '../components/modals/PlaylistModal';

export default function Library() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { playSong } = useAudio();

  const getInitialTab = () => {
    if (location.pathname.includes('/liked')) return 'liked';
    if (location.pathname.includes('/recent')) return 'recent';
    return 'playlists';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    async function loadLibraryData() {
      setLoading(true);
      try {
        const [likedRes, plRes, recRes] = await Promise.all([
          libraryAPI.getLiked().catch(() => ({ data: { songs: [] } })),
          playlistsAPI.getAll().catch(() => ({ data: { playlists: [] } })),
          libraryAPI.getRecent().catch(() => ({ data: { songs: [] } }))
        ]);
        setLikedSongs(likedRes.data.songs || []);
        setPlaylists(plRes.data.playlists || []);
        setRecentSongs(recRes.data.songs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLibraryData();
  }, [user]);

  const handlePlayLiked = (shuffle = false) => {
    if (likedSongs.length === 0) return;
    if (shuffle) {
      const shuffled = [...likedSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled, 0);
    } else {
      playSong(likedSongs[0], likedSongs, 0);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <LibraryIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Your Music Library</h1>
            <p className="text-xs sm:text-sm text-slate-400">Manage playlists, liked tracks, and listening history</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-dark-900 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'liked'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            Liked Songs ({likedSongs.length})
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'playlists'
                ? 'bg-brand-500 text-white shadow-glow-brand'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            Playlists ({playlists.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'recent'
                ? 'bg-cyan-500 text-white shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Recently Played
          </button>
        </div>
      </div>

      {/* LIKED SONGS TAB */}
      {activeTab === 'liked' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Liked Songs Hero Card */}
          <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-rose-900 via-purple-900 to-dark-950 border border-white/10 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-tr from-rose-600 to-purple-600 p-1 flex items-center justify-center shadow-2xl flex-shrink-0">
                <Heart className="w-20 h-20 text-white fill-white drop-shadow-lg" />
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-widest text-rose-300 block mb-1">
                  Collection
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white">Liked Songs</h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">
                  {likedSongs.length} favorite songs preserved in your high-fidelity vault
                </p>

                {likedSongs.length > 0 && (
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-5">
                    <button
                      onClick={() => handlePlayLiked(false)}
                      className="px-6 py-2.5 rounded-xl bg-white text-dark-950 font-bold text-xs shadow-xl hover:scale-105 transition flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-dark-950 ml-0.5" />
                      Play All
                    </button>
                    <button
                      onClick={() => handlePlayLiked(true)}
                      className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-semibold text-xs hover:bg-white/20 transition flex items-center gap-2"
                    >
                      <Shuffle className="w-4 h-4" />
                      Shuffle
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Liked Songs Tracklist */}
          <div className="glass-panel rounded-3xl p-3 divide-y divide-white/5">
            {likedSongs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Heart className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm font-semibold">No liked songs yet</p>
                <p className="text-xs text-slate-500">Tap the heart on any song to save it here.</p>
              </div>
            ) : (
              likedSongs.map((song, i) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={i}
                  queue={likedSongs}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* PLAYLISTS TAB */}
      {activeTab === 'playlists' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Create Playlist Action Card */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="glass-card p-4 rounded-2xl cursor-pointer border-dashed border-2 border-white/20 hover:border-brand-500/50 flex flex-col items-center justify-center text-center h-52 group transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 group-hover:bg-brand-500 group-hover:text-white flex items-center justify-center transition-all mb-3 shadow-glow-brand">
                <Plus className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition">
                Create Playlist
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">Custom collection</p>
            </div>

            {/* Playlists cards */}
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => navigate(`/playlists/${pl.id}`)}
                className="group glass-card p-3.5 rounded-2xl cursor-pointer hover:scale-[1.02] transition"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-dark-900 border border-white/10">
                  <img
                    src={pl.cover_path || '/storage/covers/playlist_latenight.svg'}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="p-3 rounded-full bg-brand-500 text-white shadow-glow-brand">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-300 transition">
                  {pl.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pl.song_count || 0} track{pl.song_count !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENTLY PLAYED TAB */}
      {activeTab === 'recent' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="glass-panel rounded-3xl p-3 divide-y divide-white/5">
            {recentSongs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold">No playback history yet</p>
                <p className="text-xs text-slate-500">Play tracks from the library and they will show here.</p>
              </div>
            ) : (
              recentSongs.map((song, i) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={i}
                  queue={recentSongs}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Playlist Create Modal */}
      {isCreateModalOpen && (
        <PlaylistModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newPl) => {
            setPlaylists(prev => [newPl, ...prev]);
            setIsCreateModalOpen(false);
            navigate(`/playlists/${newPl.id}`);
          }}
        />
      )}
    </div>
  );
}
