@echo off
title MERN Booking App Launcher
cd /d "%~dp0"

echo =====================================================================
echo              MERN BOOKING APP APPLICATION LAUNCHER                   
echo =====================================================================
echo.
echo  [1/2] Launching Backend API (Port 4000)...
start "Booking App API (Port 4000)" cmd /k "cd /d "%~dp0api" && npm run dev"

echo  [2/2] Launching React Client (Port 5173)...
start "Booking App Client (Port 5173)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo =====================================================================
echo  Both services launched!
echo  Please keep both terminal windows open while testing the application.
echo.
echo  - Backend API: http://localhost:4000
echo  - Frontend UI:  http://localhost:5173
echo =====================================================================
echo.
pause

