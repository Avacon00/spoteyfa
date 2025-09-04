@echo off
title SPOTEYFA - Start
echo.
echo ========================================
echo           SPOTEYFA v0.3.0
echo    Apple-Style Spotify Player
echo ========================================
echo.

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js ist nicht installiert!
    echo.
    echo Bitte installieren Sie Node.js:
    echo 1. Gehen Sie zu https://nodejs.org
    echo 2. Laden Sie die LTS Version herunter
    echo 3. Installieren Sie Node.js
    echo 4. Starten Sie diese Datei erneut
    echo.
    echo ODER verwenden Sie "EINFACH-INSTALLIEREN.bat"
    echo für automatische Installation.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js gefunden
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installiere SPOTEYFA...
    npm install --production
    echo.
)

echo Starte SPOTEYFA...
npm start

if %errorlevel% neq 0 (
    echo.
    echo Problem beim Start - verwende Debug:
    npm run debug
)

echo.
pause