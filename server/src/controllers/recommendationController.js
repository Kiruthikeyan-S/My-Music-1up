import { getDb } from '../database/db.js';

export async function getRecommendations(req, res) {
  try {
    const db = await getDb();
    const currentUserId = req.user ? req.user.id : 0;

    // 1. Trending / Popular
    const trending = db.query(
      `SELECT 
        s.*,
        a.name AS artist_name,
        a.image_path AS artist_image,
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
      WHERE s.is_public = 1
      ORDER BY s.play_count DESC
      LIMIT 8`
    );

    // 2. Recently Added
    const recentlyAdded = db.query(
      `SELECT 
        s.*,
        a.name AS artist_name,
        a.image_path AS artist_image,
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
      WHERE s.is_public = 1
      ORDER BY s.created_at DESC
      LIMIT 8`
    );

    // 3. User Personalized Recommendations
    let recommended = [];
    let becauseYouListenedTo = null;

    if (currentUserId) {
      // Find user top artist or recent song
      const lastHistory = db.queryOne(
        `SELECT s.artist_id, a.name as artist_name, s.genre_id, g.name as genre_name
         FROM listening_history lh
         JOIN songs s ON lh.song_id = s.id
         JOIN artists a ON s.artist_id = a.id
         LEFT JOIN genres g ON s.genre_id = g.id
         WHERE lh.user_id = ?
         ORDER BY lh.played_at DESC
         LIMIT 1`,
        [currentUserId]
      );

      if (lastHistory) {
        becauseYouListenedTo = {
          artist: lastHistory.artist_name,
          genre: lastHistory.genre_name
        };

        recommended = db.query(
          `SELECT 
            s.*,
            a.name AS artist_name,
            a.image_path AS artist_image,
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
          WHERE s.is_public = 1 AND (s.artist_id = ? OR s.genre_id = ?)
          ORDER BY RANDOM()
          LIMIT 8`,
          [lastHistory.artist_id, lastHistory.genre_id]
        );
      }
    }

    // Fallback if not enough user history
    if (recommended.length === 0) {
      recommended = db.query(
        `SELECT 
          s.*,
          a.name AS artist_name,
          a.image_path AS artist_image,
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
        WHERE s.is_public = 1
        ORDER BY RANDOM()
        LIMIT 8`
      );
    }

    // 4. Popular Artists & Albums
    const popularArtists = db.query(
      'SELECT * FROM artists ORDER BY monthly_listeners DESC LIMIT 6'
    );

    const popularAlbums = db.query(
      `SELECT al.*, a.name as artist_name
       FROM albums al
       LEFT JOIN artists a ON al.artist_id = a.id
       ORDER BY al.release_year DESC
       LIMIT 6`
    );

    res.json({
      trending,
      recentlyAdded,
      recommended,
      becauseYouListenedTo,
      popularArtists,
      popularAlbums
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSimilarSongs(req, res) {
  try {
    const { id } = req.params;
    const db = await getDb();
    const currentUserId = req.user ? req.user.id : 0;

    const baseSong = db.queryOne('SELECT * FROM songs WHERE id = ?', [id]);
    if (!baseSong) return res.status(404).json({ error: 'Song not found' });

    const similar = db.query(
      `SELECT 
        s.*,
        a.name AS artist_name,
        a.image_path AS artist_image,
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
      WHERE s.id != ? AND (s.genre_id = ? OR s.artist_id = ? OR s.language_id = ?)
      ORDER BY RANDOM()
      LIMIT 8`,
      [id, baseSong.genre_id, baseSong.artist_id, baseSong.language_id]
    );

    res.json({ similar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
