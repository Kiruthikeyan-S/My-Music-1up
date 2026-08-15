import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FolderPlus,
  FileAudio,
  Play,
  Pause,
  Shuffle,
  Search,
  Trash2,
  Edit,
  Music,
  User,
  Disc,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Clock,
  Volume2,
  Sparkles,
  HardDrive
} from 'lucide-react';
import { songsAPI, adminAPI, categoriesAPI } from '../services/api';
import { useAudio } from '../context/AudioContext';
import MetadataEditorModal from '../components/modals/MetadataEditorModal';
import ImportProgressModal from '../components/modals/ImportProgressModal';
import ArtworkImage from '../components/common/ArtworkImage';
import OneUpLogo from '../components/common/OneUpLogo';

export default function Home() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('songs'); // 'songs' | 'artists' | 'albums'
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const fetchSongs = async () => {
    try {
      const res = await songsAPI.getAll({ limit: 500 });
      setSongs(res.data.songs || []);
    } catch (err) {
      console.error(err);
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

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    let count = 0;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop().toLowerCase();
      if (['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus', 'wma'].includes(ext)) {
        formData.append('audioFiles', file);
        count++;
      }
    }

    if (count === 0) {
      alert('Please select supported audio files (.mp3, .wav, .flac, .m4a, .aac, .ogg)');
      setIsUploading(false);
      return;
    }

    try {
      const res = await adminAPI.uploadFiles(formData);
      setUploadMessage(`Successfully uploaded and indexed ${res.data.imported} song(s)!`);
      fetchSongs();
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadFiles(files);
    }
  };

  // Delete song
  const handleDeleteSong = async (id, title) => {
    if (window.confirm(`Delete "${title}" from your library?`)) {
      try {
        await adminAPI.deleteSong(id);
        setSongs(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        alert('Failed to delete song: ' + err.message);
      }
    }
  };

  // Filter songs by search
  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.artist_name && s.artist_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.album_title && s.album_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.genre_name && s.genre_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalDuration = songs.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalHours = (totalDuration / 3600).toFixed(1);

  // Group by Artist
  const artistsMap = {};
  songs.forEach(s => {
    const art = s.artist_name || 'Unknown Artist';
    if (!artistsMap[art]) {
      artistsMap[art] = { name: art, image: s.artist_image || s.cover_path, songs: [] };
    }
    artistsMap[art].songs.push(s);
  });
  const artistsList = Object.values(artistsMap);

  // Group by Album
  const albumsMap = {};
  songs.forEach(s => {
    const alb = s.album_title || 'Singles';
    if (!albumsMap[alb]) {
      albumsMap[alb] = { title: alb, artist: s.artist_name, cover: s.album_cover || s.cover_path, songs: [] };
    }
    albumsMap[alb].songs.push(s);
  });
  const albumsList = Object.values(albumsMap);

  return (
    <div className="space-y-8">
      {/* 1. UPLOAD & LOCAL FOLDER DROPZONE BANNER */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-3xl p-6 sm:p-8 border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-brand-400 bg-brand-500/20 scale-[1.01]'
            : 'border-brand-500/30 bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 hover:border-brand-500/60 shadow-2xl'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="p-2 rounded-2xl bg-black/60 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(0,230,0,0.35)] flex-shrink-0 animate-float">
              <OneUpLogo className="h-12 w-auto" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-serif flex items-center gap-2.5">
                <span>1UP</span>
                <span className="text-amber-400 font-sans text-xl">—</span>
                <span className="text-amber-300 font-serif">Music Vault</span>
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/80 mt-1 max-w-xl italic font-serif">
                Drag and drop MP3, WAV, FLAC, M4A, or AAC songs & folders here. Cover art & metadata are parsed automatically!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-3 rounded-2xl bg-brand-500 text-white font-bold text-xs shadow-glow-brand hover:scale-105 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
            >
              <FileAudio className="w-4 h-4" />
              Select Audio Files
            </button>

            <button
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-3 rounded-2xl bg-cyan-500 text-dark-950 font-black text-xs shadow-glow-cyan hover:scale-105 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
            >
              <FolderPlus className="w-4 h-4" />
              Select Entire Folder
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <HardDrive className="w-4 h-4 text-purple-400" />
              Scan Disk Path
            </button>
          </div>
        </div>

        {/* Hidden Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".mp3,.wav,.flac,.m4a,.aac,.ogg,.opus,.wma,audio/*"
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

        {/* Upload Status Banner */}
        {isUploading && (
          <div className="mt-4 p-3 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-300 flex items-center gap-2 animate-pulse">
            <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            Uploading and parsing audio tags...
          </div>
        )}

        {uploadMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            {uploadMessage}
          </div>
        )}
      </div>

      {/* 2. LIBRARY CONTROLS, SEARCH & FILTER TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by song title, artist, album, genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
          />
        </div>

        {/* View Mode Switcher + Play All Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-dark-900 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewMode('songs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'songs' ? 'bg-brand-500 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Songs ({filteredSongs.length})
            </button>
            <button
              onClick={() => setViewMode('artists')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'artists' ? 'bg-brand-500 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'
              }`}
            >
              Artists ({artistsList.length})
            </button>
            <button
              onClick={() => setViewMode('albums')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'albums' ? 'bg-brand-500 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'
              }`}
            >
              Albums ({albumsList.length})
            </button>
          </div>

          {filteredSongs.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => playSong(filteredSongs[0], filteredSongs, 0)}
                className="px-4 py-2 rounded-xl bg-white text-dark-950 font-black text-xs shadow-lg hover:scale-105 transition flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-dark-950 ml-0.5" />
                Play All
              </button>
              <button
                onClick={() => {
                  const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
                  playSong(shuffled[0], shuffled, 0);
                }}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Shuffle All"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. MAIN MUSIC CATALOG VIEW */}
      {viewMode === 'songs' && (
        <div className="glass-panel rounded-3xl p-3 divide-y divide-white/5 shadow-2xl border border-white/10">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
              Loading music vault...
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Music className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">No songs found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload audio files or select a folder from your local computer using the box above.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-glow-brand hover:scale-105 transition"
              >
                Upload First Song
              </button>
            </div>
          ) : (
            filteredSongs.map((song, i) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => {
                    if (isCurrent) togglePlay();
                    else playSong(song, filteredSongs, i);
                  }}
                  className={`group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'hover:bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  {/* Play Indicator / Index */}
                  <div className="w-8 flex-shrink-0 text-center flex items-center justify-center">
                    {isCurrent && isPlaying ? (
                      <Volume2 className="w-4 h-4 text-brand-400 animate-pulse" />
                    ) : (
                      <span className="text-xs font-mono text-slate-500 group-hover:hidden">
                        {i + 1}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) togglePlay();
                        else playSong(song, filteredSongs, i);
                      }}
                      className="hidden group-hover:block p-1 text-slate-200 hover:text-brand-400 transition"
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Album Artwork Cover */}
                  <ArtworkImage
                    src={song.cover_path || song.album_cover}
                    alt={song.title}
                    fallbackTitle={song.title}
                    className="w-11 h-11 rounded-xl shadow-md border border-white/10 flex-shrink-0"
                  />

                  {/* Title & Artist */}
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`text-sm font-bold truncate ${isCurrent ? 'text-brand-300' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate flex items-center gap-2 mt-0.5">
                      <span>{song.artist_name || 'Unknown Artist'}</span>
                      {song.genre_name && (
                        <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
                          {song.genre_name}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Album Name */}
                  <div className="hidden md:block w-1/4 truncate text-xs text-slate-400">
                    {song.album_title || 'Single'}
                  </div>

                  {/* Format & Duration */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {song.format && (
                      <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                        {song.format}
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400 w-12 text-right">
                      {formatDuration(song.duration)}
                    </span>
                  </div>

                  {/* Edit Tags & Delete Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSong(song);
                      }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition opacity-0 group-hover:opacity-100"
                      title="Edit Song Tags"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSong(song.id, song.title);
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition opacity-0 group-hover:opacity-100"
                      title="Delete Track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. ARTISTS VIEW */}
      {viewMode === 'artists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {artistsList.map((art, i) => (
            <div
              key={i}
              onClick={() => {
                if (art.songs.length > 0) playSong(art.songs[0], art.songs, 0);
              }}
              className="group glass-card p-4 rounded-3xl cursor-pointer flex flex-col items-center text-center transition-all hover:scale-105"
            >
              <div className="relative w-28 h-28 rounded-full overflow-hidden mb-3 bg-dark-900 border-2 border-white/10 group-hover:border-brand-500 transition-colors shadow-lg">
                <ArtworkImage
                  src={art.image}
                  alt={art.name}
                  fallbackTitle={art.name}
                  className="w-full h-full rounded-full"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full">
                  <div className="p-3 rounded-full bg-brand-500 text-white shadow-glow-brand">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-bold text-white truncate w-full group-hover:text-brand-400 transition">
                {art.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{art.songs.length} tracks</p>
            </div>
          ))}
        </div>
      )}

      {/* 5. ALBUMS VIEW */}
      {viewMode === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albumsList.map((alb, i) => (
            <div
              key={i}
              onClick={() => {
                if (alb.songs.length > 0) playSong(alb.songs[0], alb.songs, 0);
              }}
              className="group glass-card p-3.5 rounded-2xl cursor-pointer hover:scale-[1.02] transition"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-dark-900 border border-white/10 shadow-md">
                <ArtworkImage
                  src={alb.cover}
                  alt={alb.title}
                  fallbackTitle={alb.title}
                  className="w-full h-full rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-xl">
                  <div className="p-3 rounded-full bg-brand-500 text-white shadow-glow-brand">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-400 transition">
                {alb.title}
              </h4>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {alb.artist} • {alb.songs.length} tracks
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Tags Modal */}
      {editingSong && (
        <MetadataEditorModal
          song={editingSong}
          isOpen={!!editingSong}
          onClose={() => setEditingSong(null)}
          onSaved={() => {
            setEditingSong(null);
            fetchSongs();
          }}
        />
      )}

      {/* Import / Folder Path Scanner Modal */}
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
