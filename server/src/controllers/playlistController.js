import { getDb } from '../database/db.js';

export async function getUserPlaylists(req, res) {
  try {
    const db = await getDb();
    const userId = req.user ? req.user.id : 0;

    const playlists = db.query(
      `SELECT p.*, COUNT(ps.id) as song_count, u.username as creator_name
       FROM playlists p
       LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ? OR p.is_public = 1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({ playlists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPlaylistById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const currentUserId = req.user ? req.user.id : 0;

    const playlist = db.queryOne(
      `SELECT p.*, u.username as creator_name, COUNT(ps.id) as song_count
       FROM playlists p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [id]
    );

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const songs = db.query(
      `SELECT 
        s.*,
        ps.position as playlist_position,
        ps.id as playlist_entry_id,
        a.name AS artist_name,
        al.title AS album_title,
        al.cover_path AS album_cover,
        g.name AS genre_name,
        g.color_hex AS genre_color,
        CASE WHEN lk.id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
      FROM playlist_songs ps
      JOIN songs s ON ps.song_id = s.id
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN liked_songs lk ON lk.song_id = s.id AND lk.user_id = ${currentUserId}
      WHERE ps.playlist_id = ?
      ORDER BY ps.position ASC`,
      [id]
    );

    const totalDuration = songs.reduce((sum, s) => sum + (s.duration || 0), 0);

    res.json({
      playlist: {
        ...playlist,
        totalDuration,
        isOwner: req.user ? playlist.user_id === req.user.id : false
      },
      songs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createPlaylist(req, res) {
  try {
    const { title, description, cover_path, is_public = 1 } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Playlist title is required' });
    }

    const db = await getDb();
    const result = db.execute(
      `INSERT INTO playlists (user_id, title, description, cover_path, is_public)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, title, description || '', cover_path || '/storage/covers/playlist_latenight.svg', is_public ? 1 : 0]
    );

    const playlist = db.queryOne('SELECT * FROM playlists WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ playlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updatePlaylist(req, res) {
  try {
    const { id } = req.params;
    const { title, description, cover_path, is_public } = req.body;
    const db = await getDb();

    const pl = db.queryOne('SELECT * FROM playlists WHERE id = ?', [id]);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this playlist' });
    }

    db.execute(
      `UPDATE playlists SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        cover_path = COALESCE(?, cover_path),
        is_public = COALESCE(?, is_public)
       WHERE id = ?`,
      [title, description, cover_path, is_public, id]
    );

    const updated = db.queryOne('SELECT * FROM playlists WHERE id = ?', [id]);
    res.json({ playlist: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deletePlaylist(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const pl = db.queryOne('SELECT * FROM playlists WHERE id = ?', [id]);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this playlist' });
    }

    db.execute('DELETE FROM playlists WHERE id = ?', [id]);
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function addSongToPlaylist(req, res) {
  try {
    const { id } = req.params;
    const { song_id } = req.body;
    const db = await getDb();

    const pl = db.queryOne('SELECT * FROM playlists WHERE id = ?', [id]);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const maxPos = db.queryOne('SELECT MAX(position) as max_pos FROM playlist_songs WHERE playlist_id = ?', [id]);
    const nextPos = (maxPos?.max_pos || 0) + 1;

    db.execute(
      'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)',
      [id, song_id, nextPos]
    );

    res.json({ success: true, message: 'Song added to playlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeSongFromPlaylist(req, res) {
  try {
    const { id, songId } = req.params;
    const db = await getDb();

    const pl = db.queryOne('SELECT * FROM playlists WHERE id = ?', [id]);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    db.execute('DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?', [id, songId]);
    res.json({ success: true, message: 'Song removed from playlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function reorderPlaylist(req, res) {
  try {
    const { id } = req.params;
    const { songIds } = req.body; // Array of song IDs in new order
    const db = await getDb();

    const pl = db.queryOne('SELECT * FROM playlists WHERE id = ?', [id]);
    if (!pl) return res.status(404).json({ error: 'Playlist not found' });
    if (pl.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (Array.isArray(songIds)) {
      songIds.forEach((songId, index) => {
        db.execute(
          'UPDATE playlist_songs SET position = ? WHERE playlist_id = ? AND song_id = ?',
          [index + 1, id, songId]
        );
      });
    }

    res.json({ success: true, message: 'Playlist reordered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
