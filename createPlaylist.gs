

function createPlaylist(topTracks) {
    const accessToken = PropertiesService.getScriptProperties().getProperty('access_token');

    const currentDate = new Date();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const playlistName = `${monthNames[currentDate.getMonth()-1]} ${currentDate.getFullYear()} vibes`;
  
    // Crear la playlist
    const createPlaylistResponse = UrlFetchApp.fetch(`https://api.spotify.com/v1/users/${USER_ID}/playlists`, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      payload: JSON.stringify({
        name: playlistName,
        description: "",
        public: false
      })
    });
  
    const playlist = JSON.parse(createPlaylistResponse.getContentText());
    const playlistId = playlist.id;
    // Agregar canciones a la playlist
    const trackUris = topTracks.top.map(track => "spotify:track:"+track.id);
    const addTracksResponse = UrlFetchApp.fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      payload: JSON.stringify({
        uris: trackUris
      })
    });
    Logger.log(playlistId);
    return playlistId;
    
  }
  
  
  function createMonthlyPlaylist(topTracks){
    createPlaylist(topTracks);
  }