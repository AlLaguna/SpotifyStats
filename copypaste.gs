
    //1. Crear un nuevo proyecto en Google Apps Script
    //2. Copiar y pega todos los códigos en el editor de Google Apps Script
    //3. Rellenar CLIENT_ID y CLIENT_SECRET con los valores de tu aplicación de Spotify. Puedes obtener estos valores registrando tu aplicación en https://developer.spotify.com/dashboard/applications
    //4. Implementar en el menú "Implementar" -> "Nueva implementación" -> "Seleccionar Tipo" -> "Aplicación Web" -> "Implementar"
    //5. Rellena REDIRECT_URI con la URL de tu proyecto de Google Apps Script. Puedes encontrar esta URL en "Implementar" -> "Implementaciones de prueba" (debe acabar en /dev). 
    //6. Pon la URL de tu proyecto también en la linea 62. (No sé porque sino no funciona)
    //7. Copia la REDIRECT_URI y pégala en la configuración de tu aplicación de Spotify en la sección "Redirect URIs".
    //8. Ejecuta la función authorize() en la consola de Google Apps Script. Esto te proporcionará una URL de autorización que debes visitar para autorizar la aplicación.
    //9. Ejecuta la funcion exchangeCodeForTokens() en la consola de Google Apps Script después de autorizar la aplicación. Esto intercambiará el código de autorización por tokens de acceso y actualización.

    //10. En la pestaña "Servicios", añade "Google Sheets API". 
    //11. En la pestaña "Servicios avanzados", activa "Google Sheets API".
    //12. Crea una hoja de calculo en tu Google Drive y copia el ID (https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit) de la hoja de cálculo en la variable SPREADSHEET_ID

    //13. En la pestaña "Activadores", crea los siguientes:
    // - Función: "sendMonthlyTopTracksEmail" | Evento: "Según Tiempo" | Tipo de activador basado en la hora: "Mes" | Día del mes: "1" | Hora: "00-01" (Puedes elegir el día y la hora que quieras)
    // - Función: "sendWeeklyTopTracksEmail" | Evento: "Según Tiempo" | Tipo de activador basado en la hora: "Semana" | Día de la semana: "Domingo" | Hora: "21-22" (Puedes elegir el día y la hora que quieras)
    // - Función: "saveRecentlyPlayedTracks" | Evento: "Según Tiempo" | Tipo de activador basado en la hora: "Hora" | "Intervalo de tiempo": "Cada hora" (Esto guardará las canciones escuchadas recientemente en la hoja de cálculo)

    //RELLENA CON LOS DATOS CORRESPONDIENTES
    const CLIENT_ID = 'REDACTED'; //API Spotify
    const CLIENT_SECRET = 'REDACTED'; //API Spotify
    const REDIRECT_URI = 'https://script.google.com/macros/s/REDACTED/dev';
    const EMAIL = 'REDACTED@email.com'; // Cambiar por tu email
    const USER_ID = 'REDACTED'; // Reemplaza con tu ID de usuario de Spotify. https://www.spotify.com/account/profile/ -> "Username"
    const SPREADSHEET_ID = 'REDACTED'; // Reemplaza con el ID de tu hoja de cálculo
    
    // Paso 1: Obtener la URL de autorización y dirigir al usuario a ella
    function authorize() {
      const scopes = 'user-read-recently-played playlist-modify-public playlist-modify-private user-top-read';
      const url = 'https://accounts.spotify.com/authorize' +
                  '?response_type=code' +
                  '&client_id=' + encodeURIComponent(CLIENT_ID) +
                  '&scope=' + encodeURIComponent(scopes) +
                  '&redirect_uri=' + encodeURIComponent(REDIRECT_URI);
    
      Logger.log('Visita la siguiente URL para autorizar la aplicación:');
      Logger.log(url);
    }
    
    // Paso 2: Manejar el callback y almacenar tokens
    function doGet(e) {
      const code = e.parameter.code;
      if (code) {
        //exchangeCodeForTokens(code);
        PropertiesService.getScriptProperties().setProperties({
            'code': code,
          });
        return HtmlService.createHtmlOutput('Authorization successful. Ejecuta la función exchangeCodeForTokens');
      }
      return HtmlService.createHtmlOutput('Missing authorization code.');
    }
    
    
    // Intercambiar el código de autorización por tokens
    function exchangeCodeForTokens() {
      const url = 'https://accounts.spotify.com/api/token';
      const payload = {
        'grant_type': 'authorization_code',
        'code':PropertiesService.getScriptProperties().getProperty('code'),
        'redirect_uri': 'https://script.google.com/macros/s/REDACTED/dev',
        'client_id': encodeURIComponent(CLIENT_ID),
        'client_secret': encodeURIComponent(CLIENT_SECRET)  };
    
      const options = {
        'method': 'post',
        'Content-Type': 'application/x-www-form-urlencoded',
        'payload': payload
      };
      
      const response = UrlFetchApp.fetch(url, options);
      const result = JSON.parse(response.getContentText());
    
      // Guardar tokens de forma segura
      PropertiesService.getScriptProperties().setProperties({
        'access_token': result.access_token,
        'refresh_token': result.refresh_token
      });
    }
    
    // Refrescar el token de acceso
    function refreshAccessToken() {
      const refresh_token = PropertiesService.getScriptProperties().getProperty('refresh_token');
    
      const url = 'https://accounts.spotify.com/api/token';
      const payload = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': encodeURIComponent(CLIENT_ID),
        'client_secret': encodeURIComponent(CLIENT_SECRET)
      };
    
      const options = {
        'method': 'post',
        'payload': payload
      };
    
      const response = UrlFetchApp.fetch(url, options);
      const result = JSON.parse(response.getContentText());
    
      // Actualizar el token de acceso
      PropertiesService.getScriptProperties().setProperty('access_token', result.access_token);
    
      // Actualizar el token de actualización si se proporciona uno nuevo
      if (result.refresh_token) {
        PropertiesService.getScriptProperties().setProperty('refresh_token', result.refresh_token);
      }
    }

    

