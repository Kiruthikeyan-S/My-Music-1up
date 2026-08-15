import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Shuffle,
  Clock,
  Disc,
  User,
  Heart,
  Calendar,
  Share2
} from 'lucide-react';
import { albumsAPI } from '../services/api';
import { useAudio } from '../context/AudioContext';
import SongRow from '../components/cards/SongRow';
import AddToPlaylistModal from '../components/modals/AddToPlaylistModal';

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong, toggleShuffle } = useAudio();

  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

  useEffect(() => {
    async function loadAlbum() {
      setLoading(true);
      try {
        const res = await albumsAPI.getById(id);
        setAlbumData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-dark-900" />
        <div className="h-96 rounded-3xl bg-dark-900" />
      </div>
    );
  }

  if (!albumData || !albumData.album) {
    return <div className="p-12 text-center text-slate-400">Album not found.</div>;
  }

  const { album, songs } = albumData;

  const formatTotalTime = (sec) => {
    if (!sec) return '0 min';
    const m = Math.floor(sec / 60);
    const h = Math.floor(m / 60);
    if (h > 0) {
      return `${h} hr ${m % 60} min`;
    }
    return `${m} min`;
  };

  const handlePlayAlbum = (shuffle = false) => {
    if (songs.length === 0) return;
    if (shuffle) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled, 0);
    } else {
      playSong(songs[0], songs, 0);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Album Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-r from-dark-900 via-dark-850 to-dark-950 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 relative z-10">
          {/* Cover Art */}
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border border-white/15 bg-dark-900">
            <img
              src={album.cover_path || '/storage/covers/album_default.svg'}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-400 block mb-1">
              Album Collection
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {album.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-3 text-xs sm:text-sm text-slate-300">
              <span
                onClick={() => album.artist_id && navigate(`/artists/${album.artist_id}`)}
                className="font-bold text-white hover:text-brand-300 cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                {album.artist_name || 'Various Artists'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {album.release_year || '2024'}
              </span>
              <span>•</span>
              <span className="text-slate-400">{songs.length} tracks</span>
              <span>•</span>
              <span className="text-slate-400">{formatTotalTime(album.totalDuration)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-6">
              {songs.length > 0 && (
                <>
                  <button
                    onClick={() => handlePlayAlbum(false)}
                    className="px-6 py-3 rounded-2xl bg-brand-500 text-white font-bold text-xs shadow-glow-brand hover:scale-105 active:scale-95 transition flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                    Play Album
                  </button>
                  <button
                    onClick={() => handlePlayAlbum(true)}
                    className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-xs hover:bg-white/10 transition flex items-center gap-2"
                  >
                    <Shuffle className="w-4 h-4" />
                    Shuffle
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tracklist Table */}
      <section className="space-y-4">
        <div className="glass-panel rounded-3xl p-3 divide-y divide-white/5">
          {songs.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No tracks found in this album.</p>
          ) : (
            songs.map((song, i) => (
              <SongRow
                key={song.id}
                song={song}
                index={i}
                queue={songs}
                showAlbum={false}
                onAddToPlaylist={(s) => setSelectedSongForPlaylist(s)}
              />
            ))
          )}
        </div>
      </section>

      {/* Add To Playlist Modal */}
      {selectedSongForPlaylist && (
        <AddToPlaylistModal
          song={selectedSongForPlaylist}
          isOpen={!!selectedSongForPlaylist}
          onClose={() => setSelectedSongForPlaylist(null)}
        />
      )}
    </div>
  );
}
