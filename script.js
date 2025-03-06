// Spotify API credentials
const clientId = 'a984077fdcb74daa92e1037a3491f8f5';
const clientSecret = '691f40f6f63c4bdab9c5c986d636296f';
let accessToken = '';

// Get access token
function getToken() {
    const authHeader = 'Basic ' + btoa(clientId + ':' + clientSecret);
    fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authHeader
            },
            body: 'grant_type=client_credentials'
        })
        .then(response => response.json())
        .then(data => {
            if (data.access_token) {
                accessToken = data.access_token;
                document.getElementById('tokenStatus').textContent = 'Connected';
                document.getElementById('searchSection').style.display = 'flex';
                getTopTracks();
            }
        })
        .catch(error => {
            document.getElementById('tokenStatus').textContent = 'Connection failed';
        });
}

// Get top tracks
function getTopTracks() {
    fetch('https://api.spotify.com/v1/search?q=year:2024&type=track&limit=10&sort=popularity', {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        })
        .then(response => response.json())
        .then(data => {
            const topTracksDiv = document.getElementById('topTracks');
            topTracksDiv.innerHTML = '';

            data.tracks.items.sort((a, b) => b.popularity - a.popularity)
                .forEach(track => {
                    topTracksDiv.appendChild(createTrackElement(track, true));
                });
        });
}

// Search tracks
function searchTracks(query) {
    fetch('https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=track&limit=10', {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        })
        .then(response => response.json())
        .then(data => displayResults(data));
}

// Create track element
function createTrackElement(track, isTopTrack = false) {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'track-item';
    trackDiv.innerHTML = `
    <img src="${track.album.images[0].url}" 
         alt="${track.album.name}" 
         class="album-art">
    <div class="track-info">
      <strong>${track.name}</strong>
      <p>${track.artists.map(a => a.name).join(', ')}</p>
      ${isTopTrack ? `<small>Popularity: ${track.popularity}</small>` : ''}
    </div>
  `;
  trackDiv.addEventListener('click', () => playTrack(track.id, track));
  return trackDiv;
}

// Display results
function displayResults(data) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  data.tracks.items.forEach(track => {
    resultsDiv.appendChild(createTrackElement(track));
  });
}

// Play track
function playTrack(trackId, trackData) {
  const nowPlayingDiv = document.getElementById('nowPlaying');
  nowPlayingDiv.innerHTML = `
    <div class="now-playing">
      <img src="${trackData.album.images[0].url}" 
           class="now-playing-art" 
           alt="Now playing">
      <div>
        <h3>${trackData.name}</h3>
        <p>${trackData.artists.map(a => a.name).join(', ')}</p>
      </div>
      <iframe src="https://open.spotify.com/embed/track/${trackId}" 
              class="player-iframe"
              allowtransparency="true" 
              allow="encrypted-media">
      </iframe>
    </div>
  `;
}

// Event listeners
document.getElementById('getTokenBtn').addEventListener('click', getToken);

document.getElementById('searchBtn').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value;
  if (query) searchTracks(query);
});

// Enter key for search
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('searchBtn').click();
});