function createPlaylist(topTracks, name) {
    const accessToken = PropertiesService.getScriptProperties().getProperty('access_token');
  
    // Crear la playlist
    const createPlaylistResponse = UrlFetchApp.fetch(`https://api.spotify.com/v1/users/${USER_ID}/playlists`, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      payload: JSON.stringify({
        name: name,
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
    const currentDate = new Date();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const playlistName = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()} vibes`;
    createPlaylist(topTracks, playlistName);
  }

  function createYearlyPlaylist(topTracks){
    const currentDate = new Date();
    const playlistName = `Top ${currentDate.getFullYear()} vibes`;
    createPlaylist(topTracks, playlistName);
  }

  


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
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  
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

    // Comprobar si la canción ya está guardada en las últimas 50 filas
    const isDuplicate = existingTracks.some(row => {
      const existingDate = new Date(row[0]);
      const existingTrackId = row[1];
      return playedAt.getTime() === existingDate.getTime() && id === existingTrackId;
    });

    if (!isDuplicate) {
      sheet.insertRowBefore(2);
      sheet.getRange(2, 1, 1, 7).setValues([[playedAt,id, trackName, artists, albumName,albumId, duration]]);
      i++;
    }
  });
  Logger.log('Canciones escuchadas: ' + i);
}

function ordenarPorFecha() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const range = sheet.getDataRange(); // Obtener el rango de datos de la hoja de cálculo
  const columnToSortBy = 1; // Número de la columna de fechas (por ejemplo, columna A)

  range.sort([{column: columnToSortBy, ascending: false}]); // Ordenar por la columna de fechas de forma descendente
}

function compareAndCleanRows() {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
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
    const numRowsToCheck = Math.min(data.length - 1, 1000);
    let rowsToDelete = [];
    for (let i = 1; i < numRowsToCheck; i++) {
      const time1 = data[i][timeCol];
      const song1 = data[i][songCol];
      const duration1 = data[i][durationCol];

      const time2 = data[i + 1][timeCol];
      const song2 = data[i + 1][songCol];
      const duration2 = data[i + 1][durationCol];

      if (song1 === song2 && (time1 - time2) > duration2 * 2) {
        rowsToDelete.push(i + 1); // La fila en la hoja comienza desde 1 y no desde 0
      }
    }

    // Eliminar las filas desde el final para evitar problemas de reindexación
    rowsToDelete.reverse().forEach(row => {
      sheet.deleteRow(row);
    });

    Logger.log(`Se han eliminado ${rowsToDelete.length} filas.`);
  }


function convertSecondsToHoursAndMinutes(seconds) {
  // Calcular las horas
  const hours = Math.floor(seconds / (60 * 60));
  
  // Calcular los minutos restantes después de restar las horas
  const remainingSeconds = seconds % (60 * 60);
  const minutes = Math.floor(remainingSeconds / (60));
  
  return { hours: hours, minutes: minutes };
}

function sendEmail(subject, emailBody, inlineImages = {}) {
  const recipient = EMAIL; // Cambia esto al destinatario deseado
   const htmlBody = `<!DOCTYPE html><html><body>${emailBody}</body></html>`; // Envuelve el cuerpo del correo electrónico en las etiquetas HTML

  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    htmlBody: htmlBody,
    inlineImages: inlineImages
  });

  Logger.log('Correo electrónico enviado exitosamente.');
}

function sendWeeklyTopTracksEmail() {

  const topTracks = getTopTracks(10, 'semana');
  const inlineImages = {};
  const seconds = topTracks.s; // Ejemplo: 150000 milisegundos
  const time = convertSecondsToHoursAndMinutes(seconds);
  console.log(time.hours + " horas y " + time.minutes + " minutos");

  let emailBody = '<h1>Esta semana has escuchado ' + time.hours + " horas y " + time.minutes + ' minutos</h1><br><h1>Top Artistas</h1>';

  const today = new Date();
  topArtists = getTopArtists(5, new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
   topArtists.forEach((artistData, index) => {
    emailBody += `<h2>${index + 1}. ${artistData.artist}: ${artistData.plays} reproducciones</h2>`;
  });

  emailBody += '<br><h1>Top Canciones</h1>';

  top10 = topTracks.top

  top10.forEach((track, index) => {
    emailBody += `<h2>${index+1}. ${top10[index].name} | ${top10[index].artist} : ${top10[index].plays} escuchas</h2>`;

    if(index < 5){
      emailBody += `<img src="cid:cover_${index}" alt="${track.name}"><br><br>`; // Agregar la imagen de la portada

      const imageUrl = getAlbumCover(top10[index].id);
      const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob().setName(`cover_${index}`);
      inlineImages[`cover_${index}`] = imageBlob;
    }
  });

  sendEmail(`Top Semanal`, emailBody, inlineImages);
}


function sendMonthlyTopTracksEmail() {

  const topTracks = getTopTracks(50, 'mes');
  const inlineImages = {};
  const seconds = topTracks.s; // Ejemplo: 150000 milisegundos
  const time = convertSecondsToHoursAndMinutes(seconds);
  console.log(time.hours + " horas y " + time.minutes + " minutos");

  let emailBody = '<h1>Este mes has escuchado ' + time.hours + " horas y " + time.minutes + ' minutos</h1><br><h1>Top Artistas</h1>';

  const today = new Date();
  topArtists = getTopArtists(5, new Date(today.getFullYear(), today.getMonth()-1, today.getDate()));
   topArtists.forEach((artistData, index) => {
    emailBody += `<h2>${index + 1}. ${artistData.artist}: ${artistData.plays} reproducciones</h2>`;
  });

  emailBody += '<br><h1>Top Canciones</h1>';


  top50 = topTracks.top

  top50.forEach((track, index) => {
    emailBody += `<h2>- ${index+1}. ${top50[index].name} | ${top50[index].artist} : ${top50[index].plays} escuchas</h2>`;

    if(index < 5){
      emailBody += `<img src="cid:cover_${index}" alt="${track.name}"><br><br>`; // Agregar la imagen de la portada

      const imageUrl = getAlbumCover(top50[index].id);
      const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob().setName(`cover_${index}`);
      inlineImages[`cover_${index}`] = imageBlob;
    }

  });

  const currentDate = new Date();
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  sendEmail(`Top 50 ${monthNames[currentDate.getMonth()]}-${currentDate.getFullYear()}`, emailBody, inlineImages);

  createMonthlyPlaylist(topTracks);
}

function getAlbumCover(songId) {
  // Hacer una solicitud GET a la API de Spotify para obtener los detalles de la pista
  refreshAccessToken();
  const access_token = PropertiesService.getScriptProperties().getProperty('access_token');
  const response = UrlFetchApp.fetch(`https://api.spotify.com/v1/tracks/${songId}`, {
    headers: {
      Authorization: 'Bearer ' + access_token // Reemplaza YOUR_ACCESS_TOKEN con tu token de acceso de Spotify
    }
  });

  // Convertir la respuesta a un objeto JSON
  const data = JSON.parse(response.getContentText());

  // Obtener el ID del álbum de la pista
  const albumId = data.album.id;

  // Hacer una solicitud GET a la API de Spotify para obtener los detalles del álbum
  const albumResponse = UrlFetchApp.fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: {
      Authorization: 'Bearer ' + access_token // Reemplaza YOUR_ACCESS_TOKEN con tu token de acceso de Spotify
    }
  });

  // Convertir la respuesta a un objeto JSON
  const albumData = JSON.parse(albumResponse.getContentText());

  // Obtener la URL de la portada del álbum
  const coverUrl = albumData.images[0].url;

  return coverUrl;
}

