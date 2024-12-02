


function getTopArtists(number = 5, timeAgo = new Date(new Date().getFullYear(), new Date().getMonth()-1, new Date().getDate())){

    // Cambia 'URL_DEL_ARCHIVO_EXCEL' por la URL de tu archivo de Excel
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  
    // Obtener los datos de la hoja
    const data = sheet.getDataRange().getValues();
  
    // Filtrar los datos para obtener solo las canciones de esta semana
    const today = new Date();
    const filteredData = data.filter(row => new Date(row[0]) >= timeAgo);
  
    const artistCounts = {};
    filteredData.forEach(row => {
      const artists = row[3]; // Suponiendo que el nombre del artista está en la tercera columna
      if (artists) {
        // Separar los artistas por ", "
        const artistList = artists.toString().split(", ");
        artistList.forEach(artist => {
          artistCounts[artist] = (artistCounts[artist] || 0) + 1;
        });
      }
    });
  
    const sortedArtists = Object.keys(artistCounts).map(artist => {
      return { artist: artist, plays: artistCounts[artist] };
    }).sort((a, b) => b.plays - a.plays);
  
    // Obtener los artistas más escuchados
    const topArtists = sortedArtists.slice(0, number); // Puedes cambiar el número de artistas según necesites
  
    return topArtists;
  
  }


//number: numero de canciones a mostrar
//type: 'semana', 'mes'
function getTopTracks(number=50, type='mes'){
    saveRecentlyPlayedTracks();
    ordenarPorFecha();

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

    // Obtener los datos de la hoja
    const data = sheet.getDataRange().getValues();

    // Filtrar los datos para obtener solo las canciones de esta semana
    const today = new Date();
    if(type == 'semana'){
        timeAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    }else if(type == 'mes'){
        timeAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    }


    const filteredData = data.filter(row => new Date(row[0]) >= timeAgo);

    // Contar las reproducciones de cada canción
    const playCounts = {};
    let ms = 0;
    filteredData.forEach(row => {
        const id = row[1];
        const song = row[2]; // Suponiendo que el nombre de la canción está en la segunda columna
        const artist = row[3];
        const key = `${id} == ${song} --- ${artist}`;
        playCounts[key] = (playCounts[key] || 0) + 1;
        ms = ms + row[6];
    });

    const sortedSongs = Object.keys(playCounts).sort((a, b) => playCounts[b] - playCounts[a]);

    // Obtener el top 'number' con el número de escuchas
    const top = sortedSongs.slice(0, number).map(song => {
        const [name, artist] = song.split(" --- ");
        const [id, nombre] = name.split(" == ");
        return { name: nombre, artist: artist, plays: playCounts[song], id: id};
    });

    return {top:top, ms:ms};

}