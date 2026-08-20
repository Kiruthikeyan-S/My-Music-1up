import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles, Volume2 } from 'lucide-react';
import ArtworkImage from './ArtworkImage';

export default function SongDeckCarousel({ songs, currentSong, isPlaying, onSelectSong, onTogglePlay }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollAutoplay, setScrollAutoplay] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Synchronize activeIndex when currentSong changes
  useEffect(() => {
    if (currentSong && songs.length > 0) {
      const idx = songs.findIndex(s => s.id === currentSong.id);
      if (idx !== -1 && idx !== activeIndex) {
        setActiveIndex(idx);
      }
    }
  }, [currentSong, songs]);

  if (!songs || songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-serif">
        <Sparkles className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
        <p className="text-lg font-bold text-white">No tracks in SONG//DECK</p>
        <p className="text-xs text-slate-400 mt-1">Upload audio files to populate your deck.</p>
      </div>
    );
  }

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % songs.length;
    setActiveIndex(nextIdx);
    if (scrollAutoplay && onSelectSong) {
      onSelectSong(songs[nextIdx]);
    }
  };

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + songs.length) % songs.length;
    setActiveIndex(prevIdx);
    if (scrollAutoplay && onSelectSong) {
      onSelectSong(songs[prevIdx]);
    }
  };

  const handleCardClick = (index) => {
    setActiveIndex(index);
    const targetSong = songs[index];
    if (onSelectSong) {
      if (currentSong?.id === targetSong.id) {
        onTogglePlay();
      } else {
        onSelectSong(targetSong);
      }
    }
  };

  // Keyboard Navigation (Left / Right Arrows)
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  return (
    <div
      className="relative w-full max-w-7xl mx-auto py-6 sm:py-10 flex flex-col items-center select-none outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95 transition"
        title="Previous Card (←)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95 transition"
        title="Next Card (→)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 3D Cover Flow Deck Stage */}
      <div className="relative w-full h-[460px] sm:h-[520px] flex items-center justify-center overflow-hidden">
        {songs.map((song, index) => {
          let offset = index - activeIndex;

          // Wrap around calculations for smooth infinite loop display
          if (offset > Math.floor(songs.length / 2)) {
            offset -= songs.length;
          } else if (offset < -Math.floor(songs.length / 2)) {
            offset += songs.length;
          }

          const isActive = offset === 0;
          const isCurrentPlaying = currentSong?.id === song.id && isPlaying;
          const absOffset = Math.abs(offset);

          // Hide cards that are too far away
          if (absOffset > 2 && songs.length > 5) {
            return null;
          }

          // Dynamic 3D transform & style calculations
          let translateX = offset * 260; // horizontal spacing
          let scale = 1 - absOffset * 0.12;
          let opacity = 1 - absOffset * 0.35;
          let zIndex = 30 - absOffset * 10;
          let rotateY = offset * -15; // 3D rotation angle

          if (window.innerWidth < 640) {
            translateX = offset * 180;
            scale = 1 - absOffset * 0.15;
          }

          return (
            <div
              key={song.id || index}
              onClick={() => handleCardClick(index)}
              className="absolute cursor-pointer transition-all duration-500 ease-out flex flex-col items-center"
              style={{
                transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                opacity: opacity,
                zIndex: zIndex,
                perspective: '1000px'
              }}
            >
              {/* Card Container */}
              <div
                className={`relative w-[280px] sm:w-[340px] md:w-[380px] h-[360px] sm:h-[430px] rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border transition-all duration-500 group ${
                  isActive
                    ? 'border-emerald-500/40 ring-4 ring-emerald-500/20 shadow-[0_0_50px_rgba(30,215,96,0.3)]'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Full Card Cover Image */}
                <ArtworkImage
                  src={song.cover_path || song.album_cover}
                  alt={song.title}
                  fallbackTitle={song.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark Gradient Overlay at Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                {/* Song Meta Text Overlay at Bottom Left */}
                <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between z-20">
                  <div className="min-w-0 pr-3">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest font-mono truncate">
                      {song.artist_name || 'Unknown Artist'}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate mt-0.5 font-sans">
                      {song.title}
                    </h3>
                  </div>

                  {/* Spotify Green Circular Play Button (Active Card Only) */}
                  {isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentSong?.id === song.id) {
                          onTogglePlay();
                        } else {
                          onSelectSong(song);
                        }
                      }}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1ed760] text-black shadow-[0_10px_25px_rgba(30,215,96,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all flex-shrink-0"
                      title={isCurrentPlaying ? 'Pause' : 'Play'}
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-black" />
                      ) : (
                        <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-black ml-1" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Control Pill: Scroll Autoplay Toggle */}
      <div className="mt-4 z-40">
        <button
          onClick={() => setScrollAutoplay(prev => !prev)}
          className="px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white text-xs font-mono font-bold hover:bg-black transition flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${scrollAutoplay ? 'bg-[#1ed760] animate-pulse' : 'bg-slate-500'}`} />
          <span>Enable scroll autoplay</span>
          <span className="text-[10px] text-slate-400 font-normal">one time only</span>
        </button>
      </div>
    </div>
  );
}