function sendYearlyTopTracksEmail() {
  
    const topTracks = getTopTracks(50, 'anio');
    const inlineImages = {};
    const seconds = topTracks.s; // Ejemplo: 150000 milisegundos
    Logger.log(seconds)
    Logger.log(seconds / 60)

    const time = convertSecondsToHoursAndMinutes(seconds);
    console.log(time.hours + " horas, " + time.hours/24 + " días");
  
    let emailBody = '<h1>Este año has escuchado ' + time.hours + " horas " + time.hours/24 + ' días!</h1><br><h1>Top Artistas</h1>';
  
    const today = new Date();
    topArtists = getTopArtists(10, new Date(today.getFullYear()-1, today.getMonth(), today.getDate()));
    topArtists.forEach((artistData, index) => {
      emailBody += `<h2>${index + 1}. ${artistData.artist}: ${artistData.plays} reproducciones</h2>`;
    });
  
    emailBody += '<br><h1>Top Canciones</h1>';
  
  
    top50 = topTracks.top
  
    top50.forEach((track, index) => {

      if(top50[index].id != "" || top50[index].name != ""){
        emailBody += `<h2>- ${index+1}. ${top50[index].name} | ${top50[index].artist} : ${top50[index].plays} escuchas</h2>`;
    
        if(index < 5){
          emailBody += `<img src="cid:cover_${index}" alt="${track.name}"><br><br>`; // Agregar la imagen de la portada
    
          const imageUrl = getAlbumCover(top50[index].id);
          const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob().setName(`cover_${index}`);
          inlineImages[`cover_${index}`] = imageBlob;
        }
      }
    });

    /*const currentDate = new Date();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  
    //Top 1 cancion por mes
    for(var i = 1; i < 13; i++){
      var topTracksMes = getTopTracks(1, 'custom', i);
      emailBody += `<h1>Top cancion de ${monthNames[i-1]}</h1>`;
      emailBody += `<h2>- ${topTracksMes.top[0].name} | ${topTracksMes.top[0].artist} : ${topTracksMes.top[0].plays} escuchas</h2>`;
    }
  */
  

  
    sendEmail(`Top ${currentDate.getFullYear()}`, emailBody, inlineImages);
  
    createYearlyPlaylist(topTracks);
}

