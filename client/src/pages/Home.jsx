import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FolderPlus,
  Play,
  Pause,
  Shuffle,
  Search,
  Trash2,
  Edit,
  Music,
  User,
  Disc,
  Clock,
  Sparkles,
  Layers,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { songsAPI } from '../services/api';
import { useAudio } from '../context/AudioContext';
import MetadataEditorModal from '../components/modals/MetadataEditorModal';
import ImportProgressModal from '../components/modals/ImportProgressModal';
import ArtworkImage from '../components/common/ArtworkImage';
import CassetteTapeCard from '../components/common/CassetteTapeCard';
import { saveLocalSong, getLocalSongs, deleteLocalSong } from '../utils/indexedDbStorage';
import { parseAudioFileMetadata } from '../utils/id3Extractor';

export default function Home() {
  const { currentSong, isPlaying, playSong, togglePlay, toggleLike } = useAudio();
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('songs'); // 'songs' | 'albums' | 'artists'
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'title' | 'artist'
  const [editingSong, setEditingSong] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const fetchSongs = async () => {
    try {
      let serverSongs = [];
      try {
        const res = await songsAPI.getAll({ limit: 500 });
        serverSongs = res.data.songs || [];
      } catch (e) {
        console.warn('Server API offline or unavailable, checking local storage...');
      }

      // Load persistent songs from browser IndexedDB
      const localSongs = await getLocalSongs();

      // Merge avoiding duplicate IDs
      const combined = [...localSongs];
      serverSongs.forEach(s => {
        if (!combined.some(c => c.id === s.id)) {
          combined.push(s);
        }
      });

      setSongs(combined);
    } catch (err) {
      console.error('Error fetching songs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // Handle direct file uploads (Drag & Drop or File Browser)
  const handleUploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const meta = await parseAudioFileMetadata(file);
        const newLocalSong = {
          id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          title: meta.title || file.name.replace(/\.[^/.]+$/, ''),
          artist_name: meta.artist || 'Local Tape Deck',
          album_title: meta.album || 'Cassette Mixtape Vol. 1',
          genre: meta.genre || 'Analog Tape',
          duration: meta.duration || 0,
          cover_path: meta.pictureDataUrl || '',
          album_cover: meta.pictureDataUrl || '',
          is_local: true,
          created_at: new Date().toISOString()
        };
        await saveLocalSong(newLocalSong, file);
      } catch (err) {
        console.error('Error importing audio file offline:', err);
      }
    }
    await fetchSongs();
  };

  // Group songs into distinct Albums and Artists
  const albumsMap = songs.reduce((acc, song) => {
    const albumName = song.album_title || 'Cassette Mixtape';
    if (!acc[albumName]) {
      acc[albumName] = {
        title: albumName,
        artist: song.artist_name || 'Various Artists',
        cover: song.cover_path || song.album_cover,
        songs: []
      };
    }
    acc[albumName].songs.push(song);
    return acc;
  }, {});
  const albumsList = Object.values(albumsMap);

  const artistsMap = songs.reduce((acc, song) => {
    const artistName = song.artist_name || 'Studio Artist';
    if (!acc[artistName]) {
      acc[artistName] = {
        name: artistName,
        cover: song.cover_path || song.album_cover,
        songs: []
      };
    }
    acc[artistName].songs.push(song);
    return acc;
  }, {});
  const artistsList = Object.values(artistsMap);

  // Filter songs
  const filteredSongs = songs
    .filter(song => {
      const q = searchTerm.toLowerCase();
      return (
        (song.title && song.title.toLowerCase().includes(q)) ||
        (song.artist_name && song.artist_name.toLowerCase().includes(q)) ||
        (song.album_title && song.album_title.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return (a.artist_name || '').localeCompare(b.artist_name || '');
      return (b.id || '').toString().localeCompare((a.id || '').toString());
    });

  return (
    <div className="space-y-8 font-serif pb-28">
      {/* ================= VINTAGE TAPE DECK TOP CONSOLE ================= */}
      <div className="bg-[#12100d]/95 backdrop-blur-xl border border-amber-500/25 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        {/* Top Header Bar with TAPE DECK Brand, Tabs & Vibe Knob */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 border-b border-white/10 pb-5">
          {/* TAPE DECK Retro Logo */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-amber-400">
                  TAPE
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-white">
                  DECK
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-amber-200/50 uppercase">
                Stereo Cassette Library • TD-1UP
              </span>
            </div>
          </div>

          {/* Navigation View Tabs (ALL TRACKS / ALBUMS / ARTISTS) */}
          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewMode('songs')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                viewMode === 'songs'
                  ? 'bg-amber-400 text-dark-950 font-black shadow-glow-brand'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>ALL SONGS ({songs.length})</span>
            </button>

            <button
              onClick={() => setViewMode('albums')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                viewMode === 'albums'
                  ? 'bg-amber-400 text-dark-950 font-black shadow-glow-brand'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Disc className="w-4 h-4" />
              <span>ALBUMS ({albumsList.length})</span>
            </button>

            <button
              onClick={() => setViewMode('artists')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                viewMode === 'artists'
                  ? 'bg-amber-400 text-dark-950 font-black shadow-glow-brand'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>ARTISTS ({artistsList.length})</span>
            </button>
          </div>

          {/* Analog Rotary Mood Knob (Chill / Vibe) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (filteredSongs.length > 0) {
                  playSong(filteredSongs[0], filteredSongs, 0);
                }
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-dark-950 font-mono font-black text-xs transition flex items-center gap-2 shadow-glow-brand hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>PLAY ALL</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-amber-400/70 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cassette title, artist, mixtape..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-white placeholder-amber-200/30 text-xs sm:text-sm font-serif focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-mono text-amber-200/60 uppercase">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/70 border border-white/15 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="date">DATE ADDED</option>
              <option value="title">TITLE (A-Z)</option>
              <option value="artist">ARTIST (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT VIEWS ================= */}

      {/* 1. ALL SONGS (AUTHENTIC CASSETTE TAPE CARDS) */}
      {viewMode === 'songs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-mono font-black text-amber-400 uppercase tracking-widest">
              <span>▶ CASSETTE TAPES</span>
              <span className="text-amber-200/40">({filteredSongs.length})</span>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 font-mono text-sm">
              Loading tape deck collection...
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-black/40 rounded-3xl border border-white/10 p-8">
              <Music className="w-12 h-12 text-amber-400/50 mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-white">No Cassette Tapes Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Drop your audio files or click the Upload button to create your custom retro cassette library.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2 rounded-xl bg-amber-400 text-dark-950 font-bold font-mono text-xs shadow-glow-brand transition hover:scale-105"
              >
                Insert Tape Files
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredSongs.map((song, idx) => (
                <CassetteTapeCard
                  key={song.id}
                  song={song}
                  index={idx}
                  isActive={currentSong && currentSong.id === song.id}
                  isPlaying={isPlaying}
                  onPlay={() => playSong(song, filteredSongs, idx)}
                  onToggleLike={toggleLike}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ALBUMS / MIXTAPES (VINTAGE TAPE CASES) */}
      {viewMode === 'albums' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1 text-xs font-mono font-black text-amber-400 uppercase tracking-widest">
            <span>💽 ALBUM BOX SETS & MIXTAPES</span>
            <span className="text-amber-200/40">({albumsList.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albumsList.map((album, idx) => (
              <div
                key={idx}
                onClick={() => {
                  navigate(`/album/${encodeURIComponent(album.title)}`);
                }}
                className="group cursor-pointer rounded-3xl bg-[#14120f]/90 border border-white/10 hover:border-amber-400/60 p-4 transition-all duration-300 transform hover:-translate-y-2 shadow-2xl hover:shadow-[0_15px_35px_rgba(229,169,60,0.3)] space-y-3 select-none"
              >
                {/* Album Cover / J-Card Box Artwork */}
                <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-md border border-white/10 bg-black">
                  <ArtworkImage
                    src={album.cover}
                    alt={album.title}
                    fallbackTitle={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <span className="text-[10px] font-mono text-amber-300 font-bold">
                      {album.songs.length} Tracks
                    </span>
                    <div className="w-10 h-10 rounded-full bg-amber-400 text-dark-950 flex items-center justify-center font-black shadow-xl">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white truncate font-serif group-hover:text-amber-300 transition">
                    {album.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5 font-serif italic">
                    {album.artist} • {album.songs.length} Tracks
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ARTISTS (STUDIO ARTIST REELS) */}
      {viewMode === 'artists' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1 text-xs font-mono font-black text-amber-400 uppercase tracking-widest">
            <span>🎙️ STUDIO ARTISTS</span>
            <span className="text-amber-200/40">({artistsList.length})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {artistsList.map((artist, idx) => (
              <div
                key={idx}
                onClick={() => {
                  navigate(`/artist/${encodeURIComponent(artist.name)}`);
                }}
                className="group cursor-pointer rounded-3xl bg-[#14120f]/90 border border-white/10 hover:border-amber-400/60 p-4 transition-all duration-300 transform hover:-translate-y-2 shadow-2xl flex flex-col items-center text-center space-y-3 select-none"
              >
                {/* Circular Artist Avatar */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden relative shadow-xl border-2 border-amber-400/40 group-hover:border-amber-400 group-hover:scale-105 transition-all duration-500 bg-black">
                  <ArtworkImage
                    src={artist.cover}
                    alt={artist.name}
                    fallbackTitle={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="w-full">
                  <h3 className="text-sm font-bold text-white truncate font-serif group-hover:text-amber-300 transition">
                    {artist.name}
                  </h3>
                  <p className="text-[11px] text-amber-200/60 font-mono mt-0.5">
                    {artist.songs.length} {artist.songs.length === 1 ? 'Tape' : 'Tapes'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden File Upload Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleUploadFiles(e.target.files)}
      />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={(e) => handleUploadFiles(e.target.files)}
      />

      {/* Metadata Editor Modal */}
      {editingSong && (
        <MetadataEditorModal
          song={editingSong}
          onClose={() => setEditingSong(null)}
          onSave={fetchSongs}
        />
      )}
    </div>
  );
}
