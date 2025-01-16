function getTopArtists(number, timeAgo){

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
//type: 'semana', 'mes', 'anio', 'custom'
function getTopTracks(number, type, mes){
  saveRecentlyPlayedTracks();
  ordenarPorFecha();
  compareAndCleanRows() 

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
  else if(type == 'anio'){
     timeAgo = new Date(today.getFullYear()-1, today.getMonth(), today.getDate());
  }
  else if(type == 'custom'){ //Resumen anual
      timeAgo = new Date(today.getFullYear(), today.getMonth() - (12-mes), today.getDate());
  }


  let filteredData = data.filter(row => new Date(row[0]) >= timeAgo);
  //filtrar por las canciones que tengan id
  filteredData = filteredData.filter(row => row[1] != '');

  // Contar las reproducciones de cada canción
  const playCounts = {};
  let s = 0;
  filteredData.forEach(row => {
      const id = row[1];
      const song = row[2]; // Suponiendo que el nombre de la canción está en la segunda columna
      const artist = row[3];
      const key = `${id} == ${song} --- ${artist}`;
      playCounts[key] = (playCounts[key] || 0) + 1;
      s = s + row[6]/1000;
  });

  const sortedSongs = Object.keys(playCounts).sort((a, b) => playCounts[b] - playCounts[a]);

  // Obtener el top 'number' con el número de escuchas
  const top = sortedSongs.slice(0, number).map(song => {
      const [name, artist] = song.split(" --- ");
      const [id, nombre] = name.split(" == ");
      return { name: nombre, artist: artist, plays: playCounts[song], id: id};
  });

  return {top:top, s:s};

}