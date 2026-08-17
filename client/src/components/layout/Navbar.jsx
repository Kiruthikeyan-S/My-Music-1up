import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UploadCloud,
  Settings,
  Music,
  Heart,
  Disc,
  Menu,
  X
} from 'lucide-react';
import ImportProgressModal from '../modals/ImportProgressModal';
import OneUpLogo from '../common/OneUpLogo';

export default function Navbar() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 h-16 md:h-20 glass-nav px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Brand with 1UP Pixel Art Logo - Clean (No studio/cloud subtitle) */}
      <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
        <div className="p-1 rounded-2xl bg-black/60 border border-emerald-500/30 group-hover:border-emerald-500/60 shadow-[0_0_20px_rgba(0,230,0,0.25)] transition-all group-hover:scale-105">
          <OneUpLogo className="h-8 md:h-10 w-auto" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white font-serif">
            1UP
          </h1>
        </div>
      </Link>

      {/* Right Controls: Settings & Upload Music */}
      <div className="flex items-center gap-3">
        <Link
          to="/settings"
          className={`p-2 sm:px-4 sm:py-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs sm:text-sm font-bold ${
            location.pathname === '/settings'
              ? 'bg-amber-400 text-dark-950 border-amber-400 shadow-glow-brand font-black'
              : 'bg-black/60 border-amber-500/30 text-amber-200 hover:text-white hover:border-amber-400/60'
          }`}
          title="Settings"
        >
          <Settings className={`w-4 h-4 ${location.pathname === '/settings' ? 'animate-spin-slow' : ''}`} />
          <span className="hidden sm:inline">Settings</span>
        </Link>

        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-500 text-white text-xs sm:text-sm font-bold shadow-glow-brand hover:scale-105 active:scale-95 transition flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Music</span>
          <span className="sm:hidden">Upload</span>
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="md:hidden p-2 rounded-xl bg-black/60 border border-white/10 text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 inset-x-0 bg-black/95 backdrop-blur-2xl border-b border-amber-500/30 p-4 space-y-2 z-40 animate-in slide-in-from-top duration-200 font-serif">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-100 hover:bg-white/10"
          >
            <Music className="w-4 h-4 text-amber-400" />
            <span>All Songs</span>
          </Link>
          <Link
            to="/library/liked"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-100 hover:bg-white/10"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Liked Songs</span>
          </Link>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-100 hover:bg-white/10"
          >
            <Disc className="w-4 h-4 text-cyan-400" />
            <span>Albums & Vault</span>
          </Link>
          <Link
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-100 hover:bg-white/10"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Settings</span>
          </Link>
        </div>
      )}

      {/* Upload / Import Modal */}
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
    </header>
  );
}
