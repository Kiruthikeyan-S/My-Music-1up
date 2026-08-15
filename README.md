# 🎵 Sonora - High-Fidelity Music Vault & Streaming Studio

**Sonora** is a modern, full-stack personal music library and high-fidelity streaming web application. It enables administrators to import large local music directories, automatically extract ID3 tags and embedded cover artwork, detect duplicates using content hashing, categorize tracks across artists, albums, genres, languages, and song types, and stream audio smoothly with range-aware seeking and continuous queue progression.

---

## 🌟 Key Features

### 1. Automatic Folder Indexing & Metadata Scanner
- **Multi-Format Support**: Scans `.mp3`, `.wav`, `.flac`, `.m4a`, `.aac`, `.ogg`, `.opus`.
- **Deep Tag Extraction**: Automatically extracts Title, Artist, Album, Year, Track #, Bitrate, Duration, and embedded album art pictures using `music-metadata`.
- **Automatic Relationship Mapping**: Generates missing Artist and Album records automatically without manual DB inserts.
- **SHA-256 Duplicate Detection**: Prevents indexing duplicate audio files by computing unique content checksums.
- **Live Progress Reporting**: Real-time progress bar tracking total files scanned, imported count, duplicates, and missing metadata.

### 2. Persistent Audio Engine & Streaming Player
- **Continuous Playback**: Music keeps playing without interruption while navigating across all routes.
- **HTTP 206 Partial Content**: Stream endpoint supports `Accept-Ranges: bytes` for instant scrubbing and rapid buffering.
- **Dynamic Waveform Visualizer**: Real-time animated canvas responsive to audio frequency states.
- **Complete Playback Controls**: Shuffle (Fisher-Yates), Repeat (Off / All / One), Playback Speeds (0.75x, 1x, 1.25x, 1.5x, 2x), and Volume/Mute controls.
- **Interactive Queue Drawer**: Slide-out queue with drag/reordering, "Play Next", remove track, and clear queue.
- **Fullscreen Mobile Player**: Touch-friendly player with oversized artwork, scrubber, and drawer shortcuts.

### 3. Smart Discoverability & Library
- **Personalized Recommendations**: "Recommended For You", "Because You Listened To...", "Similar Songs", and "Trending Anthems".
- **Continue Listening**: Automatically tracks playback position every 5 seconds to resume songs exactly where you stopped.
- **Liked Songs Vault**: 1-click favoriting, dedicated collection header, and shuffle play.
- **Custom Playlists**: Create, edit descriptions, reorder songs, and custom artwork covers.
- **Global Search**: Debounced live search across Songs, Artists, Albums, and Playlists.
- **Explore Matrix**: Filter songs by 13+ Genres, 9+ Languages (Tamil, English, Hindi, Telugu, Malayalam, etc.), and 9+ Song Types.

### 4. Admin Control Studio
- **Music Folder Importer**: Directory path scanner with live progress bar and completion summary.
- **Review Missing Metadata**: Staging table flagging incomplete tags with inline tag editor before and after publishing.
- **Duplicate Audio Inspector**: Side-by-side duplicate audio comparison with 1-click resolution.
- **Catalog Management**: Searchable catalog with batch checkbox selection & bulk tag updates.
- **System Analytics**: Real-time stats on total tracks, storage footprint, top played tracks, and audience distribution.

---

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd server
npm install
npm run seed     # Generates demo audio pack and initializes database
npm start        # Runs Express API on http://localhost:5000
```

### 2. Start the Frontend Web App
```bash
cd client
npm install
npm run dev      # Launches Vite app on http://localhost:3000
```

### 3. Demo Accounts
- **Administrator**: `admin@sonora.io` / `admin123` (or click **"Demo Admin"** button in Navbar / Login)
- **Standard Listener**: `demo@sonora.io` / `user123` (or click **"Demo User"** button)

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite 6, React Router 7, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express.js, `sql.js` (WebAssembly SQLite with zero native compile friction), `music-metadata`, `jsonwebtoken`, `bcryptjs`
- **Audio**: HTML5 Audio API + Canvas Visualizer + HTTP Range Byte-Streamer
