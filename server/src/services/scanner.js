import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as mm from 'music-metadata';
import { fileURLToPath } from 'url';
import { getDb } from '../database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.opus', '.wma']);

const ROOT_COVERS_DIR = path.resolve(__dirname, '../../../storage/covers');
const SERVER_COVERS_DIR = path.resolve(__dirname, '../../storage/covers');

for (const dir of [ROOT_COVERS_DIR, SERVER_COVERS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export let scanProgress = {
  isRunning: false,
  targetFolder: '',
  totalFilesFound: 0,
  scanned: 0,
  imported: 0,
  duplicates: 0,
  missingMetadata: 0,
  errors: 0,
  errorLogs: [],
  reviewQueue: [],
  percentage: 0,
  status: 'idle', // 'scanning', 'processing', 'completed', 'idle'
  completedAt: null
};

// Compute file hash for duplicate detection
export function getFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', err => reject(err));
  });
}

// Find all audio files recursively
export function findAudioFilesRecursively(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(findAudioFilesRecursively(fullPath));
        } else {
          const ext = path.extname(file).toLowerCase();
          if (SUPPORTED_EXTENSIONS.has(ext)) {
            results.push(fullPath);
          }
        }
      } catch (err) {
        // Skip unreadable files
      }
    }
  } catch (err) {
    // Skip directory access errors
  }
  return results;
}

// Extract cover image and persist
export function saveCoverArt(picture) {
  if (!picture || !picture.data) return null;
  const hash = crypto.createHash('md5').update(picture.data).digest('hex');
  const ext = picture.format === 'image/png' ? '.png' : '.jpg';
  const fileName = `cover_${hash}${ext}`;

  for (const dir of [ROOT_COVERS_DIR, SERVER_COVERS_DIR]) {
    const filePath = path.join(dir, fileName);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, picture.data);
    }
  }
  return `/storage/covers/${fileName}`;
}

