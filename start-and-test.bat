@echo off
echo Starting Hospital Management System...

REM Check if MongoDB is running
echo Checking MongoDB connection...
mongosh --eval "db.runCommand('ping')" --quiet >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB is not running. Please start MongoDB first.
    echo Run: net start MongoDB
    pause
    exit /b 1
)
echo MongoDB is running ✓

REM Start backend server
echo Starting backend server...
cd /d "%~dp0server"
start "Backend Server" cmd /k "npm start"

REM Wait for backend to start
echo Waiting for backend server to start...
timeout /t 5 /nobreak >nul

REM Start frontend server
echo Starting frontend server...
cd /d "%~dp0client"
start "Frontend Server" cmd /k "npm run dev"

REM Wait for frontend to start
echo Waiting for frontend server to start...
timeout /t 5 /nobreak >nul

REM Run comprehensive tests
echo Running comprehensive tests...
cd /d "%~dp0"
node comprehensive-test.js

echo.
echo Both servers should now be running:
echo - Backend: http://localhost:4000
echo - Frontend: http://localhost:3001
echo.
pause