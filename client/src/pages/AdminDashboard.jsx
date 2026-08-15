import React, { useState, useEffect } from 'react';
import {
  FolderSync,
  FolderOpen,
  AlertTriangle,
  Copy,
  Music,
  Users,
  Disc,
  Layers,
  Database,
  BarChart3,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { adminAPI, songsAPI, categoriesAPI } from '../services/api';
import ImportProgressModal from '../components/modals/ImportProgressModal';
import MetadataEditorModal from '../components/modals/MetadataEditorModal';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('import'); // 'import' | 'review' | 'duplicates' | 'catalog' | 'artists_albums' | 'stats'
  const [stats, setStats] = useState(null);
  const [missingSongs, setMissingSongs] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState(new Set());
  const [bulkGenreId, setBulkGenreId] = useState('');
  const [bulkLangId, setBulkLangId] = useState('');
  const [bulkTypeId, setBulkTypeId] = useState('');
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [songTypes, setSongTypes] = useState([]);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, missingRes, dupRes, songsRes, gRes, lRes, sRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getMissingMetadata(),
        adminAPI.getDuplicates(),
        songsAPI.getAll({ limit: 100 }),
        categoriesAPI.getGenres(),
        categoriesAPI.getLanguages(),
        categoriesAPI.getSongTypes()
      ]);

      setStats(statsRes.data);
      setMissingSongs(missingRes.data.songs || []);
      setDuplicates(dupRes.data.duplicates || []);
      setAllSongs(songsRes.data.songs || []);
      setGenres(gRes.data.genres || []);
      setLanguages(lRes.data.languages || []);
      setSongTypes(sRes.data.songTypes || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) return (mb / 1024).toFixed(2) + ' GB';
    return mb.toFixed(1) + ' MB';
  };

  const formatHours = (sec) => {
    if (!sec) return '0 hrs';
    return (sec / 3600).toFixed(1) + ' hrs';
  };

  const handleBulkUpdate = async () => {
    if (selectedSongIds.size === 0) return;
    try {
      await adminAPI.bulkUpdate(Array.from(selectedSongIds), {
        genre_id: bulkGenreId || undefined,
        language_id: bulkLangId || undefined,
        song_type_id: bulkTypeId || undefined
      });
      setActionSuccess(`Updated ${selectedSongIds.size} songs successfully!`);
      setSelectedSongIds(new Set());
      loadAllData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSong = async (id) => {
    if (window.confirm('Delete this track from the library?')) {
      try {
        await adminAPI.deleteSong(id);
        loadAllData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleResolveDuplicate = async (dup) => {
    const keepId = dup.songs[0].id;
    const deleteIds = dup.songs.slice(1).map(s => s.id);
    try {
      await adminAPI.resolveDuplicate(keepId, deleteIds);
      setActionSuccess(`Duplicate resolved. Kept primary record.`);
      loadAllData();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedSongIds.size === allSongs.length) {
      setSelectedSongIds(new Set());
    } else {
      setSelectedSongIds(new Set(allSongs.map(s => s.id)));
    }
  };

  const filteredCatalog = allSongs.filter(s =>
    s.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    (s.artist_name && s.artist_name.toLowerCase().includes(catalogSearch.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-glow-amber">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Sonora Admin Studio
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SYSTEM
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Music directory indexing, automated tag extraction, duplicate pruning & catalog control
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-brand-500 text-white font-bold text-xs shadow-glow-brand hover:scale-105 transition flex items-center justify-center gap-2"
        >
          <FolderOpen className="w-4 h-4" />
          Import Music Directory
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          {actionSuccess}
        </div>
      )}

      {/* Primary Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <Music className="w-4 h-4 text-brand-400 mb-1" />
            <span className="text-xl font-bold text-white block">{stats.totalSongs}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Songs</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <Users className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-xl font-bold text-white block">{stats.totalArtists}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Artists</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <Disc className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-xl font-bold text-white block">{stats.totalAlbums}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Albums</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <HardDrive className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-xl font-bold text-white block">{formatBytes(stats.totalSize)}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Storage Used</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <Layers className="w-4 h-4 text-rose-400 mb-1" />
            <span className="text-xl font-bold text-white block">{formatHours(stats.totalDuration)}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Audio Length</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-xl font-bold text-amber-300 block">{stats.missingMetadataCount}</span>
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">Needs Review</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-dark-900 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'import' ? 'bg-brand-500 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderSync className="w-4 h-4" />
          Music Folder Importer
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition relative ${
            activeTab === 'review' ? 'bg-amber-500 text-white shadow-glow-amber' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Review Missing Metadata ({missingSongs.length})
        </button>

        <button
          onClick={() => setActiveTab('duplicates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'duplicates' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Copy className="w-4 h-4" />
          Duplicate Resolver ({duplicates.length})
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'catalog' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Music className="w-4 h-4" />
          Song Catalog & Bulk Editor
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'stats' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          System Analytics
        </button>
      </div>

      {/* TAB 1: MUSIC FOLDER IMPORTER */}
      {activeTab === 'import' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-white/10 animate-in fade-in">
          <div className="max-w-2xl">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Automatic Audio Indexer & Tag Reader
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select any local music directory containing audio files. The parser scans subfolders,
              extracts ID3/Vorbis tags & embedded cover pictures, separates artists & albums, computes SHA-256 hashes to prevent duplicates, and organizes into the database.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-white block">Bundled Sample Music Directory</span>
              <code className="text-xs text-brand-400 font-mono">storage/music/demo</code>
              <p className="text-[11px] text-slate-500 mt-0.5">Includes multi-genre playable audio files ready to scan</p>
            </div>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-glow-brand hover:scale-105 transition flex items-center justify-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Launch Importer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-white">1. Formats Supported</span>
              <p className="text-[11px] text-slate-400">MP3, WAV, FLAC, M4A, AAC, OGG, OPUS with embedded tag extraction.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-white">2. Automatic Relations</span>
              <p className="text-[11px] text-slate-400">Generates missing Artist and Album records automatically without manual DB inserts.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-white">3. Zero Duplicates</span>
              <p className="text-[11px] text-slate-400">Content hash checking prevents re-indexing existing music files.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REVIEW MISSING METADATA */}
      {activeTab === 'review' && (
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Tracks Flagged for Review</h3>
              <p className="text-xs text-slate-400">
                Songs with missing key tags (Artist, Album, Title) that require administrator calibration
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {missingSongs.length} Tracks
            </span>
          </div>

          {missingSongs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">All Tracks Fully Tagged!</p>
              <p className="text-xs text-slate-500">There are no tracks with missing metadata.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Title</th>
                    <th className="py-3 px-3">Artist</th>
                    <th className="py-3 px-3">Album</th>
                    <th className="py-3 px-3">Genre</th>
                    <th className="py-3 px-3">Language</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {missingSongs.map((song) => (
                    <tr key={song.id} className="hover:bg-white/5">
                      <td className="py-3 px-3 font-semibold text-white truncate max-w-[180px]">
                        {song.title}
                      </td>
                      <td className="py-3 px-3 text-slate-400 truncate max-w-[140px]">
                        {song.artist_name || <span className="text-amber-400 font-semibold">Unknown</span>}
                      </td>
                      <td className="py-3 px-3 text-slate-400 truncate max-w-[140px]">
                        {song.album_title || <span className="text-amber-400 font-semibold">Unknown</span>}
                      </td>
                      <td className="py-3 px-3">{song.genre_name || '—'}</td>
                      <td className="py-3 px-3">{song.language_name || '—'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setEditingSong(song)}
                          className="px-3 py-1.5 rounded-lg bg-brand-500 text-white font-bold text-xs shadow-glow-brand hover:scale-105 transition inline-flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit Tags
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DUPLICATE RESOLVER */}
      {activeTab === 'duplicates' && (
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-white">Duplicate Audio Inspector</h3>
            <p className="text-xs text-slate-400">
              Matches audio tracks sharing duplicate metadata or file hashes
            </p>
          </div>

          {duplicates.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">No Duplicate Tracks Found</p>
              <p className="text-xs text-slate-500">Your audio library is completely clean and deduplicated.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicates.map((dup, i) => (
                <div key={i} className="p-4 rounded-2xl bg-dark-900 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{dup.title}</h4>
                      <p className="text-xs text-slate-400">{dup.artist} • {dup.songs.length} copies</p>
                    </div>
                    <button
                      onClick={() => handleResolveDuplicate(dup)}
                      className="px-4 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs shadow-md hover:scale-105 transition"
                    >
                      Keep 1 & Prune Others
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {dup.songs.map((s, idx) => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="font-mono text-[11px] text-slate-400 block truncate">
                          Path: {s.audio_path}
                        </span>
                        <span className="text-slate-300 font-medium">
                          Size: {formatBytes(s.file_size)} • Bitrate: {s.bitrate ? `${Math.round(s.bitrate / 1000)} kbps` : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CATALOG & BULK EDITOR */}
      {activeTab === 'catalog' && (
        <div className="glass-panel p-6 rounded-3xl space-y-5 border border-white/10 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog by title or artist..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white"
              >
                {selectedSongIds.size === allSongs.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Bulk Update Controls Toolbar */}
          {selectedSongIds.size > 0 && (
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex flex-wrap items-center gap-3 animate-in fade-in">
              <span className="text-xs font-bold text-brand-300">
                {selectedSongIds.size} tracks selected:
              </span>

              <select
                value={bulkGenreId}
                onChange={(e) => setBulkGenreId(e.target.value)}
                className="px-3 py-1.5 bg-dark-900 border border-white/15 rounded-xl text-xs text-white"
              >
                <option value="">Set Genre...</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>

              <select
                value={bulkLangId}
                onChange={(e) => setBulkLangId(e.target.value)}
                className="px-3 py-1.5 bg-dark-900 border border-white/15 rounded-xl text-xs text-white"
              >
                <option value="">Set Language...</option>
                {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>

              <select
                value={bulkTypeId}
                onChange={(e) => setBulkTypeId(e.target.value)}
                className="px-3 py-1.5 bg-dark-900 border border-white/15 rounded-xl text-xs text-white"
              >
                <option value="">Set Type...</option>
                {songTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>

              <button
                onClick={handleBulkUpdate}
                className="px-4 py-1.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-glow-brand hover:scale-105 transition"
              >
                Apply Bulk Update
              </button>
            </div>
          )}

          {/* Catalog Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedSongIds.size === allSongs.length && allSongs.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Artist</th>
                  <th className="py-3 px-3">Album</th>
                  <th className="py-3 px-3">Genre</th>
                  <th className="py-3 px-3">Language</th>
                  <th className="py-3 px-3">Plays</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredCatalog.map((song) => {
                  const isSelected = selectedSongIds.has(song.id);
                  return (
                    <tr key={song.id} className={`hover:bg-white/5 ${isSelected ? 'bg-brand-500/10' : ''}`}>
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const next = new Set(selectedSongIds);
                            if (next.has(song.id)) next.delete(song.id);
                            else next.add(song.id);
                            setSelectedSongIds(next);
                          }}
                        />
                      </td>
                      <td className="py-3 px-3 font-semibold text-white truncate max-w-[180px]">
                        {song.title}
                      </td>
                      <td className="py-3 px-3 text-slate-400 truncate max-w-[140px]">
                        {song.artist_name || 'Unknown'}
                      </td>
                      <td className="py-3 px-3 text-slate-400 truncate max-w-[140px]">
                        {song.album_title || 'Single'}
                      </td>
                      <td className="py-3 px-3">{song.genre_name || '—'}</td>
                      <td className="py-3 px-3">{song.language_name || '—'}</td>
                      <td className="py-3 px-3 font-mono">{song.play_count || 0}</td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => setEditingSong(song)}
                          className="p-1.5 text-slate-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM ANALYTICS */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          {/* Top Played Tracks */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" />
              Most Played Tracks
            </h3>
            <div className="space-y-2">
              {stats.topSongs.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-500 w-4">{i + 1}</span>
                    <img
                      src={s.cover_path || '/storage/covers/album_default.svg'}
                      alt={s.title}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">{s.title}</p>
                      <p className="text-[10px] text-slate-400">{s.artist_name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-400">
                    {s.play_count} plays
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Listened Artists */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Top Artists by Audience
            </h3>
            <div className="space-y-2">
              {stats.topArtists.map((a, i) => (
                <div key={a.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-500 w-4">{i + 1}</span>
                    <img
                      src={a.image_path || '/storage/covers/artist_default.svg'}
                      alt={a.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">{a.name}</p>
                      <p className="text-[10px] text-slate-400">{a.song_count} songs</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {(a.monthly_listeners / 1000000).toFixed(1)}M listeners
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportProgressModal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            loadAllData();
          }}
          onReviewRequested={() => {
            setIsImportModalOpen(false);
            setActiveTab('review');
            loadAllData();
          }}
        />
      )}

      {/* Metadata Editor Modal */}
      {editingSong && (
        <MetadataEditorModal
          song={editingSong}
          isOpen={!!editingSong}
          onClose={() => setEditingSong(null)}
          onSaved={() => {
            setEditingSong(null);
            loadAllData();
          }}
        />
      )}
    </div>
  );
}
