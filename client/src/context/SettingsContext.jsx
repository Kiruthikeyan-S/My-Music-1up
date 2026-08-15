import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const THEMES = [
  {
    id: 'desert',
    name: 'Cinderwave Desert',
    tagline: 'Warm Golden Sunset & Obsidian Night',
    preview: 'from-amber-500 via-orange-600 to-amber-950',
    primary: '#e5a93c',
    secondary: '#f3c66f',
    accent: '#ff8c00',
    bg: '#070605'
  },
  {
    id: 'siri-neon',
    name: 'Siri Digital Neon',
    tagline: 'Futuristic Glowing Cyan, Violet & Stark White',
    preview: 'from-cyan-400 via-purple-500 to-indigo-950',
    primary: '#ffffff',
    secondary: '#38bdf8',
    accent: '#c084fc',
    bg: '#04060b'
  },
  {
    id: 'emerald-1up',
    name: '1UP Retro Emerald',
    tagline: 'Iconic Pixel Art Green & Cyber Noir',
    preview: 'from-emerald-400 via-teal-600 to-emerald-950',
    primary: '#00e600',
    secondary: '#2dd4bf',
    accent: '#10b981',
    bg: '#030805'
  },
  {
    id: 'crimson-ruby',
    name: 'Crimson Velvet',
    tagline: 'Deep Ruby Glow & Midnight Scarlet',
    preview: 'from-rose-500 via-red-600 to-rose-950',
    primary: '#f43f5e',
    secondary: '#fb7185',
    accent: '#e11d48',
    bg: '#090304'
  }
];

export function SettingsProvider({ children }) {
  // Load settings from localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('1up_theme') || 'desert';
  });

  const [defaultArtMode, setDefaultArtMode] = useState(() => {
    return localStorage.getItem('1up_art_mode') || '3d'; // '3d' | 'circle' | 'float'
  });

  const [visualizerStyle, setVisualizerStyle] = useState(() => {
    return localStorage.getItem('1up_viz_style') || 'siri'; // 'siri' | 'horizon' | 'bars'
  });

  const [aboutInfo, setAboutInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('1up_about');
      return saved ? JSON.parse(saved) : {
        name: 'Kiruthikeyan',
        bio: 'Creator & Lead Developer of 1UP Music Studio.',
        tagline: 'Crafting high-fidelity, ambient music streaming experiences.'
      };
    } catch {
      return {
        name: 'Kiruthikeyan',
        bio: 'Creator & Lead Developer of 1UP Music Studio.',
        tagline: 'Crafting high-fidelity, ambient music streaming experiences.'
      };
    }
  });

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('1up_theme', newTheme);
  };

  const changeArtMode = (mode) => {
    setDefaultArtMode(mode);
    localStorage.setItem('1up_art_mode', mode);
  };

  const changeVisualizerStyle = (style) => {
    setVisualizerStyle(style);
    localStorage.setItem('1up_viz_style', style);
  };

  const updateAbout = (info) => {
    setAboutInfo(info);
    localStorage.setItem('1up_about', JSON.stringify(info));
  };

  const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <SettingsContext.Provider value={{
      theme,
      currentThemeObj,
      changeTheme,
      defaultArtMode,
      changeArtMode,
      visualizerStyle,
      changeVisualizerStyle,
      aboutInfo,
      updateAbout
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
