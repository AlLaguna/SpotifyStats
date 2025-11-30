function getTopArtists(number, timeAgo){

    // Cambia 'URL_DEL_ARCHIVO_EXCEL' por la URL de tu archivo de Excel
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("data");
  
    // Obtener los datos de la hoja
    const data = sheet.getDataRange().getValues();
  
    // Filtrar los datos para obtener solo las canciones de esta semana
    const today = new Date();

    if(timeAgo == 'semana'){
        timeAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    }else if(timeAgo == 'mes'){
        timeAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    }
    else if(timeAgo == 'anio'){
       timeAgo = new Date(today.getFullYear()-1, today.getMonth(), today.getDate());
    }
    else if(timeAgo == 'custom'){ //Resumen anual
        timeAgo = new Date(today.getFullYear(), today.getMonth() - (12-mes), today.getDate());
    }

    const filteredData = data.filter(row => new Date(row[0]) >= timeAgo);
  
    const artistCounts = {};
    filteredData.forEach(row => {
      const artists = row[3]; // Suponiendo que el nombre del artista está en la tercera columna
      const ids = row[7];

      if (artists && ids) {
        // Separar los artistas por ", "
        const artistList = artists.toString().split(", ");
        const idList = ids.toString().split(",");
        
        for(let i = 0; i< artistList.length; i++){
          let key = `${artistList[i]} == ${idList[i]}`;
          artistCounts[key] = (artistCounts[key] || 0) + 1;
        }
      }
    });

    const sortedArtists = Object.keys(artistCounts).sort((a, b) => {
    const dif = artistCounts[b] - artistCounts[a];
    if (dif !== 0) return dif;
    // Si el número de plays es igual, devolver aleatorio (-1, 0, 1)
    return Math.random() < 0.5 ? -1 : 1;
    
});
  
    // Obtener los artistas más escuchados
    const topArtists = sortedArtists.slice(0, number).map(artist => {
        const [name, id] = artist.split(" == ");
        
        return { artist: name, id: id, plays: artistCounts[artist]};
    });
    return topArtists;
  }

function printTopTracks(){

  console.log(getTopArtists(50,'anio'));
}

//number: numero de canciones a mostrar
//type: 'semana', 'mes', 'anio', 'custom'
function getTopTracks(number, type, mes){
    saveRecentlyPlayedTracks();
   
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("data");

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

    // Contar las reproducciones de cada canción
    let playCounts = {};
    let s = 0;
    filteredData.forEach(row => {
        const id = row[1];
        const albumId = row[5];
        const song = row[2]; // Suponiendo que el nombre de la canción está en la segunda columna
        const artist = row[3];
        const key = `${id} == ${song} --- ${artist} // ${albumId}`;
        playCounts[key] = (playCounts[key] || 0) + 1;
        s = s + row[6]/1000;
    });

    //const sortedSongs = Object.keys(playCounts).sort((a, b) => playCounts[b] - playCounts[a]);
    const sortedSongs = Object.keys(playCounts).sort((a, b) => {
    const dif = playCounts[b] - playCounts[a];
    if (dif !== 0) return dif;
    // Si el número de plays es igual, devolver aleatorio (-1, 0, 1)
    return Math.random() < 0.5 ? -1 : 1;
});

    // Obtener el top 'number' con el número de escuchas
    const top = sortedSongs.slice(0, number).map(song => {
        const [temp, album] = song.split(" // ")
        const [name, artist] = temp.split(" --- ");
        const [id, nombre] = name.split(" == ");
        
        return { name: nombre, artist: artist, plays: playCounts[song], id: id, albumId: album};
    });
    return {top:top, s:s, totalSongs: filteredData.length};

}
