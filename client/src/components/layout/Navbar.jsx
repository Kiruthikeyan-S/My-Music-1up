import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UploadCloud,
  Settings,
  Sparkles
} from 'lucide-react';
import ImportProgressModal from '../modals/ImportProgressModal';
import OneUpLogo from '../common/OneUpLogo';

export default function Navbar() {
  const [showImportModal, setShowImportModal] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 h-20 glass-nav px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Brand with 1UP Pixel Art Logo */}
      <Link to="/" className="flex items-center gap-3.5 group flex-shrink-0">
        <div className="p-1 rounded-2xl bg-black/60 border border-emerald-500/30 group-hover:border-emerald-500/60 shadow-[0_0_20px_rgba(0,230,0,0.25)] transition-all group-hover:scale-105">
          <OneUpLogo className="h-10 w-auto" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-white flex items-center gap-2 font-serif">
            1UP
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 tracking-widest uppercase font-mono">
              STUDIO
            </span>
          </h1>
          <p className="text-xs text-amber-200/70 hidden sm:block italic font-serif">Local Music Cloud & Streaming</p>
        </div>
      </Link>

      {/* Right Controls: Settings & Upload Music */}
      <div className="flex items-center gap-3">
        <Link
          to="/settings"
          className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs sm:text-sm font-bold ${
            location.pathname === '/settings'
              ? 'bg-amber-400 text-dark-950 border-amber-400 shadow-glow-brand font-black'
              : 'bg-black/60 border-amber-500/30 text-amber-200 hover:text-white hover:border-amber-400/60'
          }`}
          title="Studio Settings & Themes"
        >
          <Settings className={`w-4 h-4 ${location.pathname === '/settings' ? 'animate-spin-slow' : ''}`} />
          <span className="hidden sm:inline">Settings</span>
        </Link>

        <button
          onClick={() => setShowImportModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-500 text-white text-xs sm:text-sm font-bold shadow-glow-brand hover:scale-105 active:scale-95 transition flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="hidden sm:inline">Upload / Import Music</span>
          <span className="sm:hidden">Upload</span>
        </button>
      </div>

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
