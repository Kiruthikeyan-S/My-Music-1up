import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { initDb } from './db.js';

// Helper function to synthesize a playable valid WAV audio buffer
function createPlayableWavBuffer(durationSeconds = 30, freq = 440, bpm = 120) {
  const sampleRate = 22050; // Compact 22.05kHz mono
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Synthesize musical tones (melody & harmony based on freq and rhythm)
  let offset = 44;
  const beatInterval = sampleRate * (60 / bpm);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beatPhase = (i % beatInterval) / beatInterval;
    const decay = Math.exp(-beatPhase * 4); // Drum/pulse envelope
    
    // Musical chords (root, minor 3rd, 5th)
    const f1 = freq;
    const f2 = freq * 1.25;
    const f3 = freq * 1.5;
    
    // Melodic vibrato
    const vibrato = Math.sin(2 * Math.PI * 5 * t) * 3;
    
    // Combined audio wave with rhythmic decay
    const wave = (
      Math.sin(2 * Math.PI * (f1 + vibrato) * t) * 0.5 +
      Math.sin(2 * Math.PI * f2 * t) * 0.3 +
      Math.sin(2 * Math.PI * f3 * t) * 0.2 +
      (Math.sin(2 * Math.PI * 60 * t) * 0.6 * decay) // bass kick
    );

    // Fade in and out
    let envelope = 1.0;
    if (i < sampleRate * 0.5) envelope = i / (sampleRate * 0.5);
    if (i > numSamples - sampleRate * 1) envelope = (numSamples - i) / (sampleRate * 1);

    const sample = Math.max(-1, Math.min(1, wave * 0.6 * envelope));
    const intSample = Math.floor(sample < 0 ? sample * 32768 : sample * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

// Generate vibrant modern SVG album/artist cover
function createArtworkSvg(title, subtitle, bgColor1 = '#4f46e5', bgColor2 = '#06b6d4', icon = '🎵') {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor1}" />
      <stop offset="100%" stop-color="${bgColor2}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.4" />
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <rect width="600" height="600" fill="url(#grad)" />
  <rect width="600" height="600" fill="url(#glow)" />
  
  <!-- Modern Geometric Accents -->
  <circle cx="520" cy="80" r="140" fill="#ffffff" fill-opacity="0.08" />
  <circle cx="80" cy="520" r="180" fill="#ffffff" fill-opacity="0.05" />
  <rect x="50" y="50" width="500" height="500" rx="24" fill="none" stroke="#ffffff" stroke-opacity="0.15" stroke-width="2" />
  
  <!-- Icon Center -->
  <g filter="url(#shadow)">
    <circle cx="300" cy="250" r="85" fill="#000000" fill-opacity="0.35" />
    <text x="300" y="285" font-size="90" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${icon}</text>
  </g>
  
  <!-- Typography -->
  <text x="300" y="420" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" font-family="'Plus Jakarta Sans', Inter, -apple-system, sans-serif" letter-spacing="1">
    ${title.length > 22 ? title.substring(0, 20) + '...' : title}
  </text>
  <text x="300" y="465" font-size="20" font-weight="500" fill="#e2e8f0" fill-opacity="0.85" text-anchor="middle" font-family="'Plus Jakarta Sans', Inter, -apple-system, sans-serif" letter-spacing="0.5">
    ${subtitle}
  </text>
  
  <!-- Sonora Branding Tag -->
  <text x="300" y="525" font-size="12" font-weight="700" fill="#ffffff" fill-opacity="0.4" text-anchor="middle" font-family="monospace" letter-spacing="3">
    SONORA MASTER AUDIO
  </text>
</svg>
`.trim();
}

export async function seedDatabase() {
  console.log('🌱 Starting Sonora Database Seeding...');
  const db = await initDb();

  const musicDir = path.resolve(process.cwd(), 'storage/music/demo');
  const coversDir = path.resolve(process.cwd(), 'storage/covers');
  fs.mkdirSync(musicDir, { recursive: true });
  fs.mkdirSync(coversDir, { recursive: true });

  // 1. Seed Categories
  console.log('👉 Seeding Genres, Languages, and Song Types...');
  const genres = [
    { name: 'Pop', color: '#ec4899', icon: '✨' },
    { name: 'Rock', color: '#ef4444', icon: '🎸' },
    { name: 'Hip-Hop', color: '#f59e0b', icon: '🎤' },
    { name: 'Classical', color: '#8b5cf6', icon: '🎻' },
    { name: 'Jazz', color: '#3b82f6', icon: '🎷' },
    { name: 'Electronic', color: '#06b6d4', icon: '⚡' },
    { name: 'Folk', color: '#10b981', icon: '🪕' },
    { name: 'Melody', color: '#6366f1', icon: '🎹' },
    { name: 'Instrumental', color: '#14b8a6', icon: '🎼' },
    { name: 'Lo-Fi', color: '#a855f7', icon: '☕' },
    { name: 'Ambient', color: '#0ea5e9', icon: '🌌' },
    { name: 'Cinematic', color: '#e11d48', icon: '🎬' },
    { name: 'R&B', color: '#d946ef', icon: '💫' }
  ];

  for (const g of genres) {
    const existing = db.queryOne('SELECT id FROM genres WHERE name = ?', [g.name]);
    if (!existing) {
      db.execute('INSERT INTO genres (name, color_hex, icon) VALUES (?, ?, ?)', [g.name, g.color, g.icon]);
    }
  }

  const languages = [
    { name: 'Tamil', code: 'ta' },
    { name: 'English', code: 'en' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Telugu', code: 'te' },
    { name: 'Malayalam', code: 'ml' },
    { name: 'Kannada', code: 'kn' },
    { name: 'Spanish', code: 'es' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Other', code: 'ot' }
  ];

  for (const l of languages) {
    const existing = db.queryOne('SELECT id FROM languages WHERE name = ?', [l.name]);
    if (!existing) {
      db.execute('INSERT INTO languages (name, code) VALUES (?, ?)', [l.name, l.code]);
    }
  }

  const songTypes = [
    'Movie Song',
    'Single',
    'Album Track',
    'Instrumental',
    'Remix',
    'Live',
    'Podcast',
    'Acoustic',
    'Theme'
  ];

  for (const st of songTypes) {
    const existing = db.queryOne('SELECT id FROM song_types WHERE name = ?', [st]);
    if (!existing) {
      db.execute('INSERT INTO song_types (name) VALUES (?)', [st]);
    }
  }

  // 2. Seed Users
  console.log('👉 Seeding Admin and Demo Users...');
  const salt = bcrypt.genSaltSync(10);
  const adminPass = bcrypt.hashSync('admin123', salt);
  const userPass = bcrypt.hashSync('user123', salt);

  if (!db.queryOne("SELECT id FROM users WHERE email = 'admin@sonora.io'")) {
    db.execute(
      `INSERT INTO users (username, email, password_hash, role, avatar_url)
       VALUES ('Sonora Admin', 'admin@sonora.io', ?, 'admin', '/storage/covers/avatar_admin.svg')`,
      [adminPass]
    );
  }

  if (!db.queryOne("SELECT id FROM users WHERE email = 'demo@sonora.io'")) {
    db.execute(
      `INSERT INTO users (username, email, password_hash, role, avatar_url)
       VALUES ('Alex Rivera', 'demo@sonora.io', ?, 'user', '/storage/covers/avatar_user.svg')`,
      [userPass]
    );
  }

  // Save avatars
  fs.writeFileSync(
    path.join(coversDir, 'avatar_admin.svg'),
    createArtworkSvg('Admin', 'System Administrator', '#4f46e5', '#9333ea', '🛡️')
  );
  fs.writeFileSync(
    path.join(coversDir, 'avatar_user.svg'),
    createArtworkSvg('Alex', 'Music Enthusiast', '#06b6d4', '#3b82f6', '🎧')
  );

  // 3. Seed Artists & Albums & Songs
  console.log('👉 Generating Sample Music Collection & Playable Audio Tracks...');
  
  const seedCatalog = [
    {
      artist: 'Anirudh Ravichander',
      bio: 'Prolific South Indian composer & music producer known for viral chartbusters, high-energy EDM orchestrations, and soul-stirring melodies.',
      monthlyListeners: 8420000,
      artistColors: ['#f43f5e', '#fb923c'],
      icon: '🔥',
      albums: [
        {
          title: 'Leo (Original Motion Picture Soundtrack)',
          year: 2023,
          colors: ['#ef4444', '#7f1d1d'],
          tracks: [
            { title: 'Badass (Theme)', genre: 'Hip-Hop', lang: 'Tamil', type: 'Movie Song', bpm: 128, freq: 330, duration: 42, trackNo: 1 },
            { title: 'Ordinary Person', genre: 'Melody', lang: 'Tamil', type: 'Movie Song', bpm: 95, freq: 440, duration: 48, trackNo: 2 },
            { title: 'Bloody Sweet', genre: 'Rock', lang: 'English', type: 'Movie Song', bpm: 135, freq: 370, duration: 38, trackNo: 3 }
          ]
        },
        {
          title: 'Hukum - Single',
          year: 2023,
          colors: ['#f59e0b', '#b45309'],
          tracks: [
            { title: 'Hukum (Tiger Ka Hukum)', genre: 'Rock', lang: 'Tamil', type: 'Single', bpm: 130, freq: 293, duration: 45, trackNo: 1 }
          ]
        },
        {
          title: 'Vikram',
          year: 2022,
          colors: ['#1e293b', '#0f172a'],
          tracks: [
            { title: 'Vikram Title Track', genre: 'Electronic', lang: 'Tamil', type: 'Movie Song', bpm: 125, freq: 392, duration: 52, trackNo: 1 },
            { title: 'Porkanda Singam', genre: 'Melody', lang: 'Tamil', type: 'Movie Song', bpm: 88, freq: 440, duration: 40, trackNo: 2 }
          ]
        }
      ]
    },
    {
      artist: 'A.R. Rahman',
      bio: 'Oscar & Grammy-winning maestro celebrated globally for fusing Eastern classical music with electronic beats, world music, and traditional orchestral arrangements.',
      monthlyListeners: 12500000,
      artistColors: ['#6366f1', '#a855f7'],
      icon: '✨',
      albums: [
        {
          title: 'Ponniyin Selvan',
          year: 2022,
          colors: ['#d97706', '#92400e'],
          tracks: [
            { title: 'Ponni Nadhi', genre: 'Folk', lang: 'Tamil', type: 'Movie Song', bpm: 110, freq: 349, duration: 45, trackNo: 1 },
            { title: 'Aga Naga', genre: 'Melody', lang: 'Tamil', type: 'Movie Song', bpm: 82, freq: 523, duration: 50, trackNo: 2 },
            { title: 'Chola Chola', genre: 'Folk', lang: 'Tamil', type: 'Movie Song', bpm: 124, freq: 261, duration: 44, trackNo: 3 }
          ]
        },
        {
          title: 'Rockstar',
          year: 2011,
          colors: ['#dc2626', '#450a0a'],
          tracks: [
            { title: 'Kun Faya Kun', genre: 'Classical', lang: 'Hindi', type: 'Movie Song', bpm: 75, freq: 330, duration: 55, trackNo: 1 },
            { title: 'Nadaan Parindey', genre: 'Rock', lang: 'Hindi', type: 'Movie Song', bpm: 118, freq: 440, duration: 48, trackNo: 2 }
          ]
        }
      ]
    },
    {
      artist: 'Hans Zimmer',
      bio: 'Legendary film score composer and music producer pioneering colossal orchestral synthesis and immersive cinematic soundscapes.',
      monthlyListeners: 15800000,
      artistColors: ['#0284c7', '#1e1b4b'],
      icon: '🌌',
      albums: [
        {
          title: 'Interstellar Soundtrack',
          year: 2014,
          colors: ['#0f172a', '#38bdf8'],
          tracks: [
            { title: 'Cornfield Chase', genre: 'Cinematic', lang: 'Other', type: 'Instrumental', bpm: 104, freq: 440, duration: 60, trackNo: 1 },
            { title: 'No Time For Caution', genre: 'Cinematic', lang: 'Other', type: 'Instrumental', bpm: 136, freq: 392, duration: 58, trackNo: 2 },
            { title: 'Stay', genre: 'Cinematic', lang: 'Other', type: 'Instrumental', bpm: 70, freq: 293, duration: 50, trackNo: 3 }
          ]
        },
        {
          title: 'Dune: Part Two (Score)',
          year: 2024,
          colors: ['#d97706', '#78350f'],
          tracks: [
            { title: 'Paul Meets Gurney', genre: 'Cinematic', lang: 'Other', type: 'Instrumental', bpm: 90, freq: 311, duration: 42, trackNo: 1 },
            { title: 'A Time of Quiet Between the Storms', genre: 'Ambient', lang: 'Other', type: 'Instrumental', bpm: 68, freq: 370, duration: 52, trackNo: 2 }
          ]
        }
      ]
    },
    {
      artist: 'The Weeknd',
      bio: 'Canadian singer, songwriter, and record producer renowned for his genre-bending sonic versatility, dark lyricism, and retro-futuristic synth-pop anthems.',
      monthlyListeners: 98000000,
      artistColors: ['#be185d', '#831843'],
      icon: '⚡',
      albums: [
        {
          title: 'After Hours',
          year: 2020,
          colors: ['#991b1b', '#18181b'],
          tracks: [
            { title: 'Blinding Lights', genre: 'Electronic', lang: 'English', type: 'Single', bpm: 171, freq: 440, duration: 46, trackNo: 1 },
            { title: 'Save Your Tears', genre: 'Pop', lang: 'English', type: 'Album Track', bpm: 118, freq: 392, duration: 44, trackNo: 2 },
            { title: 'In Your Eyes', genre: 'Pop', lang: 'English', type: 'Album Track', bpm: 100, freq: 330, duration: 40, trackNo: 3 }
          ]
        }
      ]
    },
    {
      artist: 'Arijit Singh',
      bio: 'Regarded as one of the most versatile and celebrated playback vocalists in Indian cinema, dominating modern romantic ballads and soulful melodies.',
      monthlyListeners: 41000000,
      artistColors: ['#059669', '#064e3b'],
      icon: '🎤',
      albums: [
        {
          title: 'Soulful Ballads',
          year: 2023,
          colors: ['#10b981', '#047857'],
          tracks: [
            { title: 'Tum Hi Ho (Acoustic Redux)', genre: 'Melody', lang: 'Hindi', type: 'Acoustic', bpm: 78, freq: 415, duration: 48, trackNo: 1 },
            { title: 'Kesariya (Lover Edition)', genre: 'Pop', lang: 'Hindi', type: 'Movie Song', bpm: 92, freq: 466, duration: 45, trackNo: 2 },
            { title: 'Channa Mereya', genre: 'Melody', lang: 'Hindi', type: 'Movie Song', bpm: 80, freq: 349, duration: 50, trackNo: 3 }
          ]
        }
      ]
    },
    {
      artist: 'Ludovico Einaudi',
      bio: 'Italian pianist and composer producing meditative, minimalist neo-classical piano suites beloved by millions worldwide.',
      monthlyListeners: 7300000,
      artistColors: ['#0284c7', '#0369a1'],
      icon: '🎹',
      albums: [
        {
          title: 'Seven Days Walking',
          year: 2019,
          colors: ['#38bdf8', '#0284c7'],
          tracks: [
            { title: 'Nuvole Bianche (Modern)', genre: 'Classical', lang: 'Other', type: 'Instrumental', bpm: 66, freq: 261, duration: 54, trackNo: 1 },
            { title: 'Experience (Aura Edit)', genre: 'Classical', lang: 'Other', type: 'Instrumental', bpm: 96, freq: 440, duration: 52, trackNo: 2 }
          ]
        }
      ]
    },
    {
      artist: 'Taylor Swift',
      bio: 'Grammy Album of the Year record-setter, master songwriter, and pop-culture icon crossing country, synth-pop, and indie-folk landscapes.',
      monthlyListeners: 92000000,
      artistColors: ['#d946ef', '#86198f'],
      icon: '🌸',
      albums: [
        {
          title: '1989 (Sonora Edition)',
          year: 2023,
          colors: ['#06b6d4', '#0891b2'],
          tracks: [
            { title: 'Style', genre: 'Pop', lang: 'English', type: 'Album Track', bpm: 95, freq: 293, duration: 42, trackNo: 1 },
            { title: 'Blank Space', genre: 'Pop', lang: 'English', type: 'Single', bpm: 96, freq: 330, duration: 40, trackNo: 2 },
            { title: 'Wildest Dreams', genre: 'Pop', lang: 'English', type: 'Album Track', bpm: 140, freq: 370, duration: 44, trackNo: 3 }
          ]
        }
      ]
    },
    {
      artist: 'Sid Sriram',
      bio: 'Carnatic-trained contemporary vocalist known for ethereal high registers and groundbreaking cross-cultural South Indian movie anthems.',
      monthlyListeners: 9100000,
      artistColors: ['#8b5cf6', '#6d28d9'],
      icon: '🕊️',
      albums: [
        {
          title: 'Sid Sriram Live & Pure',
          year: 2023,
          colors: ['#c084fc', '#9333ea'],
          tracks: [
            { title: 'Srivalli (Soul Cut)', genre: 'Melody', lang: 'Telugu', type: 'Movie Song', bpm: 90, freq: 415, duration: 46, trackNo: 1 },
            { title: 'Maruvaarthai', genre: 'Melody', lang: 'Tamil', type: 'Movie Song', bpm: 84, freq: 440, duration: 50, trackNo: 2 },
            { title: 'Inkem Inkem', genre: 'Melody', lang: 'Telugu', type: 'Movie Song', bpm: 95, freq: 349, duration: 45, trackNo: 3 }
          ]
        }
      ]
    }
  ];

  let totalSongsAdded = 0;
  const adminUser = db.queryOne("SELECT id FROM users WHERE email = 'admin@sonora.io'");
  const demoUser = db.queryOne("SELECT id FROM users WHERE email = 'demo@sonora.io'");

  for (const artData of seedCatalog) {
    // 1. Artist Image & Entry
    const artistSlug = artData.artist.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const artistImgFileName = `artist_${artistSlug}.svg`;
    const artistImgPath = path.join(coversDir, artistImgFileName);
    fs.writeFileSync(
      artistImgPath,
      createArtworkSvg(artData.artist, 'Verified Artist', artData.artistColors[0], artData.artistColors[1], artData.icon)
    );

    let artistRow = db.queryOne('SELECT id FROM artists WHERE name = ?', [artData.artist]);
    let artistId;
    if (artistRow) {
      artistId = artistRow.id;
      db.execute(
        'UPDATE artists SET bio = ?, image_path = ?, monthly_listeners = ? WHERE id = ?',
        [artData.bio, `/storage/covers/${artistImgFileName}`, artData.monthlyListeners, artistId]
      );
    } else {
      const res = db.execute(
        'INSERT INTO artists (name, bio, image_path, monthly_listeners) VALUES (?, ?, ?, ?)',
        [artData.artist, artData.bio, `/storage/covers/${artistImgFileName}`, artData.monthlyListeners]
      );
      artistId = res.lastInsertRowid;
    }

    // 2. Albums & Tracks
    for (const albData of artData.albums) {
      const albumSlug = albData.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const albumCoverFileName = `album_${albumSlug}.svg`;
      const albumCoverPath = path.join(coversDir, albumCoverFileName);
      fs.writeFileSync(
        albumCoverPath,
        createArtworkSvg(albData.title, artData.artist, albData.colors[0], albData.colors[1], '💿')
      );

      let albumRow = db.queryOne('SELECT id FROM albums WHERE title = ? AND artist_id = ?', [albData.title, artistId]);
      let albumId;
      if (albumRow) {
        albumId = albumRow.id;
        db.execute(
          'UPDATE albums SET release_year = ?, cover_path = ?, total_tracks = ? WHERE id = ?',
          [albData.year, `/storage/covers/${albumCoverFileName}`, albData.tracks.length, albumId]
        );
      } else {
        const res = db.execute(
          'INSERT INTO albums (title, artist_id, release_year, cover_path, total_tracks) VALUES (?, ?, ?, ?, ?)',
          [albData.title, artistId, albData.year, `/storage/covers/${albumCoverFileName}`, albData.tracks.length]
        );
        albumId = res.lastInsertRowid;
      }

      // 3. Generate Audio WAV and Song Entry
      for (const track of albData.tracks) {
        const trackSlug = track.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const audioFileName = `${artistSlug}_${trackSlug}.wav`;
        const audioFilePath = path.join(musicDir, audioFileName);

        // Generate audio file if not exists
        if (!fs.existsSync(audioFilePath)) {
          const wavBuffer = createPlayableWavBuffer(track.duration, track.freq, track.bpm);
          fs.writeFileSync(audioFilePath, wavBuffer);
        }

        const stats = fs.statSync(audioFilePath);
        const hash = crypto.createHash('sha256').update(fs.readFileSync(audioFilePath)).digest('hex');

        const genreRow = db.queryOne('SELECT id FROM genres WHERE name = ?', [track.genre]);
        const langRow = db.queryOne('SELECT id FROM languages WHERE name = ?', [track.lang]);
        const typeRow = db.queryOne('SELECT id FROM song_types WHERE name = ?', [track.type]);

        const existingSong = db.queryOne('SELECT id FROM songs WHERE audio_path = ?', [audioFilePath]);
        let songId;
        const playCount = Math.floor(Math.random() * 45000) + 1200;

        if (existingSong) {
          songId = existingSong.id;
          db.execute(
            `UPDATE songs SET
              title = ?, artist_id = ?, album_id = ?, genre_id = ?, language_id = ?, song_type_id = ?,
              cover_path = ?, duration = ?, release_year = ?, track_number = ?, file_size = ?,
              file_hash = ?, bitrate = ?, format = ?, play_count = ?, is_public = 1
             WHERE id = ?`,
            [
              track.title,
              artistId,
              albumId,
              genreRow ? genreRow.id : 1,
              langRow ? langRow.id : 1,
              typeRow ? typeRow.id : 1,
              `/storage/covers/${albumCoverFileName}`,
              track.duration,
              albData.year,
              track.trackNo,
              stats.size,
              hash,
              352800,
              'wav',
              playCount,
              songId
            ]
          );
        } else {
          const res = db.execute(
            `INSERT INTO songs (
              title, artist_id, album_id, genre_id, language_id, song_type_id,
              audio_path, cover_path, duration, release_year, track_number,
              file_size, file_hash, bitrate, format, play_count, is_public
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              track.title,
              artistId,
              albumId,
              genreRow ? genreRow.id : 1,
              langRow ? langRow.id : 1,
              typeRow ? typeRow.id : 1,
              audioFilePath,
              `/storage/covers/${albumCoverFileName}`,
              track.duration,
              albData.year,
              track.trackNo,
              stats.size,
              hash,
              352800,
              'wav',
              playCount
            ]
          );
          songId = res.lastInsertRowid;
        }

        totalSongsAdded++;
      }
    }
  }

  // 4. Create Curated Playlists & Likes for Demo User
  console.log('👉 Creating User Playlists, Liked Songs & Playback History...');
  const allSongs = db.query('SELECT id, duration FROM songs ORDER BY id ASC');
  
  if (demoUser && allSongs.length > 0) {
    // Liked songs
    for (let i = 0; i < Math.min(allSongs.length, 6); i++) {
      const s = allSongs[i];
      if (!db.queryOne('SELECT id FROM liked_songs WHERE user_id = ? AND song_id = ?', [demoUser.id, s.id])) {
        db.execute('INSERT INTO liked_songs (user_id, song_id) VALUES (?, ?)', [demoUser.id, s.id]);
      }
    }

    // Playback position ("Continue Listening")
    if (allSongs[0]) {
      db.execute(
        `INSERT OR REPLACE INTO playback_positions (user_id, song_id, position_seconds, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [demoUser.id, allSongs[0].id, 18.5]
      );
    }
    if (allSongs[3]) {
      db.execute(
        `INSERT OR REPLACE INTO playback_positions (user_id, song_id, position_seconds, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [demoUser.id, allSongs[3].id, 24.0]
      );
    }

    // Listening history
    for (let i = 0; i < Math.min(allSongs.length, 8); i++) {
      db.execute(
        `INSERT INTO listening_history (user_id, song_id, duration_listened, played_at)
         VALUES (?, ?, ?, datetime('now', '-${i * 45} minutes'))`,
        [demoUser.id, allSongs[i].id, allSongs[i].duration]
      );
    }

    // Curated Playlist 1: Late Night Melodies
    const playlistCover1 = path.join(coversDir, 'playlist_latenight.svg');
    fs.writeFileSync(playlistCover1, createArtworkSvg('Late Night Melodies', 'Curated by Sonora', '#8b5cf6', '#3b82f6', '🌙'));

    let pl1 = db.queryOne("SELECT id FROM playlists WHERE user_id = ? AND title = 'Late Night Melodies'", [demoUser.id]);
    let pl1Id;
    if (!pl1) {
      const res = db.execute(
        `INSERT INTO playlists (user_id, title, description, cover_path)
         VALUES (?, 'Late Night Melodies', 'Calming acoustic chords, soulful melodies, and late night focus vibes.', '/storage/covers/playlist_latenight.svg')`,
        [demoUser.id]
      );
      pl1Id = res.lastInsertRowid;
      for (let pos = 0; pos < 4; pos++) {
        if (allSongs[pos]) {
          db.execute('INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)', [pl1Id, allSongs[pos].id, pos + 1]);
        }
      }
    }

    // Curated Playlist 2: High Octane Energy
    const playlistCover2 = path.join(coversDir, 'playlist_energy.svg');
    fs.writeFileSync(playlistCover2, createArtworkSvg('High Octane Energy', 'Curated by Sonora', '#ef4444', '#f59e0b', '⚡'));

    let pl2 = db.queryOne("SELECT id FROM playlists WHERE user_id = ? AND title = 'High Octane Energy'", [demoUser.id]);
    let pl2Id;
    if (!pl2) {
      const res = db.execute(
        `INSERT INTO playlists (user_id, title, description, cover_path)
         VALUES (?, 'High Octane Energy', 'High-energy soundtrack themes, chartbuster beats and adrenaline rhythms.', '/storage/covers/playlist_energy.svg')`,
        [demoUser.id]
      );
      pl2Id = res.lastInsertRowid;
      for (let pos = 4; pos < Math.min(allSongs.length, 9); pos++) {
        db.execute('INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)', [pl2Id, allSongs[pos].id, pos - 3]);
      }
    }
  }

  console.log(`✅ Seeding Complete! ${totalSongsAdded} playable tracks created and indexed.`);
}

// Execute directly if run via node
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().catch(console.error);
}
