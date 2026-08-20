import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Shuffle,
  Search,
  Music,
  User,
  Disc,
  Sparkles,
  Layers,
  LayoutGrid,
  Plus,
  Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { songsAPI } from '../services/api';
import { useAudio } from '../context/AudioContext';
import MetadataEditorModal from '../components/modals/MetadataEditorModal';
import ImportProgressModal from '../components/modals/ImportProgressModal';
import ArtworkImage from '../components/common/ArtworkImage';
import SongDeckCarousel from '../components/common/SongDeckCarousel';
import CassetteTapeCard from '../components/common/CassetteTapeCard';
import { saveLocalSong, getLocalSongs, deleteLocalSong } from '../utils/indexedDbStorage';
import { parseAudioFileMetadata } from '../utils/id3Extractor';

export default function Home() {
  const { currentSong, isPlaying, playSong, togglePlay, toggleLike } = useAudio();
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('deck'); // 'deck' | 'grid' | 'albums' | 'artists'
  const [sortBy, setSortBy] = useState('date');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fileInputRef = useRef(null);

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
          artist_name: meta.artist || '1UP Track',
          album_title: meta.album || 'SONG//DECK Vol. 1',
          genre: meta.genre || 'Audio Deck',
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
    const albumName = song.album_title || 'SONG//DECK Collection';
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
    const artistName = song.artist_name || '1UP Artist';
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
    <div className="space-y-6 font-sans pb-32">

      {/* ================= 1. SONG//DECK TOP HEADER BAR ================= */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-black/40 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-3xl shadow-2xl">
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1ed760] flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(30,215,96,0.5)]">
            <Music className="w-5 h-5 fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-sans">
                SONG<span className="text-emerald-400">//</span>DECK
              </h1>
            </div>
            <p className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              REAL 1UP TRACKS & VAULT
            </p>
          </div>
        </div>

        {/* View Switchers & Search */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search track, artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-slate-400 text-xs font-sans focus:outline-none focus:border-emerald-400 transition"
            />
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center gap-1.5 bg-black/70 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewMode('deck')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                viewMode === 'deck'
                  ? 'bg-emerald-400 text-black font-black shadow-glow-brand'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D DECK</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-emerald-400 text-black font-black shadow-glow-brand'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>GRID</span>
            </button>

            <button
              onClick={() => setViewMode('albums')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                viewMode === 'albums'
                  ? 'bg-emerald-400 text-black font-black shadow-glow-brand'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>ALBUMS</span>
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(30,215,96,0.4)] hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* ================= 2. MAIN CONTENT STAGE ================= */}

      {/* 3D CAROUSEL DECK VIEW (MATCHING REFERENCE IMAGE) */}
      {viewMode === 'deck' && (
        <SongDeckCarousel
          songs={filteredSongs}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onSelectSong={(song) => playSong(song, filteredSongs)}
          onTogglePlay={togglePlay}
        />
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="space-y-4 pt-2">
          {filteredSongs.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-sans text-sm">
              No tracks found matching "{searchTerm}".
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

      {/* ALBUMS VIEW */}
      {viewMode === 'albums' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
          {albumsList.map((album, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/album/${encodeURIComponent(album.title)}`)}
              className="glass-card rounded-3xl p-4 border border-white/10 hover:border-emerald-400/50 transition cursor-pointer group shadow-xl"
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative shadow-md">
                <ArtworkImage
                  src={album.cover}
                  alt={album.title}
                  fallbackTitle={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-base font-bold text-white truncate font-sans">{album.title}</h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">{album.artist} • {album.songs.length} Tracks</p>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportProgressModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            setIsImportModalOpen(false);
            fetchSongs();
          }}
        />
      )}

    </div>
  );
}
