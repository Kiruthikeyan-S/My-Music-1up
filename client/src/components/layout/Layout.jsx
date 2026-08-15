import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AudioPlayer from '../player/AudioPlayer';
import QueueDrawer from '../player/QueueDrawer';
import FullScreenPlayerModal from '../player/FullScreenPlayerModal';
import { useAudio } from '../../context/AudioContext';

export default function Layout() {
  const { currentSong } = useAudio();

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col overflow-x-hidden">
      {/* Clean Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className={`flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 ${currentSong ? 'pb-32' : 'pb-12'}`}>
        <Outlet />
      </main>

      {/* Persistent Audio Player */}
      <AudioPlayer />

      {/* Slide-out Queue Panel */}
      <QueueDrawer />

      {/* Fullscreen Mobile Player */}
      <FullScreenPlayerModal />
    </div>
  );
}
