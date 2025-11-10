@echo off
echo Setting up Google Calendar Integration...
echo.
echo Step 1: Generate OAuth Token
cd server\src\config
node getToken.js
echo.
echo Step 2: Start the server to test calendar integration
cd ..\..\..
npm start
pause