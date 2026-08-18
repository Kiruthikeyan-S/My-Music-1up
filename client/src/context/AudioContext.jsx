import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { songsAPI, libraryAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const { user } = useAuth();
  const audioRef = useRef(new Audio());
  
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isFullScreenPlayerOpen, setIsFullScreenPlayerOpen] = useState(false);
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState(null);

  // Sync playback position to server periodically
  const lastSyncRef = useRef(0);
  const audio = audioRef.current;

  // Initialize audio volume
  useEffect(() => {
    audio.volume = volume;
  }, []);

  // Audio Event Listeners
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (!audio.duration || isNaN(audio.duration)) return;
      const current = audio.currentTime;
      setProgress(current);

      // Periodically sync position for "Continue Listening" (every 5 seconds)
      const now = Date.now();
      if (user && currentSong && now - lastSyncRef.current > 5000) {
        lastSyncRef.current = now;
        libraryAPI.savePlaybackPosition(currentSong.id, current).catch(() => {});
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || currentSong?.duration || 0);
      setIsLoadingAudio(false);
    };

    const handleWaiting = () => setIsLoadingAudio(true);
    const handleCanPlay = () => setIsLoadingAudio(false);

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        return;
      }
      // Record play completion
      if (currentSong) {
        songsAPI.recordPlay(currentSong.id, audio.currentTime).catch(() => {});
      }
      nextTrack();
    };

    const handleError = (e) => {
      console.warn('Audio playback notice:', e);
      setIsLoadingAudio(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentSong, queue, queueIndex, repeatMode, isShuffle, user]);

  // Play a song directly (optionally providing a new queue or starting timestamp)
  const playSong = useCallback((song, newQueue = null, index = -1, startTime = 0) => {
    if (!song) return;

    if (newQueue && Array.isArray(newQueue)) {
      setQueue(newQueue);
      const songIdx = index >= 0 ? index : newQueue.findIndex(s => s.id === song.id);
      setQueueIndex(songIdx >= 0 ? songIdx : 0);
    } else if (queue.length === 0) {
      setQueue([song]);
      setQueueIndex(0);
    } else {
      // Check if song already exists in queue
      const existingIdx = queue.findIndex(s => s.id === song.id);
      if (existingIdx >= 0) {
        setQueueIndex(existingIdx);
      } else {
        setQueue(prev => [...prev, song]);
        setQueueIndex(queue.length);
      }
    }

    const likedSet = new Set(JSON.parse(localStorage.getItem('1up_liked_ids') || '[]'));
    const isLiked = likedSet.has(song.id) || Boolean(song.is_liked);
    const hydratedSong = { ...song, is_liked: isLiked };

    setCurrentSong(hydratedSong);
    setIsLoadingAudio(true);
    setAudioError(null);

    let streamUrl = song.audioUrl || song.blobUrl;
    if (!streamUrl && song.fileBlob) {
      streamUrl = URL.createObjectURL(song.fileBlob);
    }
    if (!streamUrl && song.id && !song.is_local) {
      streamUrl = songsAPI.getStreamUrl(song.id);
    }

    audio.src = streamUrl;
    audio.playbackRate = playbackSpeed;

    if (startTime > 0) {
      audio.currentTime = startTime;
      setProgress(startTime);
    } else {
      setProgress(0);
    }

    audio.play().then(() => {
      setIsPlaying(true);
      // Record initial listen
      songsAPI.recordPlay(song.id, 0).catch(() => {});
    }).catch(err => {
      console.warn('Playback autoplay policy or stream delay:', err);
      setIsPlaying(false);
    });
  }, [queue, playbackSpeed]);

  const togglePlay = () => {
    if (!currentSong && queue.length > 0) {
      playSong(queue[0], queue, 0);
      return;
    }
    if (!currentSong) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    }

    if (nextIdx < queue.length) {
      setQueueIndex(nextIdx);
      playSong(queue[nextIdx], queue, nextIdx);
    } else if (repeatMode === 'all') {
      setQueueIndex(0);
      playSong(queue[0], queue, 0);
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  }, [queue, queueIndex, isShuffle, repeatMode, playSong]);

  const prevTrack = () => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      setQueueIndex(prevIdx);
      playSong(queue[prevIdx], queue, prevIdx);
    } else if (repeatMode === 'all') {
      const lastIdx = queue.length - 1;
      setQueueIndex(lastIdx);
      playSong(queue[lastIdx], queue, lastIdx);
    } else {
      audio.currentTime = 0;
      setProgress(0);
    }
  };

  const seek = (time) => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const target = Math.max(0, Math.min(time, audio.duration));
    audio.currentTime = target;
    setProgress(target);
  };

  const setVolume = (val) => {
    const v = Math.max(0, Math.min(1, val));
    setVolumeState(v);
    audio.volume = isMuted ? 0 : v;
    if (v === 0) setIsMuted(true);
    else if (isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audio.volume = volume;
    } else {
      setIsMuted(true);
      audio.volume = 0;
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const cycleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    audio.playbackRate = speed;
  };

  // Queue actions
  const addToQueue = (song) => {
    setQueue(prev => [...prev, song]);
    if (!currentSong) {
      playSong(song, [song], 0);
    }
  };

  const playNext = (song) => {
    if (!currentSong) {
      playSong(song, [song], 0);
      return;
    }
    const newQueue = [...queue];
    newQueue.splice(queueIndex + 1, 0, song);
    setQueue(newQueue);
  };

  const removeFromQueue = (index) => {
    const newQueue = queue.filter((_, i) => i !== index);
    setQueue(newQueue);
    if (index < queueIndex) {
      setQueueIndex(queueIndex - 1);
    } else if (index === queueIndex && newQueue.length > 0) {
      const nextIdx = Math.min(queueIndex, newQueue.length - 1);
      setQueueIndex(nextIdx);
      playSong(newQueue[nextIdx], newQueue, nextIdx);
    } else if (newQueue.length === 0) {
      audio.pause();
      setCurrentSong(null);
      setIsPlaying(false);
    }
  };

  const reorderQueue = (newQueue) => {
    setQueue(newQueue);
    if (currentSong) {
      const newIdx = newQueue.findIndex(s => s.id === currentSong.id);
      setQueueIndex(newIdx >= 0 ? newIdx : 0);
    }
  };

  const clearQueue = () => {
    if (currentSong) {
      setQueue([currentSong]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(-1);
    }
  };

  // Like Song helper (Persistent in LocalStorage + Server)
  const toggleLike = async (songId) => {
    try {
      const likedSet = new Set(JSON.parse(localStorage.getItem('1up_liked_ids') || '[]'));
      const isCurrentlyLiked = likedSet.has(songId) || (currentSong?.id === songId && Boolean(currentSong?.is_liked));
      const nextLiked = !isCurrentlyLiked;

      if (nextLiked) {
        likedSet.add(songId);
      } else {
        likedSet.delete(songId);
      }
      localStorage.setItem('1up_liked_ids', JSON.stringify([...likedSet]));

      // Update current song if matching
      if (currentSong && currentSong.id === songId) {
        setCurrentSong(prev => ({ ...prev, is_liked: nextLiked }));
      }

      // Update queue
      setQueue(prev =>
        prev.map(s => (s.id === songId ? { ...s, is_liked: nextLiked } : s))
      );

      // Sync with server if logged in
      if (user) {
        libraryAPI.toggleLike(songId).catch(() => {});
      }

      return nextLiked;
    } catch (err) {
      console.error('Failed to toggle like:', err);
      return false;
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        isLoadingAudio,
        progress,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        playbackSpeed,
        queue,
        queueIndex,
        isFullScreenPlayerOpen,
        isQueueDrawerOpen,
        playSong,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        changePlaybackSpeed,
        addToQueue,
        playNext,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        toggleLike,
        setIsFullScreenPlayerOpen,
        setIsQueueDrawerOpen
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
