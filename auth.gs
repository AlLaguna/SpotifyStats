
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