import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Music,
  Heart,
  Disc,
  User,
  Settings,
  UploadCloud,
  Sparkles,
  Radio,
  FolderPlus
} from 'lucide-react';
import OneUpLogo from '../common/OneUpLogo';
import ImportProgressModal from '../modals/ImportProgressModal';

export default function Sidebar() {
  const location = useLocation();
  const [showImportModal, setShowImportModal] = useState(false);

  const navLinks = [
    { label: 'All Songs', path: '/', icon: Music },
    { label: 'Liked Songs', path: '/library/liked', icon: Heart },
    { label: 'Albums & Vault', path: '/explore', icon: Disc },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <>
      <aside className="w-64 h-screen sticky top-0 flex-shrink-0 hidden md:flex flex-col justify-between p-4 bg-black/65 backdrop-blur-2xl border-r border-amber-500/20 z-30 font-serif">
        {/* Top Brand */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3.5 px-3 py-2 rounded-2xl bg-black/40 border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_20px_rgba(0,230,0,0.2)] transition-all group">
            <OneUpLogo className="h-9 w-auto group-hover:scale-105 transition-transform" />
            <div>
              <h1 className="text-2xl font-black tracking-wider text-white">1UP</h1>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1.5 pt-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-dark-950 shadow-glow-brand font-black'
                      : 'text-amber-100/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-dark-950' : 'text-amber-300'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Upload / Quick Action */}
        <div className="space-y-3 pt-4 border-t border-amber-500/20">
          <button
            onClick={() => setShowImportModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-500 text-white font-black text-xs sm:text-sm shadow-glow-brand hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Music</span>
          </button>
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
