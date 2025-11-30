// Obtener el historial de canciones reproducidas
function getRecentlyPlayedTracks() {
    refreshAccessToken();
    const access_token = PropertiesService.getScriptProperties().getProperty('access_token');
    
    const url = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';
  
    const options = {
      'method': 'get',
      'headers': {
        'Authorization': 'Bearer ' + access_token
      }
    };
  
    const response = UrlFetchApp.fetch(url, options);
    const data = JSON.parse(response.getContentText());
  
    return data.items;
}

// Guardar el historial de canciones reproducidas en una hoja de cálculo
function saveRecentlyPlayedTracks() {

    const tracks = getRecentlyPlayedTracks();
    tracks.reverse();

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("data");

    if(sheet.getLastRow() == 0){
      sheet.appendRow(['time', 'id', 'name', 'artist', 'album', 'albumId', 'duration']);
    }

    // Obtener las primeras 100 filas de la hoja
    const numRows = Math.min(100, sheet.getLastRow());
    const existingTracksRange = sheet.getRange(2, 1, numRows, sheet.getLastColumn());
    const existingTracks = existingTracksRange.getValues();
    let i = 0;
    tracks.forEach(function(track) {
      const trackInfo = track.track;
      const playedAt = new Date(track.played_at);
      const trackName = trackInfo.name;
      const artists = trackInfo.artists.map(artist => artist.name).join(', ');
      const albumName = trackInfo.album.name;
      const albumId = trackInfo.album.id;
      const duration = trackInfo.duration_ms;
      const id = trackInfo.id;
      const artistsIds = trackInfo.artists.map(artist => artist.id).join(',');
  
      // Comprobar si la canción ya está guardada en las últimas 50 filas
      const isDuplicate = existingTracks.some(row => {
        const existingDate = new Date(row[0]);
        const existingTrackId = row[1];
        return playedAt.getTime() === existingDate.getTime() && id === existingTrackId;
      });
  
      if (!isDuplicate) {
        sheet.insertRowBefore(2);
        sheet.getRange(2, 1, 1, 8).setValues([[playedAt,id, trackName, artists, albumName,albumId, duration, artistsIds]]);
        i++;
      }
    });
    Logger.log('Canciones escuchadas: ' + i);
  }

  /*function ids(){
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("data");

    const data = sheet.getDataRange().getValues(); // Obtener el rango de datos de la hoja de cálculo
    refreshAccessToken();
    let access_token = PropertiesService.getScriptProperties().getProperty('access_token');
    for(let i = 9181; i<10000; i++){
    
    let id = data[i][1];
    
    // Hacer una solicitud GET a la API de Spotify para obtener los detalles del 
      let response = UrlFetchApp.fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        headers: {
          Authorization: 'Bearer ' + access_token // Reemplaza YOUR_ACCESS_TOKEN con tu token de acceso de Spotify
        }
      });
  
    // Convertir la respuesta a un objeto JSON
    let responseData = JSON.parse(response.getContentText());
  
    let artistsIds = responseData.artists.map(artist => artist.id).join(',');
    let cell = "H" + (i+1);
    //Logger.log(cell);
    sheet.getRange(cell).setValue(artistsIds);
  
    Utilities.sleep(300);
    //const name = responseData.name;
    }
  }*/

  function ordenarPorFecha() {
    //const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("data");

    const range = sheet.getDataRange(); // Obtener el rango de datos de la hoja de cálculo
    const columnToSortBy = 1; // Número de la columna de fechas (por ejemplo, columna A)
  
    range.sort([{column: columnToSortBy, ascending: false}]); // Ordenar por la columna de fechas de forma descendente
  }

  function compareAndCleanRows() {
    //const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("data");
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const timeCol = headers.indexOf("time");
    const songCol = headers.indexOf("id");
    const durationCol = headers.indexOf("duration");

    if (timeCol === -1 || songCol === -1 || durationCol === -1) {
      throw new Error("Las columnas 'Time', 'Cancion' o 'Duracion' no existen en la hoja.");
    }

    // Convertir Time a formato de tiempo (milisegundos desde epoch)
    for (let i = 1; i < data.length; i++) {
      if (typeof data[i][timeCol] === 'string') {
        data[i][timeCol] = new Date(data[i][timeCol]).getTime();
      }
    }

    // Iterar sobre las filas para comparar y eliminar según las condiciones
    //const numRowsToCheck = data.length /3;
    const numRowsToCheck = Math.min(data.length - 1, 1000);
    let rowsToDelete = [];
    for (let i = 1; i < numRowsToCheck; i++) {
      const time1 = data[i][timeCol];
      const song1 = data[i][songCol];
      const duration1 = data[i][durationCol];

      const time2 = data[i + 1][timeCol];
      const song2 = data[i + 1][songCol];
      const duration2 = data[i + 1][durationCol];


      if (song1 === song2 && ((time1-time2) < duration1*1,5 || (time1-time2) > duration1*1,5)) {
        rowsToDelete.push(i + 1); // La fila en la hoja comienza desde 1 y no desde 0
      }
    }

    // Eliminar las filas desde el final para evitar problemas de reindexación
    rowsToDelete.reverse().forEach(row => {
      sheet.deleteRow(row);
      //Logger.log(row)
    });

    Logger.log(`Se han eliminado ${rowsToDelete.length} filas.`);
  }
