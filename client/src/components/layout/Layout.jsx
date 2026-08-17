import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AudioPlayer from '../player/AudioPlayer';
import QueueDrawer from '../player/QueueDrawer';
import FullScreenPlayerModal from '../player/FullScreenPlayerModal';
import { useAudio } from '../../context/AudioContext';

export default function Layout() {
  const { currentSong } = useAudio();

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Background Image with Dark Glassmorphism Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-30 filter brightness-[0.45] saturate-125 scale-105 pointer-events-none"
        style={{ backgroundImage: "url('/bg-horizon.jpg')" }}
      />
      {/* Subtle Atmospheric Gradient Dark Veil */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90 -z-20 pointer-events-none" />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar Menu */}
        <Sidebar />

        {/* Content View */}
        <main className={`flex-1 p-4 sm:p-6 md:p-8 min-w-0 ${currentSong ? 'pb-36' : 'pb-16'}`}>
          <Outlet />
        </main>
      </div>

      {/* Persistent Audio Player */}
      <AudioPlayer />

      {/* Slide-out Queue Panel */}
      <QueueDrawer />

      {/* Fullscreen Player */}
      <FullScreenPlayerModal />
    </div>
  );
}
