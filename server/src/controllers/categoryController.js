import { getDb } from '../database/db.js';

export async function getGenres(req, res) {
  try {
    const db = await getDb();
    const genres = db.query(
      `SELECT g.*, COUNT(s.id) as song_count
       FROM genres g
       LEFT JOIN songs s ON s.genre_id = g.id
       GROUP BY g.id
       ORDER BY song_count DESC, g.name ASC`
    );
    res.json({ genres });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getLanguages(req, res) {
  try {
    const db = await getDb();
    const languages = db.query(
      `SELECT l.*, COUNT(s.id) as song_count
       FROM languages l
       LEFT JOIN songs s ON s.language_id = l.id
       GROUP BY l.id
       ORDER BY song_count DESC, l.name ASC`
    );
    res.json({ languages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSongTypes(req, res) {
  try {
    const db = await getDb();
    const songTypes = db.query(
      `SELECT st.*, COUNT(s.id) as song_count
       FROM song_types st
       LEFT JOIN songs s ON s.song_type_id = st.id
       GROUP BY st.id
       ORDER BY song_count DESC, st.name ASC`
    );
    res.json({ songTypes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
