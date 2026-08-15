import React, { useState, useEffect } from 'react';
import { X, Edit3, Check, Disc, User, Music, Tag, Globe } from 'lucide-react';
import { adminAPI, categoriesAPI } from '../../services/api';

export default function MetadataEditorModal({ song, isOpen, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    artist_name: '',
    album_title: '',
    genre_id: '',
    language_id: '',
    song_type_id: '',
    release_year: '',
    track_number: '',
    is_public: 1
  });

  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [songTypes, setSongTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCategories() {
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
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title || '',
        artist_name: song.artist_name || '',
        album_title: song.album_title || '',
        genre_id: song.genre_id || '',
        language_id: song.language_id || '',
        song_type_id: song.song_type_id || '',
        release_year: song.release_year || new Date().getFullYear(),
        track_number: song.track_number || 1,
        is_public: song.is_public !== undefined ? song.is_public : 1
      });
    }
  }, [song]);

  if (!isOpen || !song) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await adminAPI.updateMetadata(song.id, formData);
      if (onSaved) onSaved(res.data.song);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update metadata');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 my-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Edit Song Metadata</h3>
              <p className="text-xs text-slate-400">Review & calibrate audio tags</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-brand-400" />
              Song Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-sm text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Artist Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Artist Name
              </label>
              <input
                type="text"
                required
                value={formData.artist_name}
                onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Album Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-purple-400" />
                Album Title
              </label>
              <input
                type="text"
                required
                value={formData.album_title}
                onChange={(e) => setFormData({ ...formData, album_title: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Genre */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                Genre
              </label>
              <select
                value={formData.genre_id}
                onChange={(e) => setFormData({ ...formData, genre_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select Genre</option>
                {genres.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Language
              </label>
              <select
                value={formData.language_id}
                onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select Language</option>
                {languages.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Song Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category / Type
              </label>
              <select
                value={formData.song_type_id}
                onChange={(e) => setFormData({ ...formData, song_type_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select Type</option>
                {songTypes.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Release Year */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Release Year
              </label>
              <input
                type="number"
                value={formData.release_year}
                onChange={(e) => setFormData({ ...formData, release_year: parseInt(e.target.value) || '' })}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-xl text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Track Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Track Number
              </label>
              <input
                type="number"
                value={formData.track_number}
                onChange={(e) => setFormData({ ...formData, track_number: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-xl text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-brand-500 rounded-xl shadow-glow-brand hover:scale-105 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
