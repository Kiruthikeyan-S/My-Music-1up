// Lyrics fetching, LRC time-tag parsing and auto-sync utility

export function parseLrcLyrics(lrcText, totalDuration = 200) {
  if (!lrcText) return [];

  const lines = lrcText.split('\n');
  const parsed = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  let hasTimestamps = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const matches = [...trimmed.matchAll(timeRegex)];
    if (matches.length > 0) {
      hasTimestamps = true;
      const text = trimmed.replace(timeRegex, '').trim();
      for (const match of matches) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
        const time = min * 60 + sec + ms / 1000;
        if (text) {
          parsed.push({ time, text });
        }
      }
    }
  }

  // If standard plain text lyrics without [mm:ss.xx] timestamps, distribute lines evenly across duration
  if (!hasTimestamps || parsed.length === 0) {
    const plainLines = lines.map(l => l.trim()).filter(l => l.length > 0);
    if (plainLines.length === 0) return [];

    const interval = Math.max(2.5, totalDuration / plainLines.length);
    return plainLines.map((text, idx) => ({
      time: idx * interval,
      text
    }));
  }

  // Sort by timestamp
  parsed.sort((a, b) => a.time - b.time);
  return parsed;
}

// Free public lyrics API fetcher (LRCLIB)
export async function fetchOnlineLyrics(title, artist) {
  if (!title) return null;
  try {
    const cleanTitle = title.replace(/\(.*?\)|\[.*?\]/g, '').trim();
    const cleanArtist = (artist || '').replace(/\(.*?\)|\[.*?\]/g, '').trim();

    const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}${cleanArtist ? `&artist_name=${encodeURIComponent(cleanArtist)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    return data.syncedLyrics || data.plainLyrics || null;
  } catch (err) {
    console.warn('LRCLIB lyrics fetch failed:', err);
    return null;
  }
}
