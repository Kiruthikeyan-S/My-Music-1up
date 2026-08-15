import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sonora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  getMe: () => api.get('/auth/me')
};

export const songsAPI = {
  getAll: (params) => api.get('/songs', { params }),
  getById: (id) => api.get(`/songs/${id}`),
  recordPlay: (id, durationListened) => api.post(`/songs/${id}/play`, { duration_listened: durationListened }),
  getStreamUrl: (id) => `${API_BASE_URL}/api/songs/${id}/stream`
};

export const artistsAPI = {
  getAll: (params) => api.get('/artists', { params }),
  getById: (id) => api.get(`/artists/${id}`)
};

export const albumsAPI = {
  getAll: (params) => api.get('/albums', { params }),
  getById: (id) => api.get(`/albums/${id}`)
};

export const playlistsAPI = {
  getAll: () => api.get('/playlists'),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  update: (id, data) => api.put(`/playlists/${id}`, data),
  delete: (id) => api.delete(`/playlists/${id}`),
  addSong: (id, songId) => api.post(`/playlists/${id}/songs`, { song_id: songId }),
  removeSong: (id, songId) => api.delete(`/playlists/${id}/songs/${songId}`),
  reorder: (id, songIds) => api.put(`/playlists/${id}/reorder`, { songIds })
};

export const libraryAPI = {
  getLiked: () => api.get('/library/liked'),
  toggleLike: (songId) => api.post('/library/like', { song_id: songId }),
  getRecent: () => api.get('/library/recent'),
  getContinueListening: () => api.get('/library/continue'),
  savePlaybackPosition: (songId, position) => api.post('/library/playback-position', { song_id: songId, position_seconds: position })
};

export const recommendationsAPI = {
  getHomeFeed: () => api.get('/recommendations'),
  getSimilar: (songId) => api.get(`/recommendations/similar/${songId}`)
};

export const categoriesAPI = {
  getGenres: () => api.get('/categories/genres'),
  getLanguages: () => api.get('/categories/languages'),
  getSongTypes: () => api.get('/categories/song-types')
};

export const adminAPI = {
  uploadFiles: (formData) => api.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  startScan: (folderPath) => api.post('/admin/scan', { folderPath }),
  getScanStatus: () => api.get('/admin/scan/status'),
  getMissingMetadata: () => api.get('/admin/songs/missing-metadata'),
  updateMetadata: (id, data) => api.put(`/admin/songs/${id}/metadata`, data),
  bulkUpdate: (songIds, updates) => api.post('/admin/songs/bulk-update', { song_ids: songIds, updates }),
  deleteSong: (id) => api.delete(`/admin/songs/${id}`),
  getDuplicates: () => api.get('/admin/duplicates'),
  resolveDuplicate: (keepId, deleteIds) => api.post('/admin/duplicates/resolve', { keep_song_id: keepId, delete_song_ids: deleteIds }),
  getStats: () => api.get('/admin/stats'),
  createArtist: (data) => api.post('/admin/artists', data),
  updateArtist: (id, data) => api.put(`/admin/artists/${id}`, data),
  deleteArtist: (id) => api.delete(`/admin/artists/${id}`),
  createAlbum: (data) => api.post('/admin/albums', data),
  updateAlbum: (id, data) => api.put(`/admin/albums/${id}`, data),
  deleteAlbum: (id) => api.delete(`/admin/albums/${id}`)
};

export default api;
