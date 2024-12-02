

function convertMillisecondsToHoursAndMinutes(milliseconds) {
    // Calcular las horas
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    
    // Calcular los minutos restantes después de restar las horas
    const remainingMilliseconds = milliseconds % (1000 * 60 * 60);
    const minutes = Math.floor(remainingMilliseconds / (1000 * 60));
    
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
    const milliseconds = topTracks.ms; // Ejemplo: 150000 milisegundos
    const time = convertMillisecondsToHoursAndMinutes(milliseconds);
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
    const milliseconds = topTracks.ms; // Ejemplo: 150000 milisegundos
    const time = convertMillisecondsToHoursAndMinutes(milliseconds);
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
  
    sendEmail(`Top 50 ${monthNames[currentDate.getMonth()-1]}-${currentDate.getFullYear()}`, emailBody, inlineImages);
  
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
  
  
  

  