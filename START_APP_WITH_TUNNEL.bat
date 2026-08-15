@echo off
title 1UP Music Player - Cloudflare Tunnel Starter
echo ========================================================
echo   Starting 1UP Music Streaming Studio + Cloudflare Tunnel
echo ========================================================
echo.

start "1UP Backend Server" cmd /k "cd /d %~dp0server && node src/server.js"
start "1UP Frontend Client" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 3 >nul

echo Starting Cloudflare Tunnel...
start "1UP Cloudflare Public Tunnel" cmd /k "cd /d %~dp0 && .\cloudflared.exe tunnel --url http://localhost:3000"

echo.
echo ========================================================
echo   All 3 services launched! Check the Cloudflare window
echo   for your live https://*.trycloudflare.com link.
echo ========================================================
