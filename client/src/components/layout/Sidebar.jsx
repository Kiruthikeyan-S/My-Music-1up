import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Music,
  Plus,
  Heart,
  Settings,
  X,
  UploadCloud,
  Sparkles
} from 'lucide-react';
import OneUpLogo from '../common/OneUpLogo';
import ImportProgressModal from '../modals/ImportProgressModal';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [showImportModal, setShowImportModal] = useState(false);

  const navLinks = [
    { label: 'All Songs', path: '/', icon: Music },
    { label: 'Liked Songs', path: '/library/liked', icon: Heart },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Dimmed Frosted Backdrop when Menu is Open */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-40 transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Slide-out Drawer Menu (Hidden until Menu clicked) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 sm:w-80 bg-black/90 backdrop-blur-3xl border-r border-amber-500/25 z-50 p-6 flex flex-col justify-between transition-transform duration-300 ease-out shadow-2xl font-serif select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header with 1UP Logo & Close Button */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-black/60 border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_20px_rgba(0,230,0,0.25)] transition-all group"
            >
              <OneUpLogo className="h-8 w-auto group-hover:scale-105 transition-transform" />
              <div>
                <h1 className="text-2xl font-black tracking-wider text-white">1UP</h1>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white transition hover:scale-110"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 pt-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
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

        {/* Bottom Upload Action */}
        <div className="space-y-3 pt-4 border-t border-amber-500/20">
          <button
            onClick={() => {
              setShowImportModal(true);
              onClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-500 text-white font-black text-xs sm:text-sm shadow-glow-brand hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
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
