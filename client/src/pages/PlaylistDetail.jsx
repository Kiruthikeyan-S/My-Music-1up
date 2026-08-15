import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Shuffle,
  Music2,
  Trash2,
  Edit,
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { playlistsAPI } from '../services/api';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import SongRow from '../components/cards/SongRow';
import PlaylistModal from '../components/modals/PlaylistModal';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useAudio();
  const { user, isAdmin } = useAuth();

  const [playlistData, setPlaylistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadPlaylist = async () => {
    try {
      const res = await playlistsAPI.getById(id);
      setPlaylistData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-dark-900" />
        <div className="h-96 rounded-3xl bg-dark-900" />
      </div>
    );
  }

  if (!playlistData || !playlistData.playlist) {
    return <div className="p-12 text-center text-slate-400">Playlist not found.</div>;
  }

  const { playlist, songs } = playlistData;
  const isOwner = user ? playlist.user_id === user.id || isAdmin : false;

  const formatTotalTime = (sec) => {
    if (!sec) return '0 min';
    const m = Math.floor(sec / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h} hr ${m % 60} min`;
    return `${m} min`;
  };

  const handlePlayPlaylist = (shuffle = false) => {
    if (songs.length === 0) return;
    if (shuffle) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled, 0);
    } else {
      playSong(songs[0], songs, 0);
    }
  };

  const handleRemoveSong = async (song) => {
    try {
      await playlistsAPI.removeSong(id, song.id);
      loadPlaylist();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlaylist = async () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await playlistsAPI.delete(id);
        navigate('/library');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleMove = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= songs.length) return;
    const newSongs = [...songs];
    const [moved] = newSongs.splice(fromIdx, 1);
    newSongs.splice(toIdx, 0, moved);

    setPlaylistData(prev => ({ ...prev, songs: newSongs }));

    const newSongIds = newSongs.map(s => s.id);
    try {
      await playlistsAPI.reorder(id, newSongIds);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-r from-brand-900 via-dark-900 to-dark-950 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 relative z-10">
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border border-white/15 bg-dark-900">
            <img
              src={playlist.cover_path || '/storage/covers/playlist_latenight.svg'}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-400 block mb-1">
              Public Playlist
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {playlist.title}
            </h1>

            {playlist.description && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2">
                {playlist.description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">
                By {playlist.creator_name || 'Sonora User'}
              </span>
              <span>•</span>
              <span>{songs.length} songs</span>
              <span>•</span>
              <span>{formatTotalTime(playlist.totalDuration)}</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6">
              {songs.length > 0 && (
                <>
                  <button
                    onClick={() => handlePlayPlaylist(false)}
                    className="px-6 py-3 rounded-2xl bg-brand-500 text-white font-bold text-xs shadow-glow-brand hover:scale-105 active:scale-95 transition flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                    Play Playlist
                  </button>
                  <button
                    onClick={() => handlePlayPlaylist(true)}
                    className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-xs hover:bg-white/10 transition flex items-center gap-2"
                  >
                    <Shuffle className="w-4 h-4" />
                    Shuffle
                  </button>
                </>
              )}

              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
                    title="Edit Playlist"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeletePlaylist}
                    className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Songs Table */}
      <section className="space-y-4">
        <div className="glass-panel rounded-3xl p-3 divide-y divide-white/5">
          {songs.length === 0 ? (
            <div className="p-12 text-center space-y-2 text-slate-400">
              <Music2 className="w-10 h-10 mx-auto text-slate-500 opacity-40" />
              <p className="text-sm font-semibold">No songs in this playlist yet</p>
              <p className="text-xs text-slate-500">Add songs from the Explore or Search views</p>
            </div>
          ) : (
            songs.map((song, i) => (
              <div key={song.id} className="relative group/reorder">
                <SongRow
                  song={song}
                  index={i}
                  queue={songs}
                  onRemove={isOwner ? handleRemoveSong : null}
                />
                {isOwner && songs.length > 1 && (
                  <div className="absolute right-24 top-1/2 -translate-y-1/2 hidden group-hover/reorder:flex items-center gap-1 z-10 bg-dark-900/90 rounded-lg p-1 border border-white/10">
                    <button
                      onClick={() => handleMove(i, i - 1)}
                      disabled={i === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(i, i + 1)}
                      disabled={i === songs.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <PlaylistModal
          isOpen={isEditModalOpen}
          initialData={playlist}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(updated) => {
            setPlaylistData(prev => ({ ...prev, playlist: updated }));
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
