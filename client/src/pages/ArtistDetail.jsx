import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Shuffle,
  CheckCircle,
  Users,
  Disc,
  Music,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { artistsAPI } from '../services/api';
import { useAudio } from '../context/AudioContext';
import SongRow from '../components/cards/SongRow';
import { AlbumCard } from '../components/cards/Cards';
import AddToPlaylistModal from '../components/modals/AddToPlaylistModal';

export default function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useAudio();

  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

  useEffect(() => {
    async function loadArtist() {
      setLoading(true);
      try {
        const res = await artistsAPI.getById(id);
        setArtistData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadArtist();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-dark-900" />
        <div className="h-96 rounded-3xl bg-dark-900" />
      </div>
    );
  }

  if (!artistData || !artistData.artist) {
    return (
      <div className="p-12 text-center text-slate-400">
        Artist not found.
      </div>
    );
  }

  const { artist, topSongs, albums, singles, genres } = artistData;

  const formatListeners = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Artist Hero Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-r from-brand-900 via-dark-900 to-dark-950 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full overflow-hidden flex-shrink-0 border-4 border-white/15 shadow-2xl bg-dark-900">
            <img
              src={artist.image_path || '/storage/covers/artist_default.svg'}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold mb-2">
              <CheckCircle className="w-3.5 h-3.5 fill-brand-500 text-dark-900" />
              <span>Verified Artist</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {artist.name}
            </h1>

            {artist.bio && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2 line-clamp-2">
                {artist.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Users className="w-4 h-4 text-cyan-400" />
                {formatListeners(artist.monthly_listeners)} Monthly Listeners
              </span>
              <span>•</span>
              <span>{albums.length} Albums</span>
              <span>•</span>
              <span>{topSongs.length} Tracks</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-6">
              {topSongs.length > 0 && (
                <button
                  onClick={() => playSong(topSongs[0], topSongs, 0)}
                  className="px-6 py-3 rounded-2xl bg-brand-500 text-white font-bold text-xs shadow-glow-brand hover:scale-105 active:scale-95 transition flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                  Play Popular
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Genres */}
      {genres.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Genres:</span>
          {genres.map((g) => (
            <span
              key={g.id}
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-slate-300"
            >
              {g.name}
            </span>
          ))}
        </div>
      )}

      {/* Popular Songs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Popular Tracks</h2>
        <div className="glass-panel rounded-3xl p-3 divide-y divide-white/5">
          {topSongs.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              index={i}
              queue={topSongs}
              onAddToPlaylist={(s) => setSelectedSongForPlaylist(s)}
            />
          ))}
        </div>
      </section>

      {/* Albums Discography */}
      {albums.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Albums & Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Singles & EPs */}
      {singles.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Singles & EPs</h2>
          <div className="glass-panel rounded-3xl p-3 divide-y divide-white/5">
            {singles.map((song, i) => (
              <SongRow
                key={song.id}
                song={song}
                index={i}
                queue={singles}
                onAddToPlaylist={(s) => setSelectedSongForPlaylist(s)}
              />
            ))}
          </div>
        </section>
      )}

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
