// Code.gs
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('Spotify Top Tracks Dashboard');
}

function getWeeklySongs() {
  const data = getTopTracks(50, 'semana', new Date().getMonth() + 1);
  return {
    items: processSongs(data.top),
    total: data.totalSongs
  };
}

function getWeeklyArtists() {
  let today = new Date();
  const data = getTopArtists(50, 'semana');
  return {
    items: processArtists(data),
  };
}

function getMonthlySongs() {
  const data = getTopTracks(50, 'mes', new Date().getMonth() + 1);
  return {
    items: processSongs(data.top),
    total: data.totalSongs
  };
}

function getMonthlyArtists() {
  let today = new Date();
  const data = getTopArtists(50, 'mes');
  return {
    items: processArtists(data),
  };
}

// Shared processing functions
function processSongs(tracks) {
  return tracks.map(track => ({
    name: track.name,
    artist: track.artist,
    count: track.plays,
    coverUrl: getCover(track.albumId, "albums")
  }));
}

function processArtists(artists) {
  // Implement your artist processing logic
  return artists.map(artist => ({
    name: artist.artist,
    count: artist.plays,
    coverUrl: getCover(artist.id, "artists")
  }));
}
