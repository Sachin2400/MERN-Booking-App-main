@echo off
title MERN Booking App - Backend API
cd /d "%~dp0api"
echo ========================================================
echo   Starting Booking App API Server (Port 4000)...
echo ========================================================
npm run dev
pause

