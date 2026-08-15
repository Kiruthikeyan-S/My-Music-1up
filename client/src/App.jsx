import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { SettingsProvider } from './context/SettingsContext';

import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Search from './pages/Search';
import ArtistDetail from './pages/ArtistDetail';
import AlbumDetail from './pages/AlbumDetail';
import PlaylistDetail from './pages/PlaylistDetail';
import Library from './pages/Library';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import { Login, Register } from './pages/AuthPages';

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AudioProvider>
          <BrowserRouter>
            <Routes>
              {/* Authenticated Layout with persistent bottom audio player */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="explore" element={<Explore />} />
                <Route path="search" element={<Search />} />
                <Route path="artists/:id" element={<ArtistDetail />} />
                <Route path="albums/:id" element={<AlbumDetail />} />
                <Route path="playlists/:id" element={<PlaylistDetail />} />
                <Route path="library" element={<Library />} />
                <Route path="library/liked" element={<Library />} />
                <Route path="library/recent" element={<Library />} />
                <Route path="settings" element={<Settings />} />
                <Route path="admin" element={<AdminDashboard />} />
              </Route>

              {/* Standalone Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AudioProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
