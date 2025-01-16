# SpotifyStats
This project integrates with Spotify's API and Google Apps Script to track your listening habits automatically.
## Features:
- Built specifically to run on Google Apps Script, making it easy to use and deploy.
- Integrates with the Spotify API to access your listening data securely.
- Periodically saves your listening history to a Google Spreadsheet for easy reference and further analysis.
- Sends you weekly and monthly emails summarizing your most-listened-to songs and artists.
- Automatically creates a monthly playlist with your top tracks for that month.
## Setup Instructions:
1. Create a new project in Google Apps Script.  
2. Copy and paste all the code into the Google Apps Script editor.  
3. Fill in the `CLIENT_ID` and `CLIENT_SECRET` with the values from your Spotify application. You can obtain these by registering your app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).  
4. Deploy the script via the "Deploy" menu -> "New Deployment" -> "Select Type" -> "Web Application" -> "Deploy."  
5. Set the `REDIRECT_URI` to the URL of your Google Apps Script project. You can find this URL in "Deploy" -> "Test Deployments" (it should end with `/dev`).  
6. Also, set your project's URL in line 62 of the auth.gs script. (This step is necessary for functionality).  
7. Copy the `REDIRECT_URI` and paste it into your Spotify application's settings under the "Redirect URIs" section.  
8. Run the `authorize()` function from the Google Apps Script console. This will provide an authorization URL that you need to visit to authorize the app.  
9. Run the `exchangeCodeForTokens()` function from the Google Apps Script console after authorizing the app. This will exchange the authorization code for access and refresh tokens.  
10. In the "Services" tab, add "Google Sheets API."  
11. In the "Advanced Services" tab, activate "Google Sheets API."  
12. Create a spreadsheet in your Google Drive and copy its ID (from the URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`) into the `SPREADSHEET_ID` variable in your script.  

13. In the "Triggers" tab, create the following:  
    - Function: `sendMonthlyTopTracksEmail` | Event: "Time-driven" | Type: "Month timer" | Day of the month: "31" | Hour: "23-00" (You can choose any day and time you prefer).  
    - Function: `sendWeeklyTopTracksEmail` | Event: "Time-driven" | Type: "Week timer" | Day of the week: "Sunday" | Hour: "23-00" (You can customize the day and time).  
    - Function: `saveRecentlyPlayedTracks` | Event: "Time-driven" | Type: "Hourly timer" | Interval: "Every hour" (This saves recently played tracks to the spreadsheet).
    - Function: `sendYearlyTopTracksEmail` | Event: "Time-driven" | Type: "Date-Hour TImer" | Day-Hour: "31/12 23:00" (You can customize the day and time).
      *Due to the limitations of Google Apps Script, annual summary cannot be automated and must be entered/executed by hand on a year-to-year basis.*
14. Don't forget to fill the auth.gs constants with the required data

## To do:
- [x] Create an annual summary
- [ ] Improvement of the annual summary: e.g. include monthly tops 
- [ ] Improve the visualization of the information in the mails
- [ ] Create a website to visualize the data(?

#### Any comments or suggestions are welcome. The application may have bugs, please report them. 

- - -
*Copyright (C) 2024  Álvaro Laguna*

*This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.*

*This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.*

*You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.*

