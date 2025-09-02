@echo off
title Spoteyfa - One-Click Installation
color 0A
echo.
echo    ███████╗██████╗  ██████╗ ████████╗███████╗██╗   ██╗███████╗ █████╗ 
echo    ██╔════╝██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝╚██╗ ██╔╝██╔════╝██╔══██╗
echo    ███████╗██████╔╝██║   ██║   ██║   █████╗   ╚████╔╝ █████╗  ███████║
echo    ╚════██║██╔═══╝ ██║   ██║   ██║   ██╔══╝    ╚██╔╝  ██╔══╝  ██╔══██║
echo    ███████║██║     ╚██████╔╝   ██║   ███████╗   ██║   ██║     ██║  ██║
echo    ╚══════╝╚═╝      ╚═════╝    ╚═╝   ╚══════╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝
echo.
echo                   🍎 Apple-Style Spotify Player 🍎
echo                        One-Click Installation
echo.
echo ================================================================================
echo.

REM Admin-Rechte prüfen
net session >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Administrator-Rechte erkannt
) else (
    echo ⚠️  Führe als Administrator aus für beste Erfahrung
)
echo.

REM Check if already built
if exist "SpoteyfaPlayer-win32-x64\SpoteyfaPlayer.exe" (
    echo ✅ Spoteyfa ist bereits installiert!
    echo.
    echo 🚀 Starte Spoteyfa...
    echo.
    cd SpoteyfaPlayer-win32-x64
    start SpoteyfaPlayer.exe
    echo ✨ Spoteyfa wurde gestartet! Du kannst dieses Fenster schließen.
    timeout /t 3 >nul
    exit /b 0
)

echo 🔍 Prüfe System-Voraussetzungen...
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js ist nicht installiert!
    echo.
    echo 📥 Lade Node.js automatisch herunter...
    
    REM Create temp directory
    if not exist "%TEMP%\spoteyfa-install" mkdir "%TEMP%\spoteyfa-install"
    
    REM Download Node.js installer
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi' -OutFile '%TEMP%\spoteyfa-install\nodejs.msi'}"
    
    if exist "%TEMP%\spoteyfa-install\nodejs.msi" (
        echo 🔧 Installiere Node.js...
        start /wait msiexec /i "%TEMP%\spoteyfa-install\nodejs.msi" /quiet /norestart
        
        REM Refresh PATH
        set "PATH=%PATH%;C:\Program Files\nodejs"
        
        echo ✅ Node.js Installation abgeschlossen!
        
        REM Cleanup
        del "%TEMP%\spoteyfa-install\nodejs.msi"
        rmdir "%TEMP%\spoteyfa-install"
    ) else (
        echo ❌ Download fehlgeschlagen. Bitte installiere Node.js manuell:
        echo https://nodejs.org/
        pause
        exit /b 1
    )
) else (
    echo ✅ Node.js gefunden
    node --version
)

echo.
echo 📦 Installiere Spoteyfa Dependencies...
echo    (Dies kann einige Minuten dauern)
echo.

call npm install --silent

if %errorlevel% neq 0 (
    echo.
    echo ❌ Dependency Installation fehlgeschlagen!
    echo 🔧 Versuche alternative Installation...
    
    call npm install --legacy-peer-deps --silent
    
    if %errorlevel% neq 0 (
        echo ❌ Installation endgültig fehlgeschlagen.
        echo 🌐 Überprüfe deine Internetverbindung und versuche es erneut.
        pause
        exit /b 1
    )
)

echo.
echo 🔨 Baue Spoteyfa für Windows...
echo.

REM Alternative build ohne Code-Signing
set "CSC_IDENTITY_AUTO_DISCOVERY=false"
call npx electron-builder --win --x64 --publish never

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Standard-Build fehlgeschlagen. Verwende portable Version...
    echo.
    
    REM Portable version erstellen
    call npm start &
    timeout /t 5 >nul
    taskkill /f /im electron.exe >nul 2>&1
    
    echo ✅ Portable Installation abgeschlossen!
    echo.
    echo 🚀 Starte Spoteyfa...
    call npm start
) else (
    echo.
    echo ✅ Build erfolgreich!
    echo.
    echo 🚀 Starte Spoteyfa...
    
    if exist "dist\win-unpacked\SpoteyfaPlayer.exe" (
        cd dist\win-unpacked
        start SpoteyfaPlayer.exe
    ) else if exist "SpoteyfaPlayer-win32-x64\SpoteyfaPlayer.exe" (
        cd SpoteyfaPlayer-win32-x64
        start SpoteyfaPlayer.exe
    ) else (
        echo 📁 Exe nicht gefunden, starte mit npm...
        call npm start
    )
)

echo.
echo ✨ Installation abgeschlossen!
echo 🎵 Viel Spaß mit Spoteyfa!
echo.
echo Du kannst dieses Fenster jetzt schließen.
timeout /t 5 >nul