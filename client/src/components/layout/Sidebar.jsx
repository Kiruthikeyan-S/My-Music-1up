import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Music,
  Plus,
  Heart,
  Disc,
  Settings,
  Sparkles,
  Layers,
  Radio
} from 'lucide-react';
import OneUpLogo from '../common/OneUpLogo';
import ImportProgressModal from '../modals/ImportProgressModal';
import ArtworkImage from '../common/ArtworkImage';
import { songsAPI } from '../../services/api';
import { getLocalSongs } from '../../utils/indexedDbStorage';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showImportModal, setShowImportModal] = useState(false);
  const [sidebarArtists, setSidebarArtists] = useState([]);

  // Load dynamic artists/albums from songs & IndexedDB
  useEffect(() => {
    async function loadArtists() {
      try {
        let serverSongs = [];
        try {
          const res = await songsAPI.getAll({ limit: 100 });
          serverSongs = res.data.songs || [];
        } catch {}

        const localSongs = await getLocalSongs();
        const allSongs = [...localSongs, ...serverSongs];

        const artistMap = {};
        allSongs.forEach(s => {
          const name = s.artist_name || 'Various Artists';
          if (!artistMap[name]) {
            artistMap[name] = {
              name,
              image: s.cover_path || s.album_cover,
              song: s
            };
          }
        });

        // Demo fallback avatars if library is small
        const defaultAvatars = [
          { name: 'Taylor Swift', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
          { name: 'The Weeknd', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
          { name: 'A.R. Rahman', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
          { name: 'Lana Del Rey', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' }
        ];

        const uniqueArtists = Object.values(artistMap);
        if (uniqueArtists.length < 3) {
          defaultAvatars.forEach(d => {
            if (!uniqueArtists.some(u => u.name === d.name)) {
              uniqueArtists.push(d);
            }
          });
        }

        setSidebarArtists(uniqueArtists.slice(0, 10));
      } catch (err) {
        console.error('Sidebar artist load error:', err);
      }
    }

    loadArtists();
  }, []);

  return (
    <>
      {/* Spotify-Style Vertical Compact Dock Menu */}
      <aside className="w-18 md:w-20 h-screen sticky top-0 flex-shrink-0 hidden md:flex flex-col items-center py-4 px-2 bg-[#09090b]/85 backdrop-blur-2xl border-r border-amber-500/20 z-30 font-serif select-none">
        {/* Top: 1UP Logo */}
        <Link
          to="/"
          className="p-2 rounded-2xl bg-black/60 border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_20px_rgba(0,230,0,0.25)] transition-all hover:scale-105 mb-4 group"
          title="1UP Music Home"
        >
          <OneUpLogo className="h-7 w-auto" />
        </Link>

        {/* Action Button: '+' Upload / Add Music */}
        <button
          onClick={() => setShowImportModal(true)}
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-amber-400 hover:text-dark-950 text-amber-200 border border-white/10 hover:border-amber-400 shadow-md hover:scale-110 active:scale-95 transition flex items-center justify-center mb-3 group relative"
          title="Add / Upload Music (+)"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
          {/* Tooltip */}
          <span className="absolute left-16 bg-dark-950 text-amber-200 text-xs font-bold px-2.5 py-1 rounded-xl border border-amber-500/30 shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
            Upload Music
          </span>
        </button>

        {/* Primary Navigation Icons (All Songs, Liked, Albums, Settings) */}
        <div className="space-y-2 mb-3 pb-3 border-b border-white/10 w-full flex flex-col items-center">
          {/* All Songs */}
          <Link
            to="/"
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative ${
              location.pathname === '/'
                ? 'bg-amber-400 text-dark-950 shadow-glow-brand font-black'
                : 'bg-black/40 text-amber-200 hover:text-white hover:bg-white/15 border border-white/10'
            }`}
            title="All Songs Library"
          >
            <Music className="w-5 h-5" />
            <span className="absolute left-16 bg-dark-950 text-amber-200 text-xs font-bold px-2.5 py-1 rounded-xl border border-amber-500/30 shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
              All Songs
            </span>
          </Link>

          {/* Liked Songs */}
          <Link
            to="/library/liked"
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative ${
              location.pathname === '/library/liked'
                ? 'bg-rose-500 text-white shadow-glow-rose font-black'
                : 'bg-black/40 text-rose-400 hover:text-rose-300 hover:bg-white/15 border border-white/10'
            }`}
            title="Liked Songs"
          >
            <Heart className="w-5 h-5" />
            <span className="absolute left-16 bg-dark-950 text-rose-200 text-xs font-bold px-2.5 py-1 rounded-xl border border-rose-500/30 shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
              Liked Songs
            </span>
          </Link>

          {/* Albums & Explore */}
          <Link
            to="/explore"
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative ${
              location.pathname === '/explore'
                ? 'bg-cyan-500 text-dark-950 shadow-glow-cyan font-black'
                : 'bg-black/40 text-cyan-400 hover:text-cyan-300 hover:bg-white/15 border border-white/10'
            }`}
            title="Albums & Vault"
          >
            <Disc className="w-5 h-5" />
            <span className="absolute left-16 bg-dark-950 text-cyan-200 text-xs font-bold px-2.5 py-1 rounded-xl border border-cyan-500/30 shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
              Albums & Vault
            </span>
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative ${
              location.pathname === '/settings'
                ? 'bg-amber-400 text-dark-950 shadow-glow-brand font-black'
                : 'bg-black/40 text-amber-300 hover:text-white hover:bg-white/15 border border-white/10'
            }`}
            title="Studio Settings"
          >
            <Settings className={`w-5 h-5 ${location.pathname === '/settings' ? 'animate-spin-slow' : ''}`} />
            <span className="absolute left-16 bg-dark-950 text-amber-200 text-xs font-bold px-2.5 py-1 rounded-xl border border-amber-500/30 shadow-xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
              Settings & Themes
            </span>
          </Link>
        </div>

        {/* Scrollable List of Circular Artist Avatars & Album Art */}
        <div className="flex-1 w-full overflow-y-auto space-y-3 py-1 flex flex-col items-center scrollbar-none">
          {sidebarArtists.map((artist, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/?search=${encodeURIComponent(artist.name)}`)}
              className="cursor-pointer group relative flex items-center justify-center"
              title={artist.name}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/15 group-hover:border-amber-400 group-hover:scale-110 transition-all shadow-md bg-black/60">
                <ArtworkImage
                  src={artist.image}
                  alt={artist.name}
                  fallbackTitle={artist.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Floating Tooltip with Artist Name */}
              <span className="absolute left-16 bg-dark-950 text-white text-xs font-bold px-2.5 py-1 rounded-xl border border-white/15 shadow-2xl opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                {artist.name}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Upload Modal */}
      {showImportModal && (
        <ImportProgressModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
