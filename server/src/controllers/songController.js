import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveAudioFilePath(rawPath) {
  if (!rawPath) return null;
  if (fs.existsSync(rawPath)) return rawPath;

  const fileName = path.basename(rawPath.replace(/\\/g, '/'));
  const candidates = [
    rawPath,
    path.resolve(process.cwd(), 'storage/music/uploads', fileName),
    path.resolve(process.cwd(), '../storage/music/uploads', fileName),
    path.resolve(process.cwd(), 'server/storage/music/uploads', fileName),
    path.resolve(process.cwd(), 'storage/music', fileName),
    path.resolve(process.cwd(), '../storage/music', fileName),
    path.resolve(process.cwd(), 'server/storage/music', fileName),
    path.resolve(__dirname, '../../storage/music/uploads', fileName),
    path.resolve(__dirname, '../storage/music/uploads', fileName),
    path.resolve(__dirname, '../../storage/music', fileName),
    path.resolve(__dirname, '../storage/music', fileName)
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export async function getSongs(req, res) {
  try {
    const db = await getDb();
    const {
      genre_id,
      language_id,
      song_type_id,
      artist_id,
      album_id,
      search,
      sort = 'newest',
      limit = 50,
      offset = 0
    } = req.query;

    let conditions = ['s.is_public = 1'];
    let params = [];

    if (genre_id) {
      conditions.push('s.genre_id = ?');
      params.push(genre_id);
    }
    if (language_id) {
      conditions.push('s.language_id = ?');
      params.push(language_id);
    }
    if (song_type_id) {
      conditions.push('s.song_type_id = ?');
      params.push(song_type_id);
    }
    if (artist_id) {
      conditions.push('s.artist_id = ?');
      params.push(artist_id);
    }
    if (album_id) {
      conditions.push('s.album_id = ?');
      params.push(album_id);
    }
    if (search) {
      conditions.push('(s.title LIKE ? OR a.name LIKE ? OR al.title LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    let orderBy = 's.created_at DESC';
    if (sort === 'popular') orderBy = 's.play_count DESC';
    if (sort === 'title') orderBy = 's.title ASC';
    if (sort === 'year') orderBy = 's.release_year DESC';

    const currentUserId = req.user ? req.user.id : 0;

    const sql = `
      SELECT 
        s.*,
        a.name AS artist_name,
        a.image_path AS artist_image,
        al.title AS album_title,
        al.cover_path AS album_cover,
        g.name AS genre_name,
        g.color AS genre_color,
        l.name AS language_name,
        st.name AS song_type_name,
        EXISTS(SELECT 1 FROM user_likes WHERE user_id = ${currentUserId} AND song_id = s.id) AS is_liked
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN languages l ON s.language_id = l.id
      LEFT JOIN song_types st ON s.song_type_id = st.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const songs = db.query(sql, params);

    const countSql = `
      SELECT COUNT(*) as total 
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      WHERE ${conditions.join(' AND ')}
    `;
    const totalCount = db.queryOne(countSql, params.slice(0, -2))?.total || 0;

    res.json({
      songs,
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSongById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const currentUserId = req.user ? req.user.id : 0;

    const sql = `
      SELECT 
        s.*,
        a.name AS artist_name,
        a.image_path AS artist_image,
        a.bio AS artist_bio,
        al.title AS album_title,
        al.cover_path AS album_cover,
        al.release_year AS album_year,
        g.name AS genre_name,
        g.color AS genre_color,
        l.name AS language_name,
        st.name AS song_type_name,
        EXISTS(SELECT 1 FROM user_likes WHERE user_id = ${currentUserId} AND song_id = s.id) AS is_liked
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN languages l ON s.language_id = l.id
      LEFT JOIN song_types st ON s.song_type_id = st.id
      WHERE s.id = ?
    `;
    const song = db.queryOne(sql, [id]);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(song);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Audio Streamer supporting HTTP 206 Partial Content Range Requests
export async function streamSong(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const song = db.queryOne('SELECT id, audio_path, format FROM songs WHERE id = ?', [id]);

    if (!song || !song.audio_path) {
      return res.status(404).json({ error: 'Audio file not found in database' });
    }

    const filePath = resolveAudioFilePath(song.audio_path);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Audio file not found on server disk for song ${id}` });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // MIME type mapper
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.flac': 'audio/flac',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.ogg': 'audio/ogg',
      '.opus': 'audio/opus'
    };
    const contentType = mimeTypes[ext] || 'audio/mpeg';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
        return;
      }

      const chunksize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };

      res.writeHead(206, headers);
      fileStream.pipe(res);

      req.on('close', () => {
        fileStream.destroy();
      });
      fileStream.on('error', (err) => {
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
    } else {
      const headers = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      };
      res.writeHead(200, headers);
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      req.on('close', () => {
        fileStream.destroy();
      });
      fileStream.on('error', (err) => {
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Record Play Count & History
export async function recordPlay(req, res) {
  try {
    const { id } = req.params;
    const { duration_listened = 0 } = req.body;
    const db = await getDb();
    const userId = req.user ? req.user.id : 0;

    // Increment play count
    db.run('UPDATE songs SET play_count = play_count + 1 WHERE id = ?', [id]);

    // Record in listening history if user is logged in
    if (userId) {
      db.run(
        'INSERT INTO listening_history (user_id, song_id, duration_listened) VALUES (?, ?, ?)',
        [userId, id, duration_listened]
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
