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
  Compass,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { songsAPI } from '../services/api';
import { useAudio } from '../context/AudioContext';
import MetadataEditorModal from '../components/modals/MetadataEditorModal';
import ImportProgressModal from '../components/modals/ImportProgressModal';
import ArtworkImage from '../components/common/ArtworkImage';
import SongDeckCarousel from '../components/common/SongDeckCarousel';
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
          album_title: meta.album || 'Music Vault',
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
    const albumName = song.album_title || 'Music Vault Collection';
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

      {/* ================= 1. CLEAN TOP SEARCH & CONTROLS BAR ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-xl">
          <button
            onClick={() => setViewMode('deck')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
              viewMode === 'deck'
                ? 'bg-[#1ed760] text-black font-black shadow-glow-brand'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>DECK CAROUSEL</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
              viewMode === 'grid'
                ? 'bg-[#1ed760] text-black font-black shadow-glow-brand'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>GRID VIEW</span>
          </button>

          <button
            onClick={() => setViewMode('albums')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
              viewMode === 'albums'
                ? 'bg-[#1ed760] text-black font-black shadow-glow-brand'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>ALBUMS</span>
          </button>
        </div>

        {/* Search & Upload Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-slate-400 text-xs font-sans focus:outline-none focus:border-[#1ed760] transition shadow-inner"
            />
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs shadow-[0_0_20px_rgba(30,215,96,0.4)] hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* ================= 2. MAIN CONTENT STAGE ================= */}

      {/* 3D CAROUSEL DECK VIEW */}
      {viewMode === 'deck' && (
        <SongDeckCarousel
          songs={filteredSongs}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onSelectSong={(song) => playSong(song, filteredSongs)}
          onTogglePlay={togglePlay}
        />
      )}

      {/* ALBUM PHOTO GRID VIEW (CLEAN PHOTO CARDS) */}
      {viewMode === 'grid' && (
        <div className="space-y-4 pt-2">
          {filteredSongs.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-sans text-sm">
              No tracks found matching "{searchTerm}".
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredSongs.map((song, idx) => {
                const isActive = currentSong?.id === song.id;
                const isCurrentPlaying = isActive && isPlaying;

                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, filteredSongs, idx)}
                    className="glass-card rounded-3xl p-3 sm:p-4 border border-white/10 hover:border-[#1ed760]/50 transition cursor-pointer group shadow-xl relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Album Art Cover Photo */}
                    <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative shadow-lg bg-black">
                      <ArtworkImage
                        src={song.cover_path || song.album_cover}
                        alt={song.title}
                        fallbackTitle={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Play Button Overlay on Hover */}
                      <div className={`absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className="w-12 h-12 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition">
                          {isCurrentPlaying ? (
                            <Pause className="w-6 h-6 fill-black" />
                          ) : (
                            <Play className="w-6 h-6 fill-black ml-1" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Song Details */}
                    <div className="flex items-end justify-between min-w-0">
                      <div className="min-w-0 pr-2">
                        <h3 className={`text-sm font-bold truncate font-sans ${isActive ? 'text-[#1ed760]' : 'text-white'}`}>
                          {song.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                          {song.artist_name || 'Various Artists'}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 transition"
                      >
                        <Heart className={`w-4 h-4 ${song.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ALBUMS VIEW */}
      {viewMode === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-2">
          {albumsList.map((album, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/album/${encodeURIComponent(album.title)}`)}
              className="glass-card rounded-3xl p-3 sm:p-4 border border-white/10 hover:border-[#1ed760]/50 transition cursor-pointer group shadow-xl"
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative shadow-md">
                <ArtworkImage
                  src={album.cover}
                  alt={album.title}
                  fallbackTitle={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-sm font-bold text-white truncate font-sans">{album.title}</h3>
              <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">{album.artist} • {album.songs.length} Tracks</p>
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
