import React, { useState, useEffect } from 'react';
import { Type, Check, Sparkles } from 'lucide-react';

const FONTS = [
  { id: 'font-plus-jakarta', name: 'Plus Jakarta Sans', category: 'Modern & Clean' },
  { id: 'font-outfit', name: 'Outfit', category: 'Geometric & Trendy' },
  { id: 'font-syne', name: 'Syne', category: 'Editorial & Bold' },
  { id: 'font-space-grotesk', name: 'Space Grotesk', category: 'Tech & Futuristic' },
  { id: 'font-sora', name: 'Sora', category: 'Aesthetic & Round' },
  { id: 'font-cinzel', name: 'Cinzel', category: 'Luxury & Classical' },
  { id: 'font-inter', name: 'Inter', category: 'Minimalist Standard' }
];

export default function FontCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState(
    localStorage.getItem('sonora_font') || 'font-plus-jakarta'
  );

  useEffect(() => {
    // Remove all old font classes and apply the selected one
    FONTS.forEach(f => document.body.classList.remove(f.id));
    document.body.classList.add(selectedFont);
    localStorage.setItem('sonora_font', selectedFont);
  }, [selectedFont]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5 shadow-sm"
        title="Customize Font Family"
      >
        <Type className="w-3.5 h-3.5 text-brand-400" />
        <span className="hidden sm:inline">Font: {FONTS.find(f => f.id === selectedFont)?.name}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-2 z-50 shadow-2xl border border-white/15 animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Customize Typography
              </span>
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {FONTS.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFont(f.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition ${
                    selectedFont === f.id
                      ? 'bg-brand-500 text-white shadow-glow-brand'
                      : 'hover:bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  <div>
                    <p className={`text-xs font-bold ${f.id}`}>{f.name}</p>
                    <p className="text-[10px] opacity-70">{f.category}</p>
                  </div>
                  {selectedFont === f.id && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