export async function indexSingleAudioFile(filePath) {
  const db = await getDb();

  const stats = fs.statSync(filePath);
  const fileHash = await getFileHash(filePath);

  // Check duplicate by hash or audio_path
  const existingSong = db.queryOne(
    'SELECT id, title, artist_id FROM songs WHERE file_hash = ? OR audio_path = ?',
    [fileHash, filePath]
  );

  if (existingSong) {
    return { status: 'duplicate', song: existingSong };
  }

  // Parse metadata
  let metadata = null;
  try {
    metadata = await mm.parseFile(filePath, { duration: true });
  } catch (parseErr) {
    metadata = {
      common: {},
      format: { duration: 0, bitrate: 0, container: path.extname(filePath).replace('.', '') }
    };
  }

  const common = metadata?.common || {};
  const format = metadata?.format || {};

  const rawTitle = common.title?.trim();
  const rawArtist = common.artist?.trim() || common.albumartist?.trim();
  const rawAlbum = common.album?.trim();
  const rawGenre = (common.genre && common.genre[0]) ? common.genre[0].trim() : null;
  const releaseYear = common.year || null;
  const trackNumber = common.track?.no || 1;
  const duration = format.duration || 0;
  const bitrate = format.bitrate || 0;
  const audioFormat = format.container || path.extname(filePath).replace('.', '').toLowerCase();

  const hasMissingMeta = !rawTitle || !rawArtist;

  // Fallback title from filename
  const parsedFileName = path.basename(filePath, path.extname(filePath));
  const finalTitle = rawTitle || parsedFileName;
  const finalArtistName = rawArtist || 'Unknown Artist';
  const finalAlbumName = rawAlbum || (rawArtist ? `${rawArtist} - Singles` : 'Unknown Album');

  // Extract and save artwork
  let coverPath = null;
  if (common.picture && common.picture.length > 0) {
    coverPath = saveCoverArt(common.picture[0]);
  }

  // Handle Artist record
  let artistId = null;
  let artistRow = db.queryOne('SELECT id, image_path FROM artists WHERE LOWER(name) = LOWER(?)', [finalArtistName]);
  if (artistRow) {
    artistId = artistRow.id;
    if (!artistRow.image_path && coverPath) {
      db.execute('UPDATE artists SET image_path = ? WHERE id = ?', [coverPath, artistId]);
    }
  } else {
    const insertArtist = db.execute(
      'INSERT INTO artists (name, image_path, monthly_listeners) VALUES (?, ?, ?)',
      [finalArtistName, coverPath, Math.floor(Math.random() * 5000) + 200]
    );
    artistId = insertArtist.lastInsertRowid;
  }

  // Handle Album record
  let albumId = null;
  let albumRow = db.queryOne(
    'SELECT id, cover_path FROM albums WHERE LOWER(title) = LOWER(?) AND artist_id = ?',
    [finalAlbumName, artistId]
  );
  if (albumRow) {
    albumId = albumRow.id;
    if (!albumRow.cover_path && coverPath) {
      db.execute('UPDATE albums SET cover_path = ? WHERE id = ?', [coverPath, albumId]);
    }
    db.execute('UPDATE albums SET total_tracks = total_tracks + 1 WHERE id = ?', [albumId]);
  } else {
    const insertAlbum = db.execute(
      'INSERT INTO albums (title, artist_id, release_year, cover_path, total_tracks) VALUES (?, ?, ?, ?, 1)',
      [finalAlbumName, artistId, releaseYear, coverPath]
    );
    albumId = insertAlbum.lastInsertRowid;
  }

  // Handle Genre record
  let genreId = null;
  if (rawGenre) {
    let genreRow = db.queryOne('SELECT id FROM genres WHERE LOWER(name) = LOWER(?)', [rawGenre]);
    if (genreRow) {
      genreId = genreRow.id;
    } else {
      const insertGenre = db.execute(
        'INSERT INTO genres (name, color_hex) VALUES (?, ?)',
        [rawGenre, '#6366f1']
      );
      genreId = insertGenre.lastInsertRowid;
    }
  }

  // Default Language & Song Type
  let defaultLang = db.queryOne("SELECT id FROM languages WHERE name = 'English'");
  let defaultType = db.queryOne("SELECT id FROM song_types WHERE name = 'Album Track'");

  // Insert Song
  const insertSong = db.execute(
    `INSERT INTO songs (
      title, artist_id, album_id, genre_id, language_id, song_type_id,
      audio_path, cover_path, duration, release_year, track_number,
      file_size, file_hash, bitrate, format, needs_review, is_public
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      finalTitle,
      artistId,
      albumId,
      genreId || (defaultLang ? defaultLang.id : 1),
      defaultLang ? defaultLang.id : 1,
      defaultType ? defaultType.id : 1,
      filePath,
      coverPath,
      duration,
      releaseYear,
      trackNumber,
      stats.size,
      fileHash,
      bitrate,
      audioFormat,
      hasMissingMeta ? 1 : 0,
      1
    ]
  );

  return {
    status: 'imported',
    hasMissingMeta,
    songId: insertSong.lastInsertRowid,
    title: finalTitle,
    artist: finalArtistName,
    album: finalAlbumName,
    coverPath
  };
}

export async function scanMusicDirectory(folderPath) {
  if (scanProgress.isRunning) {
    throw new Error('A scan is already in progress');
  }

  if (!fs.existsSync(folderPath)) {
    throw new Error(`Directory does not exist: ${folderPath}`);
  }

  scanProgress = {
    isRunning: true,
    targetFolder: folderPath,
    totalFilesFound: 0,
    scanned: 0,
    imported: 0,
    duplicates: 0,
    missingMetadata: 0,
    errors: 0,
    errorLogs: [],
    reviewQueue: [],
    percentage: 0,
    status: 'scanning',
    completedAt: null
  };

  try {
    const files = findAudioFilesRecursively(folderPath);
    scanProgress.totalFilesFound = files.length;
    scanProgress.status = 'processing';

    if (files.length === 0) {
      scanProgress.isRunning = false;
      scanProgress.status = 'completed';
      scanProgress.percentage = 100;
      scanProgress.completedAt = new Date().toISOString();
      return scanProgress;
    }

    for (let i = 0; i < files.length; i++) {
      const filePath = files[i];
      scanProgress.scanned = i + 1;
      scanProgress.percentage = Math.round(((i + 1) / files.length) * 100);

      try {
        const res = await indexSingleAudioFile(filePath);
        if (res.status === 'duplicate') {
          scanProgress.duplicates++;
        } else if (res.status === 'imported') {
          scanProgress.imported++;
          if (res.hasMissingMeta) {
            scanProgress.missingMetadata++;
            scanProgress.reviewQueue.push({
              songId: res.songId,
              title: res.title,
              artist: res.artist,
              album: res.album,
              filePath
            });
          }
        }
      } catch (fileErr) {
        scanProgress.errors++;
        scanProgress.errorLogs.push({
          file: filePath,
          error: fileErr.message
        });
      }
    }

    scanProgress.status = 'completed';
    scanProgress.completedAt = new Date().toISOString();
  } catch (err) {
    scanProgress.status = 'error';
    scanProgress.errorLogs.push({ file: 'scanner', error: err.message });
  } finally {
    scanProgress.isRunning = false;
  }

  return scanProgress;
}
