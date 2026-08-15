import { getDb } from '../database/db.js';

export async function getArtists(req, res) {
  try {
    const db = await getDb();
    const { search, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT a.*, COUNT(s.id) AS song_count
      FROM artists a
      LEFT JOIN songs s ON s.artist_id = a.id
    `;
    let params = [];

    if (search) {
      sql += ' WHERE a.name LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ' GROUP BY a.id ORDER BY a.monthly_listeners DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const artists = db.query(sql, params);
    res.json({ artists, total: artists.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getArtistById(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const currentUserId = req.user ? req.user.id : 0;

    const artist = db.queryOne('SELECT * FROM artists WHERE id = ?', [id]);
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Top Songs
    const topSongs = db.query(
      `SELECT 
        s.*,
        a.name AS artist_name,
        al.title AS album_title,
        al.cover_path AS album_cover,
        g.name AS genre_name,
        g.color_hex AS genre_color,
        CASE WHEN lk.id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN genres g ON s.genre_id = g.id
      LEFT JOIN liked_songs lk ON lk.song_id = s.id AND lk.user_id = ${currentUserId}
      WHERE s.artist_id = ?
      ORDER BY s.play_count DESC
      LIMIT 10`,
      [id]
    );

    // Albums
    const albums = db.query(
      `SELECT al.*, COUNT(s.id) as track_count
       FROM albums al
       LEFT JOIN songs s ON s.album_id = al.id
       WHERE al.artist_id = ?
       GROUP BY al.id
       ORDER BY al.release_year DESC`,
      [id]
    );

    // Singles & EPs
    const singles = db.query(
      `SELECT s.*, g.name AS genre_name
       FROM songs s
       LEFT JOIN genres g ON s.genre_id = g.id
       LEFT JOIN song_types st ON s.song_type_id = st.id
       WHERE s.artist_id = ? AND st.name = 'Single'
       ORDER BY s.release_year DESC`,
      [id]
    );

    // Artist genres
    const genres = db.query(
      `SELECT DISTINCT g.id, g.name, g.color_hex
       FROM songs s
       JOIN genres g ON s.genre_id = g.id
       WHERE s.artist_id = ?`,
      [id]
    );

    res.json({
      artist,
      topSongs,
      albums,
      singles,
      genres,
      totalSongs: topSongs.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
