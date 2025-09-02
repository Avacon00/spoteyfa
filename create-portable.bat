@echo off
title Spoteyfa - Portable Version Creator
color 0B

echo.
echo ====================================================================
echo                 🎵 Spoteyfa Portable Version Creator 🎵
echo ====================================================================
echo.
echo Erstelle eine portable Version die ohne Installation läuft...
echo.

REM Prüfe ob alle Dateien vorhanden sind
if not exist "main.js" (
    echo ❌ main.js nicht gefunden!
    pause
    exit /b 1
)

if not exist "renderer.js" (
    echo ❌ renderer.js nicht gefunden!
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ❌ package.json nicht gefunden!
    pause
    exit /b 1
)

echo ✅ Alle Kerndateien gefunden
echo.

REM Erstelle portable Struktur
echo 📁 Erstelle portable Ordnerstruktur...

if not exist "Spoteyfa-Portable" mkdir "Spoteyfa-Portable"
if not exist "Spoteyfa-Portable\app" mkdir "Spoteyfa-Portable\app"

REM Kopiere Anwendungsdateien
echo 📋 Kopiere Anwendungsdateien...
copy "main.js" "Spoteyfa-Portable\app\" >nul
copy "renderer.js" "Spoteyfa-Portable\app\" >nul
copy "index.html" "Spoteyfa-Portable\app\" >nul
copy "setup-wizard.html" "Spoteyfa-Portable\app\" >nul
copy "style.css" "Spoteyfa-Portable\app\" >nul
copy "config-manager.js" "Spoteyfa-Portable\app\" >nul
copy "package.json" "Spoteyfa-Portable\app\" >nul
copy "README.md" "Spoteyfa-Portable\app\" >nul 2>nul

REM Erstelle Starter-Script
echo 🚀 Erstelle Starter-Script...

(
echo @echo off
echo title Spoteyfa - Apple Style Spotify Player
echo color 0A
echo cd /d "%%~dp0app"
echo.
echo echo ====================================================================
echo echo                   🍎 Spoteyfa - Apple Style Player 🍎
echo echo ====================================================================
echo echo.
echo.
echo REM Prüfe Node.js
echo where node ^>nul 2^>nul
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Node.js ist nicht installiert!
echo     echo.
echo     echo 📥 Bitte installiere Node.js von: https://nodejs.org/
echo     echo Danach starte Spoteyfa erneut.
echo     echo.
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo ✅ Node.js gefunden
echo echo 📦 Prüfe Dependencies...
echo.
echo if not exist "node_modules" ^(
echo     echo 🔄 Installiere Dependencies... ^(Nur beim ersten Start^)
echo     call npm install --silent
echo     
echo     if %%errorlevel%% neq 0 ^(
echo         echo ❌ Installation fehlgeschlagen!
echo         echo 🌐 Überprüfe Internetverbindung und versuche erneut.
echo         pause
echo         exit /b 1
echo     ^)
echo     echo ✅ Dependencies installiert!
echo ^)
echo.
echo echo 🚀 Starte Spoteyfa...
echo echo.
echo call npm start
) > "Spoteyfa-Portable\Spoteyfa.bat"

REM Erstelle Readme für portable Version
echo 📝 Erstelle Anleitung...

(
echo # 🍎 Spoteyfa - Portable Version
echo.
echo ## 🚀 Schnellstart
echo.
echo 1. Doppelklick auf `Spoteyfa.bat`
echo 2. Beim ersten Start werden automatisch Dependencies installiert
echo 3. Spoteyfa startet automatisch
echo.
echo ## ⚙️ Voraussetzungen
echo.
echo - Windows 10/11
echo - Node.js ^(wird automatisch erkannt, Download-Link wird angezeigt^)
echo - Internetverbindung ^(nur für ersten Start^)
echo.
echo ## 📁 Struktur
echo.
echo ```
echo Spoteyfa-Portable/
echo ├── Spoteyfa.bat          ^(Starter^)
echo ├── README-PORTABLE.md    ^(Diese Datei^)
echo └── app/                  ^(Anwendungsdateien^)
echo     ├── main.js
echo     ├── renderer.js
echo     ├── package.json
echo     └── ...
echo ```
echo.
echo ## 💡 Hinweise
echo.
echo - Diese Version ist komplett portable
echo - Keine Installation erforderlich
echo - Kann von USB-Stick ausgeführt werden
echo - Konfiguration wird im Benutzer-Verzeichnis gespeichert
echo.
echo ## 🎵 Viel Spaß mit Spoteyfa!
) > "Spoteyfa-Portable\README-PORTABLE.md"

echo.
echo ✅ Portable Version erstellt!
echo.
echo 📍 Speicherort: %CD%\Spoteyfa-Portable
echo.
echo 🎯 Zum Testen: Doppelklick auf 'Spoteyfa-Portable\Spoteyfa.bat'
echo.
echo 📦 Für Verteilung: Komprimiere den Ordner 'Spoteyfa-Portable' zu einer ZIP-Datei
echo.

pause