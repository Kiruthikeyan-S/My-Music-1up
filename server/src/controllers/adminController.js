import fs from 'fs';
import path from 'path';
import { getDb } from '../database/db.js';
import { scanMusicDirectory, scanProgress, indexSingleAudioFile } from '../services/scanner.js';

export async function uploadAudioFiles(req, res) {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No audio files provided' });
    }

    let importedCount = 0;
    let duplicateCount = 0;
    let missingMetadataCount = 0;
    let processedSongs = [];
    let errors = [];

    for (const file of files) {
      try {
        const result = await indexSingleAudioFile(file.path);
        if (result.status === 'duplicate') {
          duplicateCount++;
        } else if (result.status === 'imported') {
          importedCount++;
          if (result.hasMissingMeta) {
            missingMetadataCount++;
          }
          processedSongs.push(result);
        }
      } catch (err) {
        errors.push({ file: file.originalname, error: err.message });
      }
    }

    res.json({
      message: `Uploaded and indexed ${importedCount} files`,
      totalFiles: files.length,
      imported: importedCount,
      duplicates: duplicateCount,
      missingMetadata: missingMetadataCount,
      songs: processedSongs,
      errors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function startFolderScan(req, res) {
  try {
    const { folderPath } = req.body;
    if (!folderPath) {
      return res.status(400).json({ error: 'Folder path is required' });
    }

    const resolvedPath = path.resolve(folderPath);
    if (!fs.existsSync(resolvedPath)) {
      return res.status(400).json({ error: `Directory not found: ${resolvedPath}` });
    }

    // Launch scan asynchronously so response is returned immediately
    scanMusicDirectory(resolvedPath).catch(err => {
      console.error('Scan error:', err);
    });

    res.json({
      message: 'Folder scan initiated',
      targetFolder: resolvedPath,
      status: 'scanning'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getScanStatus(req, res) {
  res.json({ progress: scanProgress });
}

export async function getMissingMetadataSongs(req, res) {
  try {
    const db = await getDb();
    const songs = db.query(
      `SELECT 
        s.*,
        a.name AS artist_name,
        al.title AS album_title,
        g.name AS genre_name,
        l.name AS language_name,
        st.name AS song_type_name
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN languages l ON s.language_id = l.id
      LEFT JOIN song_types st ON s.song_type_id = st.id
      WHERE s.needs_review = 1
      ORDER BY s.id DESC`
    );

    res.json({ songs, total: songs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateSongMetadata(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      artist_id,
      artist_name,
      album_id,
      album_title,
      genre_id,
      language_id,
      song_type_id,
      release_year,
      track_number,
      is_public,
      cover_path
    } = req.body;

    const db = await getDb();

    let finalArtistId = artist_id;
    if (!finalArtistId && artist_name) {
      let existingArtist = db.queryOne('SELECT id FROM artists WHERE LOWER(name) = LOWER(?)', [artist_name]);
      if (existingArtist) {
        finalArtistId = existingArtist.id;
      } else {
        const insertArtist = db.execute(
          'INSERT INTO artists (name, monthly_listeners) VALUES (?, 1000)',
          [artist_name]
        );
        finalArtistId = insertArtist.lastInsertRowid;
      }
    }

    let finalAlbumId = album_id;
    if (!finalAlbumId && album_title) {
      let existingAlbum = db.queryOne('SELECT id FROM albums WHERE LOWER(title) = LOWER(?)', [album_title]);
      if (existingAlbum) {
        finalAlbumId = existingAlbum.id;
      } else {
        const insertAlbum = db.execute(
          'INSERT INTO albums (title, artist_id, release_year) VALUES (?, ?, ?)',
          [album_title, finalArtistId || null, release_year || 2024]
        );
        finalAlbumId = insertAlbum.lastInsertRowid;
      }
    }

    db.execute(
      `UPDATE songs SET
        title = COALESCE(?, title),
        artist_id = COALESCE(?, artist_id),
        album_id = COALESCE(?, album_id),
        genre_id = COALESCE(?, genre_id),
        language_id = COALESCE(?, language_id),
        song_type_id = COALESCE(?, song_type_id),
        release_year = COALESCE(?, release_year),
        track_number = COALESCE(?, track_number),
        is_public = COALESCE(?, is_public),
        cover_path = COALESCE(?, cover_path),
        needs_review = 0,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title,
        finalArtistId,
        finalAlbumId,
        genre_id,
        language_id,
        song_type_id,
        release_year,
        track_number,
        is_public,
        cover_path,
        id
      ]
    );

    const updatedSong = db.queryOne(
      `SELECT s.*, a.name as artist_name, al.title as album_title
       FROM songs s
       LEFT JOIN artists a ON s.artist_id = a.id
       LEFT JOIN albums al ON s.album_id = al.id
       WHERE s.id = ?`,
      [id]
    );

    res.json({ song: updatedSong, message: 'Song metadata saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function bulkUpdateSongs(req, res) {
  try {
    const { song_ids, updates } = req.body;
    if (!Array.isArray(song_ids) || song_ids.length === 0) {
      return res.status(400).json({ error: 'song_ids array required' });
    }

    const db = await getDb();
    for (const songId of song_ids) {
      db.execute(
        `UPDATE songs SET
          genre_id = COALESCE(?, genre_id),
          language_id = COALESCE(?, language_id),
          song_type_id = COALESCE(?, song_type_id),
          is_public = COALESCE(?, is_public),
          needs_review = 0,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          updates.genre_id || null,
          updates.language_id || null,
          updates.song_type_id || null,
          updates.is_public !== undefined ? updates.is_public : null,
          songId
        ]
      );
    }

    res.json({ success: true, count: song_ids.length, message: 'Bulk update applied' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteSong(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    db.execute('DELETE FROM songs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Song deleted from library' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDuplicates(req, res) {
  try {
    const db = await getDb();
    // Group songs with identical file_hash or identical title & artist_id
    const duplicateGroups = db.query(
      `SELECT s.title, a.name as artist_name, COUNT(s.id) as dup_count, GROUP_CONCAT(s.id) as song_ids
       FROM songs s
       LEFT JOIN artists a ON s.artist_id = a.id
       GROUP BY LOWER(s.title), s.artist_id
       HAVING COUNT(s.id) > 1`
    );

    let duplicates = [];
    for (const grp of duplicateGroups) {
      const ids = grp.song_ids.split(',').map(id => parseInt(id.trim(), 10));
      const songs = db.query(
        `SELECT s.*, a.name as artist_name, al.title as album_title
         FROM songs s
         LEFT JOIN artists a ON s.artist_id = a.id
         LEFT JOIN albums al ON s.album_id = al.id
         WHERE s.id IN (${ids.join(',')})`
      );
      duplicates.push({
        title: grp.title,
        artist: grp.artist_name,
        songs
      });
    }

    res.json({ duplicates, count: duplicates.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function resolveDuplicate(req, res) {
  try {
    const { keep_song_id, delete_song_ids } = req.body;
    if (!keep_song_id || !Array.isArray(delete_song_ids)) {
      return res.status(400).json({ error: 'keep_song_id and delete_song_ids array required' });
    }

    const db = await getDb();
    for (const delId of delete_song_ids) {
      db.execute('DELETE FROM songs WHERE id = ?', [delId]);
    }

    res.json({ success: true, message: `Duplicate resolved. Kept ID ${keep_song_id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getStats(req, res) {
  try {
    const db = await getDb();

    const totalSongs = db.queryOne('SELECT COUNT(id) as count, SUM(file_size) as total_size, SUM(duration) as total_duration FROM songs');
    const totalArtists = db.queryOne('SELECT COUNT(id) as count FROM artists');
    const totalAlbums = db.queryOne('SELECT COUNT(id) as count FROM albums');
    const totalGenres = db.queryOne('SELECT COUNT(id) as count FROM genres');
    const totalUsers = db.queryOne('SELECT COUNT(id) as count FROM users');
    const missingCount = db.queryOne('SELECT COUNT(id) as count FROM songs WHERE needs_review = 1');

    const topSongs = db.query(
      `SELECT s.id, s.title, a.name as artist_name, s.play_count, s.cover_path
       FROM songs s
       LEFT JOIN artists a ON s.artist_id = a.id
       ORDER BY s.play_count DESC
       LIMIT 5`
    );

    const topArtists = db.query(
      `SELECT a.id, a.name, a.monthly_listeners, a.image_path, COUNT(s.id) as song_count
       FROM artists a
       LEFT JOIN songs s ON s.artist_id = a.id
       GROUP BY a.id
       ORDER BY a.monthly_listeners DESC
       LIMIT 5`
    );

    const genreBreakdown = db.query(
      `SELECT g.name, g.color_hex, COUNT(s.id) as count
       FROM genres g
       LEFT JOIN songs s ON s.genre_id = g.id
       GROUP BY g.id
       ORDER BY count DESC
       LIMIT 6`
    );

    res.json({
      totalSongs: totalSongs?.count || 0,
      totalSize: totalSongs?.total_size || 0,
      totalDuration: totalSongs?.total_duration || 0,
      totalArtists: totalArtists?.count || 0,
      totalAlbums: totalAlbums?.count || 0,
      totalGenres: totalGenres?.count || 0,
      totalUsers: totalUsers?.count || 0,
      missingMetadataCount: missingCount?.count || 0,
      topSongs,
      topArtists,
      genreBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Artist & Album Management
export async function createArtist(req, res) {
  try {
    const { name, bio, image_path } = req.body;
    if (!name) return res.status(400).json({ error: 'Artist name is required' });
    const db = await getDb();
    const result = db.execute(
      'INSERT INTO artists (name, bio, image_path, monthly_listeners) VALUES (?, ?, ?, 500)',
      [name, bio || '', image_path || '/storage/covers/artist_default.svg']
    );
    const artist = db.queryOne('SELECT * FROM artists WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ artist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateArtist(req, res) {
  try {
    const { id } = req.params;
    const { name, bio, image_path, monthly_listeners } = req.body;
    const db = await getDb();
    db.execute(
      `UPDATE artists SET 
        name = COALESCE(?, name),
        bio = COALESCE(?, bio),
        image_path = COALESCE(?, image_path),
        monthly_listeners = COALESCE(?, monthly_listeners)
       WHERE id = ?`,
      [name, bio, image_path, monthly_listeners, id]
    );
    const updated = db.queryOne('SELECT * FROM artists WHERE id = ?', [id]);
    res.json({ artist: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteArtist(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    db.execute('DELETE FROM artists WHERE id = ?', [id]);
    res.json({ success: true, message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAlbum(req, res) {
  try {
    const { title, artist_id, release_year, cover_path } = req.body;
    if (!title) return res.status(400).json({ error: 'Album title is required' });
    const db = await getDb();
    const result = db.execute(
      'INSERT INTO albums (title, artist_id, release_year, cover_path) VALUES (?, ?, ?, ?)',
      [title, artist_id || null, release_year || new Date().getFullYear(), cover_path || '/storage/covers/album_default.svg']
    );
    const album = db.queryOne('SELECT * FROM albums WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ album });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateAlbum(req, res) {
  try {
    const { id } = req.params;
    const { title, artist_id, release_year, cover_path } = req.body;
    const db = await getDb();
    db.execute(
      `UPDATE albums SET 
        title = COALESCE(?, title),
        artist_id = COALESCE(?, artist_id),
        release_year = COALESCE(?, release_year),
        cover_path = COALESCE(?, cover_path)
       WHERE id = ?`,
      [title, artist_id, release_year, cover_path, id]
    );
    const updated = db.queryOne('SELECT * FROM albums WHERE id = ?', [id]);
    res.json({ album: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAlbum(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    db.execute('DELETE FROM albums WHERE id = ?', [id]);
    res.json({ success: true, message: 'Album deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
