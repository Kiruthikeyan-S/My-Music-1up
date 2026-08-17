import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Menu,
  Plus
} from 'lucide-react';
import ImportProgressModal from '../modals/ImportProgressModal';
import OneUpLogo from '../common/OneUpLogo';

export default function Navbar({ onOpenMenu }) {
  const [showImportModal, setShowImportModal] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 md:h-20 glass-nav px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Menu Hamburger Button + 1UP Logo */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenMenu}
          className="p-2.5 rounded-2xl bg-black/60 border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-white hover:bg-white/10 transition hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs font-bold font-serif hidden sm:inline">Menu</span>
        </button>

        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="p-1 rounded-2xl bg-black/60 border border-emerald-500/30 group-hover:border-emerald-500/60 shadow-[0_0_20px_rgba(0,230,0,0.25)] transition-all group-hover:scale-105">
            <OneUpLogo className="h-8 md:h-9 w-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white font-serif">
            1UP
          </h1>
        </Link>
      </div>

      {/* Right Controls: Upload Music */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-500 text-white text-xs sm:text-sm font-bold shadow-glow-brand hover:scale-105 active:scale-95 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">Upload Music</span>
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
