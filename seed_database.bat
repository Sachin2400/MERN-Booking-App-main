@echo off
title Seed MERN Booking App Database
cd /d "%~dp0api"
echo =====================================================================
echo           SEEDING DATABASE WITH SAMPLE VACATION PLACES & HOSTS       
echo =====================================================================
echo.
npm run seed
echo.
pause

