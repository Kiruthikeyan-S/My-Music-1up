import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Music, User, Disc, ListMusic, Play, X } from 'lucide-react';
import { songsAPI, artistsAPI, albumsAPI, playlistsAPI } from '../services/api';
import SongRow from '../components/cards/SongRow';
import { ArtistCard, AlbumCard } from '../components/cards/Cards';
import { useAudio } from '../context/AudioContext';
import AddToPlaylistModal from '../components/modals/AddToPlaylistModal';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { playSong } = useAudio();

  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'songs' | 'artists' | 'albums' | 'playlists'

  const [results, setResults] = useState({
    songs: [],
    artists: [],
    albums: [],
    playlists: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults({ songs: [], artists: [], albums: [], playlists: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [songsRes, artistsRes, albumsRes, plRes] = await Promise.all([
          songsAPI.getAll({ search: searchTerm.trim(), limit: 12 }),
          artistsAPI.getAll({ search: searchTerm.trim(), limit: 6 }),
          albumsAPI.getAll({ search: searchTerm.trim(), limit: 6 }),
          playlistsAPI.getAll()
        ]);

        const filteredPlaylists = (plRes.data.playlists || []).filter(p =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setResults({
          songs: songsRes.data.songs || [],
          artists: artistsRes.data.artists || [],
          albums: albumsRes.data.albums || [],
          playlists: filteredPlaylists
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setSearchParams(val ? { q: val } : {});
  };

  const topSong = results.songs[0];
  const topArtist = results.artists[0];
  const topResult = topSong || topArtist;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="relative">
          <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Search songs, artists, albums, playlists..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full h-14 pl-12 pr-12 bg-dark-900 border border-white/10 rounded-2xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-2xl transition"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchParams({});
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'songs', label: 'Songs', count: results.songs.length },
            { id: 'artists', label: 'Artists', count: results.artists.length },
            { id: 'albums', label: 'Albums', count: results.albums.length },
            { id: 'playlists', label: 'Playlists', count: results.playlists.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterType === tab.id
                  ? 'bg-brand-500 text-white shadow-glow-brand'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-white">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* No Query Prompt */}
      {!searchTerm && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mx-auto">
            <SearchIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Search your Sonora Library</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Discover tracks, explore discographies, or find curated playlists by typing above.
          </p>
        </div>
      )}

      {/* Results View */}
      {searchTerm && (
        <div className="space-y-8">
          {/* Top Result + Songs Table */}
          {(filterType === 'all' || filterType === 'songs') && results.songs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Result Highlight Card */}
              {topResult && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white">Top Result</h3>
                  <div
                    onClick={() => {
                      if (topSong) playSong(topSong, results.songs, 0);
                      else if (topArtist) navigate(`/artists/${topArtist.id}`);
                    }}
                    className="group glass-card p-6 rounded-3xl cursor-pointer relative overflow-hidden flex flex-col justify-between h-56 transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={topSong?.cover_path || topArtist?.image_path || '/storage/covers/album_default.svg'}
                        alt="Top result"
                        className={`w-20 h-20 object-cover shadow-xl border border-white/10 ${topArtist && !topSong ? 'rounded-full' : 'rounded-2xl'}`}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 block mb-1">
                          {topSong ? 'Song' : 'Artist'}
                        </span>
                        <h4 className="text-xl font-black text-white truncate">
                          {topSong?.title || topArtist?.name}
                        </h4>
                        <p className="text-xs text-slate-400 truncate mt-1">
                          {topSong ? topSong.artist_name : `${topArtist?.monthly_listeners} Listeners`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-slate-300">
                        {topSong?.genre_name || 'Popular'}
                      </span>
                      <div className="p-3.5 rounded-full bg-brand-500 text-white shadow-glow-brand group-hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Matching Songs List */}
              <div className={`space-y-2 ${topResult ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <h3 className="text-lg font-bold text-white">Songs</h3>
                <div className="glass-panel rounded-2xl p-2 divide-y divide-white/5">
                  {results.songs.slice(0, 5).map((song, i) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={i}
                      queue={results.songs}
                      onAddToPlaylist={(s) => setSelectedSongForPlaylist(s)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Artists Grid */}
          {(filterType === 'all' || filterType === 'artists') && results.artists.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          )}

          {/* Albums Grid */}
          {(filterType === 'all' || filterType === 'albums') && results.albums.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </div>
          )}

          {/* Playlists Grid */}
          {(filterType === 'all' || filterType === 'playlists') && results.playlists.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Playlists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.playlists.map((pl) => (
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
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{pl.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Playlist</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty Results State */}
          {!loading &&
            results.songs.length === 0 &&
            results.artists.length === 0 &&
            results.albums.length === 0 &&
            results.playlists.length === 0 && (
              <div className="text-center py-16">
                <p className="text-base font-semibold text-slate-300">
                  No results found for "{searchTerm}"
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Try checking for typos or searching by another artist or genre.
                </p>
              </div>
            )}
        </div>
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
