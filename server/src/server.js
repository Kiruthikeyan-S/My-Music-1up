import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './database/db.js';

import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins (Vercel, Firebase, Localhost)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range']
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Ensure upload & cover storage directories exist
const rootStoragePath = path.resolve(__dirname, '../../storage');
const serverStoragePath = path.resolve(__dirname, '../storage');

[
  path.join(rootStoragePath, 'covers'),
  path.join(rootStoragePath, 'music/uploads'),
  path.join(serverStoragePath, 'covers'),
  path.join(serverStoragePath, 'music/uploads')
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static storage directory (covers, audio, icons)
app.use('/storage', express.static(rootStoragePath));
app.use('/storage', express.static(serverStoragePath));

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: '1UP Music Streaming Backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: '1UP Music Platform',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

// Start Server binding to 0.0.0.0 for Cloud Hosting (Render / Railway / Containers)
async function start() {
  try {
    await initDb();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🎵 1UP Music Server running on port ${PORT} (0.0.0.0)`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

start();
