import { getDb } from '../database/db.js';

export async function getAlbums(req, res) {
  try {
    const db = await getDb();
    const { search, artist_id, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT al.*, a.name AS artist_name, a.image_path AS artist_image, COUNT(s.id) AS song_count
      FROM albums al
      LEFT JOIN artists a ON al.artist_id = a.id
      LEFT JOIN songs s ON s.album_id = al.id
    `;
    let params = [];
    let conditions = [];

    if (search) {
      conditions.push('(al.title LIKE ? OR a.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (artist_id) {
      conditions.push('al.artist_id = ?');
      params.push(artist_id);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY al.id ORDER BY al.release_year DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const albums = db.query(sql, params);
    res.json({ albums, total: albums.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAlbumById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const currentUserId = req.user ? req.user.id : 0;

    const album = db.queryOne(
      `SELECT al.*, a.name AS artist_name, a.image_path AS artist_image
       FROM albums al
       LEFT JOIN artists a ON al.artist_id = a.id
       WHERE al.id = ?`,
      [id]
    );

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const songs = db.query(
      `SELECT 
        s.*,
        a.name AS artist_name,
        al.title AS album_title,
        al.cover_path AS album_cover,
        g.name AS genre_name,
        g.color_hex AS genre_color,
        CASE WHEN lk.id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN liked_songs lk ON lk.song_id = s.id AND lk.user_id = ${currentUserId}
      WHERE s.album_id = ?
      ORDER BY s.track_number ASC, s.id ASC`,
      [id]
    );

    const totalDuration = songs.reduce((sum, s) => sum + (s.duration || 0), 0);

    res.json({
      album: {
        ...album,
        totalDuration,
        songCount: songs.length
      },
      songs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
