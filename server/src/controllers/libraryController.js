import { getDb } from '../database/db.js';

export async function getLikedSongs(req, res) {
  try {
    const db = await getDb();
    const userId = req.user.id;

    const songs = db.query(
      `SELECT 
        s.*,
        a.name AS artist_name,
        a.image_path AS artist_image,
        al.title AS album_title,
        al.cover_path AS album_cover,
        g.name AS genre_name,
        g.color_hex AS genre_color,
        l.name AS language_name,
        st.name AS song_type_name,
        1 AS is_liked,
        lk.liked_at
      FROM liked_songs lk
      JOIN songs s ON lk.song_id = s.id
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN languages l ON s.language_id = l.id
      LEFT JOIN song_types st ON s.song_type_id = st.id
      WHERE lk.user_id = ?
      ORDER BY lk.liked_at DESC`,
      [userId]
    );

    const totalDuration = songs.reduce((acc, s) => acc + (s.duration || 0), 0);

    res.json({ songs, total: songs.length, totalDuration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function toggleLikeSong(req, res) {
  try {
    const { song_id } = req.body;
    if (!song_id) return res.status(400).json({ error: 'song_id is required' });

    const db = await getDb();
    const userId = req.user.id;

    const existing = db.queryOne(
      'SELECT id FROM liked_songs WHERE user_id = ? AND song_id = ?',
      [userId, song_id]
    );

    if (existing) {
      db.execute('DELETE FROM liked_songs WHERE id = ?', [existing.id]);
      res.json({ is_liked: false, message: 'Removed from Liked Songs' });
    } else {
      db.execute('INSERT INTO liked_songs (user_id, song_id) VALUES (?, ?)', [userId, song_id]);
      res.json({ is_liked: true, message: 'Added to Liked Songs' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getRecentlyPlayed(req, res) {
  try {
    const db = await getDb();
    const userId = req.user ? req.user.id : 0;

    const songs = db.query(
      `SELECT 
        s.*,
        a.name AS artist_name,
        a.image_path AS artist_image,
        al.title AS album_title,
        al.cover_path AS album_cover,
        g.name AS genre_name,
        g.color_hex AS genre_color,
        MAX(lh.played_at) AS last_played_at,
        CASE WHEN lk.id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
      FROM listening_history lh
      JOIN songs s ON lh.song_id = s.id
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN liked_songs lk ON lk.song_id = s.id AND lk.user_id = ${userId}
      WHERE lh.user_id = ?
      GROUP BY s.id
      ORDER BY last_played_at DESC
      LIMIT 20`,
      [userId]
    );

    res.json({ songs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getContinueListening(req, res) {
  try {
    const db = await getDb();
    if (!req.user) {
      return res.json({ items: [] });
    }

    const items = db.query(
      `SELECT 
        pp.position_seconds,
        pp.updated_at,
        s.*,
        a.name AS artist_name,
        al.title AS album_title,
        al.cover_path AS album_cover,
        g.name AS genre_name,
        g.color_hex AS genre_color,
        CASE WHEN lk.id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
      FROM playback_positions pp
      JOIN songs s ON pp.song_id = s.id
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN liked_songs lk ON lk.song_id = s.id AND lk.user_id = ${req.user.id}
      WHERE pp.user_id = ? AND pp.position_seconds > 5 AND pp.position_seconds < (s.duration - 5)
      ORDER BY pp.updated_at DESC
      LIMIT 6`,
      [req.user.id]
    );

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function savePlaybackPosition(req, res) {
  try {
    if (!req.user) {
      return res.json({ success: true, guest: true });
    }

    const { song_id, position_seconds } = req.body;
    if (!song_id) return res.status(400).json({ error: 'song_id is required' });

    const db = await getDb();
    const existing = db.queryOne(
      'SELECT id FROM playback_positions WHERE user_id = ? AND song_id = ?',
      [req.user.id, song_id]
    );

    if (existing) {
      db.execute(
        'UPDATE playback_positions SET position_seconds = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [position_seconds, existing.id]
      );
    } else {
      db.execute(
        'INSERT INTO playback_positions (user_id, song_id, position_seconds) VALUES (?, ?, ?)',
        [req.user.id, song_id, position_seconds]
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
