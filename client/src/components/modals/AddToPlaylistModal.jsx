import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Disc } from 'lucide-react';
import { playlistsAPI } from '../../services/api';

export default function AddToPlaylistModal({ song, isOpen, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState(new Set());

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      try {
        const res = await playlistsAPI.getAll();
        setPlaylists(res.data.playlists || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isOpen]);

  if (!isOpen || !song) return null;

  const handleAdd = async (playlistId) => {
    try {
      await playlistsAPI.addSong(playlistId, song.id);
      setAddedIds(prev => new Set([...prev, playlistId]));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/15">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Disc className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add to Playlist</h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">{song.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1.5 py-2">
          {playlists.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No playlists found. Create one first!</p>
          ) : (
            playlists.map((pl) => {
              const isAdded = addedIds.has(pl.id);
              return (
                <div
                  key={pl.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-white truncate">{pl.title}</p>
                    <p className="text-[10px] text-slate-400">{pl.song_count || 0} songs</p>
                  </div>
                  <button
                    onClick={() => handleAdd(pl.id)}
                    disabled={isAdded}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      isAdded
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-brand-500 text-white hover:scale-105'
                    }`}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {isAdded ? 'Added' : 'Add'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
