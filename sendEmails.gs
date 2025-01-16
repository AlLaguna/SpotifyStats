

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



