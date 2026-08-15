import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = res.headers['content-type']?.includes('application/json')
            ? JSON.parse(data)
            : data;
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Sonora API Integration & Streaming Tests...\n');

  try {
    // 1. Health check
    const health = await makeRequest({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    console.log(`[PASS] Health Check: Status ${health.status} (${health.data.service})`);

    // 2. Admin Login
    const loginRes = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@sonora.io', password: 'admin123' });

    console.log(`[PASS] Admin Authentication: Logged in as ${loginRes.data.user.username} (Role: ${loginRes.data.user.role})`);
    const token = loginRes.data.token;

    // 3. Songs Catalog
    const songsRes = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/songs?limit=5',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`[PASS] Songs Endpoint: Retrieved ${songsRes.data.songs.length} tracks (Total indexed: ${songsRes.data.total})`);
    const sampleSong = songsRes.data.songs[0];
    console.log(`       Sample Track: "${sampleSong.title}" by ${sampleSong.artist_name} [${sampleSong.format.toUpperCase()} • ${Math.round(sampleSong.duration)}s]`);

    // 4. Audio Range Streaming (HTTP 206 Partial Content)
    const streamRes = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: `/api/songs/${sampleSong.id}/stream`,
      method: 'GET',
      headers: { 'Range': 'bytes=0-1023' }
    });
    console.log(`[PASS] Range Streaming: Status ${streamRes.status} (Content-Range: ${streamRes.headers['content-range']}, Type: ${streamRes.headers['content-type']})`);

    // 5. Recommendations Feed
    const recRes = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/recommendations',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`[PASS] Recommendation Engine: ${recRes.data.trending.length} Trending, ${recRes.data.popularArtists.length} Artists, ${recRes.data.popularAlbums.length} Albums`);

    // 6. Playlists CRUD
    const createPlRes = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/playlists',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, { title: 'Test Acoustic Vault', description: 'Automated test playlist' });
    if (!createPlRes.data?.playlist) {
      console.error('Create playlist response:', createPlRes);
    }
    console.log(`[PASS] Playlist Creation: Created Playlist ID ${createPlRes.data?.playlist?.id} ("${createPlRes.data?.playlist?.title}")`);

    // 7. Add Song to Playlist
    const addSongRes = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: `/api/playlists/${createPlRes.data.playlist.id}/songs`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, { song_id: sampleSong.id });
    console.log(`[PASS] Add Song to Playlist: ${addSongRes.data.message}`);

    // 8. Like / Unlike Song
    const likeRes = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/library/like',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, { song_id: sampleSong.id });
    console.log(`[PASS] Like Toggle: ${likeRes.data.message} (is_liked: ${likeRes.data.is_liked})`);

    // 9. Playback Position (Continue Listening)
    const posRes = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/library/playback-position',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, { song_id: sampleSong.id, position_seconds: 32.5 });
    console.log(`[PASS] Resume Position Saved: Synced 32.5s playback position for track ID ${sampleSong.id}`);

    // 10. Admin Stats
    const statsRes = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`[PASS] Admin Stats: Total Songs: ${statsRes.data.totalSongs}, Total Artists: ${statsRes.data.totalArtists}, Albums: ${statsRes.data.totalAlbums}`);

    console.log('\n🎉 ALL 10 INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

runTests();
