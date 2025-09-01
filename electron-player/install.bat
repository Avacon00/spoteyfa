@echo off
echo 🍎 Apple-Style Spotify Player - Installation
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js ist nicht installiert!
    echo.
    echo Bitte installiere Node.js von: https://nodejs.org/
    echo Danach starte dieses Script erneut.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js gefunden
node --version

echo.
echo 📦 Installiere Dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ Installation fehlgeschlagen!
    echo Überprüfe deine Internetverbindung und versuche es erneut.
    pause
    exit /b 1
)

echo.
echo ✅ Installation erfolgreich!
echo.
echo 🚀 Starte Apple-Style Player...
call npm start

pause