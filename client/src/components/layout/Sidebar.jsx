import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Search,
  Library,
  Heart,
  PlusCircle,
  Clock,
  Shield,
  Radio,
  Music2,
  FolderSync,
  UploadCloud,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { playlistsAPI } from '../../services/api';
import PlaylistModal from '../modals/PlaylistModal';
import ImportProgressModal from '../modals/ImportProgressModal';

export default function Sidebar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    async function loadPlaylists() {
      try {
        const res = await playlistsAPI.getAll();
        setPlaylists(res.data.playlists || []);
      } catch (err) {
        console.error('Failed to load playlists in sidebar:', err);
      }
    }
    loadPlaylists();
  }, [user]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-brand-500 text-white shadow-glow-brand'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <aside className="w-64 bg-dark-900/95 border-r border-white/5 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent p-0.5 shadow-glow-brand group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
              SONORA
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded">
                STUDIO
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Acoustic Cloud & Player</p>
          </div>
        </NavLink>
      </div>

      {/* Main Navigation */}
      <div className="px-4 py-2 space-y-1">
        <NavLink to="/" className={navLinkClass}>
          <Home className="w-4 h-4" />
          Home
        </NavLink>
        <NavLink to="/explore" className={navLinkClass}>
          <Compass className="w-4 h-4" />
          Explore & Genres
        </NavLink>
        <NavLink to="/search" className={navLinkClass}>
          <Search className="w-4 h-4" />
          Search
        </NavLink>
      </div>

      {/* Library Section */}
      <div className="px-4 pt-4 pb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3.5 block mb-2">
          Your Library
        </span>
        <div className="space-y-1">
          <NavLink to="/library" className={navLinkClass}>
            <Library className="w-4 h-4" />
            Library Hub
          </NavLink>
          <NavLink to="/library/liked" className={navLinkClass}>
            <Heart className="w-4 h-4 text-rose-400 fill-rose-500/20" />
            Liked Songs
          </NavLink>
          <NavLink to="/library/recent" className={navLinkClass}>
            <Clock className="w-4 h-4 text-cyan-400" />
            Recently Played
          </NavLink>
        </div>
      </div>

      {/* Upload / Import Music Local Button */}
      <div className="px-4 py-2">
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-600/90 to-brand-500/90 text-white shadow-glow-brand hover:scale-[1.02] active:scale-95 transition"
        >
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-4 h-4" />
            Import / Upload
          </div>
          <HardDrive className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>

      {/* Admin Studio Quick Link */}
      <div className="px-4 py-1">
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isActive
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-amber-400/90 hover:bg-amber-500/10 hover:border-amber-500/30'
            }`
          }
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-400" />
            Admin Studio
          </div>
          <FolderSync className="w-3.5 h-3.5 text-amber-400/70" />
        </NavLink>
      </div>

      {/* Playlists Section */}
      <div className="flex-1 flex flex-col px-4 pt-3 min-h-0">
        <div className="flex items-center justify-between px-3.5 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Playlists
          </span>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="Create Playlist"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Playlists scroll list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {playlists.map((pl) => (
            <NavLink
              key={pl.id}
              to={`/playlists/${pl.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium truncate transition ${
                  isActive
                    ? 'text-white bg-white/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <Music2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="truncate">{pl.title}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Create Playlist Modal */}
      {isCreateModalOpen && (
        <PlaylistModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newPl) => {
            setPlaylists(prev => [newPl, ...prev]);
            setIsCreateModalOpen(false);
            navigate(`/playlists/${newPl.id}`);
          }}
        />
      )}

      {/* Upload / Import Modal */}
      {isUploadModalOpen && (
        <ImportProgressModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </aside>
  );
}
