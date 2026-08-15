import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle } from 'lucide-react';

export function ArtistCard({ artist }) {
  const navigate = useNavigate();

  const formatListeners = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num;
  };

  return (
    <div
      onClick={() => navigate(`/artists/${artist.id}`)}
      className="group glass-card p-4 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-3 bg-dark-900 border-2 border-white/10 group-hover:border-brand-500 transition-colors shadow-lg">
        <img
          src={artist.image_path || '/storage/covers/artist_default.svg'}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-3 rounded-full bg-brand-500 text-white shadow-glow-brand">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      <h4 className="text-sm font-bold text-white truncate w-full group-hover:text-brand-400 transition flex items-center justify-center gap-1">
        {artist.name}
        <CheckCircle className="w-3.5 h-3.5 text-brand-400 fill-brand-500/20 flex-shrink-0" />
      </h4>
      <p className="text-[11px] text-slate-400 mt-0.5">
        {formatListeners(artist.monthly_listeners)} monthly listeners
      </p>
    </div>
  );
}

export function AlbumCard({ album }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/albums/${album.id}`)}
      className="group glass-card p-3.5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-dark-900 border border-white/10 shadow-md">
        <img
          src={album.cover_path || '/storage/covers/album_default.svg'}
          alt={album.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-3 rounded-full bg-brand-500 text-white shadow-glow-brand">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-400 transition">
        {album.title}
      </h4>
      <p className="text-xs text-slate-400 truncate mt-0.5">
        {album.release_year ? `${album.release_year} • ` : ''}{album.artist_name || 'Album'}
      </p>
    </div>
  );
}

export function GenreCard({ genre, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${genre.color_hex || '#6366f1'}33 0%, rgba(15, 19, 29, 0.9) 100%)`,
        borderColor: `${genre.color_hex || '#6366f1'}55`
      }}
      className="group relative p-5 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow-brand"
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <h4 className="text-lg font-bold text-white group-hover:text-brand-300 transition">
            {genre.name}
          </h4>
          <span className="text-xs text-slate-400 font-medium">
            {genre.song_count || 0} track{genre.song_count !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-3xl filter drop-shadow-md">
          {genre.icon || '🎵'}
        </span>
      </div>
      <div
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ backgroundColor: genre.color_hex || '#6366f1' }}
      />
    </div>
  );
}
