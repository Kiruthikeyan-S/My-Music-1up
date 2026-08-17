import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Shuffle,
  Clock,
  Disc,
  User,
  Heart,
  Calendar,
  Share2,
  ChevronLeft
} from 'lucide-react';
import { albumsAPI, songsAPI } from '../services/api';
import { getLocalSongs } from '../utils/indexedDbStorage';
import { useAudio } from '../context/AudioContext';
import ArtworkImage from '../components/common/ArtworkImage';

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlbumData() {
      setLoading(true);
      try {
        let matchedSongs = [];
        let albumMeta = null;

        // 1. Try server API
        try {
          const res = await albumsAPI.getById(id);
          if (res.data && res.data.album) {
            albumMeta = res.data.album;
            matchedSongs = res.data.songs || [];
          }
        } catch {}

        // 2. Also check local songs / IndexedDB
        const localSongs = await getLocalSongs();
        const decodedId = decodeURIComponent(id).toLowerCase();

        const localMatches = localSongs.filter(s =>
          (s.album_title && s.album_title.toLowerCase() === decodedId) ||
          (s.album_id && String(s.album_id) === String(id))
        );

        if (localMatches.length > 0) {
          matchedSongs = [...localMatches, ...matchedSongs];
          if (!albumMeta) {
            albumMeta = {
              id: id,
              title: localMatches[0].album_title || 'Album Collection',
              artist_name: localMatches[0].artist_name || 'Various Artists',
              cover_path: localMatches[0].cover_path || localMatches[0].album_cover,
              release_year: 2024
            };
          }
        }

        // 3. Fallback demo data if Ambikapathy demo is clicked
        if (!albumMeta && (decodedId.includes('ambikapathy') || decodedId.includes('rahman'))) {
          albumMeta = {
            id: id,
            title: 'Ambikapathy (Original Motion Picture Soundtrack)',
            artist_name: 'A.R. Rahman',
            release_year: 2013,
            cover_path: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'
          };
          matchedSongs = [
            { id: 'amb-1', title: 'Ambikapathy', artist_name: 'A.R. Rahman, Naresh Iyer, Vairamuthu', duration: 255, plays: '39,964,937' },
            { id: 'amb-2', title: 'Kalaarasiga', artist_name: 'A.R. Rahman, Shweta Mohan', duration: 290, plays: '3,258,958' },
            { id: 'amb-3', title: 'Oliyaaga Vandhaai', artist_name: 'A.R. Rahman, Javed Ali, KMMC Sufi Ensemble', duration: 356, plays: '1,831,660' },
            { id: 'amb-4', title: 'Kanaave Kanaave', artist_name: 'A.R. Rahman, Madhushree, Vaishali, Chinmayi', duration: 246, plays: '1,065,748' },
            { id: 'amb-5', title: 'Parakka Seivaai', artist_name: 'A.R. Rahman, Karthik, Mili Nair', duration: 234, plays: '873,241' },
            { id: 'amb-6', title: 'Solvadhai Seidhu Mudippom', artist_name: 'A.R. Rahman, Mohammed Rafi', duration: 266, plays: '292,693' },
            { id: 'amb-7', title: 'Paarkaadhey Oru Madhiri', artist_name: 'A.R. Rahman', duration: 258, plays: '2,376,608' }
          ];
        }

        setAlbum(albumMeta);
        setSongs(matchedSongs);
      } catch (err) {
        console.error('Failed to load album:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAlbumData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse font-serif">
        <div className="h-64 rounded-3xl bg-black/60 border border-white/10" />
        <div className="h-96 rounded-3xl bg-black/60 border border-white/10" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="p-12 text-center text-slate-400 font-serif">
        <Disc className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-spin-slow" />
        <h2 className="text-2xl font-bold text-white">Album not found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-5 py-2 rounded-2xl bg-amber-400 text-dark-950 font-bold text-xs"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const formatTotalTime = (sec) => {
    if (!sec) return '38 min';
    const m = Math.floor(sec / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h} hr ${m % 60} min`;
    return `${m} min`;
  };

  const totalDuration = songs.reduce((sum, s) => sum + (s.duration || 0), 0);

  const isCurrentAlbumPlaying = isPlaying && songs.some(s => s.id === currentSong?.id);

  const handlePlayAlbum = (shuffle = false) => {
    if (songs.length === 0) return;
    if (isCurrentAlbumPlaying && !shuffle) {
      togglePlay();
      return;
    }
    if (shuffle) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled, 0);
    } else {
      playSong(songs[0], songs, 0);
    }
  };

  const formatSec = (sec) => {
    if (!sec) return '4:15';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 font-serif select-none">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-amber-200 hover:text-white px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 w-fit transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Spotify Hero Banner matching screenshot */}
      <div className="rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-b from-[#6e2b23]/90 via-[#2a1310]/95 to-black/90 border border-amber-500/30 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 relative z-10">
          {/* Square Album Cover */}
          <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden flex-shrink-0 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20 bg-black">
            <ArtworkImage
              src={album.cover_path}
              alt={album.title}
              fallbackTitle={album.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Album Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-300 block mb-1">
              Album
            </span>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {album.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4 text-xs sm:text-sm text-slate-200">
              <span className="font-bold text-white hover:text-amber-300 transition">
                {album.artist_name || 'Various Artists'}
              </span>
              <span>•</span>
              <span className="text-slate-300">{album.release_year || '2024'}</span>
              <span>•</span>
              <span className="text-slate-300">{songs.length} songs,</span>
              <span className="text-slate-300">{formatTotalTime(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls Bar (Spotify green play button, shuffle, etc.) */}
      <div className="flex items-center gap-5 px-2">
        <button
          onClick={() => handlePlayAlbum(false)}
          className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#22e668] text-dark-950 flex items-center justify-center shadow-glow-brand hover:scale-105 active:scale-95 transition"
          title={isCurrentAlbumPlaying ? 'Pause' : 'Play Album'}
        >
          {isCurrentAlbumPlaying ? (
            <Pause className="w-7 h-7 fill-dark-950" />
          ) : (
            <Play className="w-7 h-7 fill-dark-950 ml-1" />
          )}
        </button>

        <button
          onClick={() => handlePlayAlbum(true)}
          className="p-3 rounded-full bg-black/60 border border-white/15 text-slate-300 hover:text-white hover:scale-110 transition"
          title="Shuffle Play"
        >
          <Shuffle className="w-6 h-6" />
        </button>
      </div>

      {/* Tracklist Table */}
      <div className="glass-card rounded-3xl border border-white/15 p-4 overflow-hidden shadow-2xl">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 sm:col-span-7">Title</div>
          <div className="col-span-3 sm:col-span-3 text-right">Plays / Genre</div>
          <div className="col-span-2 sm:col-span-1 text-right flex justify-end">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/5 mt-1">
          {songs.map((s, idx) => {
            const isThisPlaying = currentSong?.id === s.id && isPlaying;
            return (
              <div
                key={s.id || idx}
                onClick={() => playSong(s, songs, idx)}
                className={`grid grid-cols-12 gap-4 px-4 py-3.5 items-center rounded-2xl cursor-pointer transition ${
                  isThisPlaying
                    ? 'bg-amber-400/20 text-amber-300 font-bold'
                    : 'hover:bg-white/10 text-slate-200'
                }`}
              >
                {/* Index / Playing icon */}
                <div className="col-span-1 text-center text-xs font-mono text-slate-400">
                  {isThisPlaying ? (
                    <div className="w-3.5 h-3.5 mx-auto bg-amber-400 rounded-full animate-ping" />
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Title & Artist */}
                <div className="col-span-6 sm:col-span-7 min-w-0 pr-2">
                  <h4 className={`text-sm truncate font-bold ${isThisPlaying ? 'text-[#1ed760]' : 'text-white'}`}>
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {s.artist_name || album.artist_name}
                  </p>
                </div>

                {/* Plays count or Genre */}
                <div className="col-span-3 sm:col-span-3 text-right text-xs font-mono text-slate-400 truncate">
                  {s.plays || `${Math.floor(Math.random() * 8 + 1)},${Math.floor(Math.random() * 800 + 100)},${Math.floor(Math.random() * 800 + 100)}`}
                </div>

                {/* Duration */}
                <div className="col-span-2 sm:col-span-1 text-right text-xs font-mono text-slate-300">
                  {formatSec(s.duration)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
