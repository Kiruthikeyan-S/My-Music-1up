import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Filter, Play, Shuffle, Music, Globe, Tag, Sparkles } from 'lucide-react';
import { songsAPI, categoriesAPI } from '../services/api';
import SongRow from '../components/cards/SongRow';
import { useAudio } from '../context/AudioContext';
import AddToPlaylistModal from '../components/modals/AddToPlaylistModal';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { playSong } = useAudio();

  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [songTypes, setSongTypes] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [selectedLang, setSelectedLang] = useState(searchParams.get('lang') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [sortBy, setSortBy] = useState('popular');

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [gRes, lRes, sRes] = await Promise.all([
          categoriesAPI.getGenres(),
          categoriesAPI.getLanguages(),
          categoriesAPI.getSongTypes()
        ]);
        setGenres(gRes.data.genres || []);
        setLanguages(lRes.data.languages || []);
        setSongTypes(sRes.data.songTypes || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function fetchSongs() {
      setLoading(true);
      try {
        const params = {
          genre_id: selectedGenre || undefined,
          language_id: selectedLang || undefined,
          song_type_id: selectedType || undefined,
          sort: sortBy,
          limit: 50
        };
        const res = await songsAPI.getAll(params);
        setSongs(res.data.songs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, [selectedGenre, selectedLang, selectedType, sortBy]);

  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedLang('');
    setSelectedType('');
    setSearchParams({});
  };

  const hasFilters = !!(selectedGenre || selectedLang || selectedType);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Explore & Filter Library
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Filter audio collections by genre, language, and song category
          </p>
        </div>

        {songs.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => playSong(songs[0], songs, 0)}
              className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-glow-brand hover:scale-105 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
              Play All ({songs.length})
            </button>
          </div>
        )}
      </div>

      {/* Filter Matrix */}
      <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-brand-400" />
            Active Filters
          </span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Genres Row */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">Genres</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                !selectedGenre
                  ? 'bg-white text-dark-950 font-bold'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              All Genres
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(selectedGenre === String(g.id) ? '' : String(g.id))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  selectedGenre === String(g.id)
                    ? 'bg-brand-500 text-white shadow-glow-brand'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <span>{g.icon || '🎵'}</span>
                <span>{g.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Languages Row */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">Languages</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLang('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                !selectedLang
                  ? 'bg-white text-dark-950 font-bold'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              All Languages
            </button>
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLang(selectedLang === String(l.id) ? '' : String(l.id))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedLang === String(l.id)
                    ? 'bg-cyan-500 text-white shadow-glow-cyan'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Song Types Row */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">Song Type</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                !selectedType
                  ? 'bg-white text-dark-950 font-bold'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              All Types
            </button>
            {songTypes.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedType(selectedType === String(st.id) ? '' : String(st.id))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedType === String(st.id)
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort & Results Counter */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-white">{songs.length}</strong> songs matching criteria
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Recently Added</option>
            <option value="title">Song Title (A-Z)</option>
            <option value="year">Release Year</option>
          </select>
        </div>
      </div>

      {/* Songs Table */}
      <div className="glass-panel rounded-3xl p-3 divide-y divide-white/5">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Filtering music collection...
          </div>
        ) : songs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Music className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
            <p className="text-sm font-semibold text-slate-300">No songs match these filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-glow-brand hover:scale-105 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          songs.map((song, i) => (
            <SongRow
              key={song.id}
              song={song}
              index={i}
              queue={songs}
              onAddToPlaylist={(s) => setSelectedSongForPlaylist(s)}
            />
          ))
        )}
      </div>

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
