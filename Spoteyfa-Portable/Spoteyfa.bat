@echo off
title Spoteyfa - Apple Style Spotify Player
color 0A
cd /d "%~dp0app"

echo ====================================================================
echo                   🍎 Spoteyfa - Apple Style Player 🍎
echo ====================================================================
echo.

REM Prüfe Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js ist nicht installiert!
    echo.
    echo 📥 Bitte installiere Node.js von: https://nodejs.org/
    echo Danach starte Spoteyfa erneut.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js gefunden
echo 📦 Prüfe Dependencies...

if not exist "node_modules" (
    echo 🔄 Installiere Dependencies... (Nur beim ersten Start)
    call npm install --silent
ECHO ist ausgeschaltet (OFF).
    if %errorlevel% neq 0 (
        echo ❌ Installation fehlgeschlagen!
        echo 🌐 Überprüfe Internetverbindung und versuche erneut.
        pause
        exit /b 1
    )
    echo ✅ Dependencies installiert!
)

echo 🚀 Starte Spoteyfa...
echo.
call npm start
