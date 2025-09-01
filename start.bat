@echo off
echo 🍎 Starting Apple-Style Spotify Player...
echo ========================================

REM Check if node_modules exists
if not exist "node_modules" (
    echo ❌ Dependencies nicht installiert!
    echo.
    echo Führe zuerst "install.bat" aus um die App zu installieren.
    echo.
    pause
    exit /b 1
)

echo ✨ Starting with glassmorphism effects...
call npm start

if %errorlevel% neq 0 (
    echo.
    echo ❌ Fehler beim Starten der App!
    echo Überprüfe die Konsole für Fehlermeldungen.
    pause
    exit /b 1
)

echo.
echo 👋 Apple-Style Player beendet.
pause