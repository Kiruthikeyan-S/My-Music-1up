import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Layers,
  Box,
  Disc,
  Activity,
  User,
  Sparkles,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Plus
} from 'lucide-react';
import { useSettings, THEMES, PRESET_WALLPAPERS } from '../context/SettingsContext';
import OneUpLogo from '../components/common/OneUpLogo';
import SiriWaveCanvas from '../components/player/SiriWaveCanvas';

export default function Settings() {
  const {
    theme,
    currentThemeObj,
    changeTheme,
    wallpaper,
    changeWallpaper,
    defaultArtMode,
    changeArtMode,
    visualizerStyle,
    changeVisualizerStyle,
    aboutInfo,
    updateAbout
  } = useSettings();

  const [formData, setFormData] = useState({ ...aboutInfo });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleSaveAbout = (e) => {
    e.preventDefault();
    updateAbout(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUploadCustomWallpaper = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      changeWallpaper(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-28 font-serif">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="p-3 rounded-2xl bg-black/60 border border-emerald-500/40 shadow-glow-brand animate-float flex-shrink-0">
            <OneUpLogo className="h-10 w-auto" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide flex items-center gap-3">
              Studio Settings & Profile
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/70 mt-1 italic">
              Customize your aesthetic themes, cosmic background wallpapers, player 3D styles, and profile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-xs text-amber-300 font-mono">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>1UP Studio v2.5</span>
        </div>
      </div>

      {/* 1. WALLPAPER SELECTION & CUSTOM UPLOAD */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white tracking-wide">Atmospheric Background Wallpaper</h3>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Custom Wallpaper</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadCustomWallpaper}
          />
        </div>
        <p className="text-xs text-slate-400 italic">Choose from atmospheric cosmic presets or upload your own wallpaper image.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {PRESET_WALLPAPERS.map((w) => {
            const isSelected = wallpaper === w.url;
            return (
              <div
                key={w.id}
                onClick={() => changeWallpaper(w.url)}
                className={`cursor-pointer rounded-2xl p-3 border transition-all duration-300 relative overflow-hidden group ${
                  isSelected
                    ? 'border-amber-400 bg-black/80 shadow-[0_0_30px_rgba(229,169,60,0.35)] scale-[1.02]'
                    : 'border-white/10 bg-black/40 hover:border-white/30 hover:bg-black/60'
                }`}
              >
                <div className="h-28 rounded-xl overflow-hidden mb-3 relative shadow-md bg-black">
                  <img
                    src={w.preview}
                    alt={w.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-dark-950 flex items-center justify-center font-black shadow-lg">
                        <CheckCircle2 className="w-5 h-5 text-dark-950" />
                      </div>
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-bold text-white flex items-center justify-between">
                  <span className="truncate pr-1">{w.name}</span>
                  {isSelected && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-400 text-dark-950 font-black">
                      ACTIVE
                    </span>
                  )}
                </h4>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. THEME SELECTION */}
      <section className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white tracking-wide">Aesthetic Theme Palette</h3>
        </div>
        <p className="text-xs text-slate-400 italic">Select your preferred color mood for ambient player auras, waveforms, and borders.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {THEMES.map((t) => {
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => changeTheme(t.id)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden group ${
                  isSelected
                    ? 'border-amber-400 bg-black/80 shadow-[0_0_30px_rgba(229,169,60,0.35)] scale-[1.02]'
                    : 'border-white/10 bg-black/40 hover:border-white/30 hover:bg-black/60'
                }`}
              >
                <div className={`h-16 rounded-xl bg-gradient-to-tr ${t.preview} mb-4 shadow-md flex items-center justify-center`}>
                  {isSelected && (
                    <div className="w-7 h-7 rounded-full bg-dark-950/80 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    </div>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>{t.name}</span>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400 text-dark-950 font-black">
                      ACTIVE
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-1 italic leading-relaxed">{t.tagline}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. PLAYER ARTWORK 3D / VINYL / FLOATING PRESENTATION */}
      <section className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-bold text-white tracking-wide">Default Player Artwork Mode</h3>
        </div>
        <p className="text-xs text-slate-400 italic">Choose how song album covers are rendered in the full-screen player.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* 3D Hologram Mode */}
          <div
            onClick={() => changeArtMode('3d')}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative ${
              defaultArtMode === '3d'
                ? 'border-cyan-400 bg-black/80 shadow-[0_0_30px_rgba(6,182,212,0.35)] scale-[1.02]'
                : 'border-white/10 bg-black/40 hover:border-white/30'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mb-3">
              <Box className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>3D Hologram Tilt</span>
              {defaultArtMode === '3d' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
            </h4>
            <p className="text-xs text-slate-400 mt-1 italic">3D holographic perspective card with floating elevation & depth.</p>
          </div>

          {/* Circular Vinyl Mode */}
          <div
            onClick={() => changeArtMode('circle')}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative ${
              defaultArtMode === 'circle'
                ? 'border-amber-400 bg-black/80 shadow-[0_0_30px_rgba(245,158,11,0.35)] scale-[1.02]'
                : 'border-white/10 bg-black/40 hover:border-white/30'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mb-3">
              <Disc className="w-6 h-6 animate-spin-slow" />
            </div>
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Spinning Vinyl Circle</span>
              {defaultArtMode === 'circle' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
            </h4>
            <p className="text-xs text-slate-400 mt-1 italic">Realistic rotating vinyl record with center groove label.</p>
          </div>

          {/* Floating Glass Card Mode */}
          <div
            onClick={() => changeArtMode('float')}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative ${
              defaultArtMode === 'float'
                ? 'border-purple-400 bg-black/80 shadow-[0_0_30px_rgba(168,85,247,0.35)] scale-[1.02]'
                : 'border-white/10 bg-black/40 hover:border-white/30'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center mb-3">
              <Layers className="w-6 h-6 animate-float" />
            </div>
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Floating Glass Card</span>
              {defaultArtMode === 'float' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
            </h4>
            <p className="text-xs text-slate-400 mt-1 italic">Smooth rounded glass card with ambient backdrop reflection.</p>
          </div>
        </div>
      </section>

      {/* 4. SIRI-STYLE DIGITAL ASSISTANT WAVEFORM VISUALIZER */}
      <section className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold text-white tracking-wide">Siri-Style Glowing Sine Wave Visualizer</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => changeVisualizerStyle('siri')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                visualizerStyle === 'siri' ? 'bg-white text-dark-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Siri Neon Wave
            </button>
            <button
              onClick={() => changeVisualizerStyle('horizon')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                visualizerStyle === 'horizon' ? 'bg-white text-dark-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Horizon Bars
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400 italic">
          Clean UI / Digital Assistant Waveform: Minimalist futuristic glowing white intertwined neon curves with neon bloom and symmetrical oscillating sine wave trails.
        </p>

        {/* Live Visualizer Preview Stage */}
        <div className="h-28 rounded-3xl bg-black/90 border border-white/15 p-3 flex items-center justify-center shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
          <SiriWaveCanvas
            isPlaying={true}
            primaryColor={currentThemeObj.primary}
            secondaryColor={currentThemeObj.secondary}
            accentColor={currentThemeObj.accent}
            height={85}
          />
        </div>
      </section>

      {/* 5. ABOUT ME PROFILE SECTION */}
      <section className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <User className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white tracking-wide">About Me (Creator Profile)</h3>
        </div>
        <p className="text-xs text-slate-400 italic">Manage your personalized bio and creator credentials shown across 1UP Music Studio.</p>

        <form onSubmit={handleSaveAbout} className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 space-y-6 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-amber-200/80 font-bold mb-2 font-mono">
                Creator / Artist Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400 font-serif"
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-amber-200/80 font-bold mb-2 font-mono">
                Tagline / Role
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400 font-serif"
                placeholder="e.g. Lead Sound Architect"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-amber-200/80 font-bold mb-2 font-mono">
              Biography & Vision
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400 font-serif"
              placeholder="Tell your listeners about yourself..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                Profile changes saved!
              </span>
            ) : <div />}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-dark-950 font-black text-xs sm:text-sm shadow-glow-brand hover:scale-105 active:scale-95 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
