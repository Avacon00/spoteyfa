@echo off
title SPOTEYFA - Einfache Installation
color 0A
echo.
echo ========================================
echo   SPOTEYFA - Einfache Installation
echo ========================================
echo.
echo Dieser Installer macht alles automatisch:
echo 1. Prueft ob Node.js vorhanden ist
echo 2. Laedt Node.js herunter (falls noetig)
echo 3. Installiert Node.js (falls noetig)
echo 4. Startet SPOTEYFA
echo.
echo Druecken Sie eine Taste zum Starten...
pause >nul

echo.
echo [1/4] Pruefe System...

REM Pruefe ob Node.js bereits da ist
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js ist bereits installiert
    goto start_spoteyfa
)

echo ❌ Node.js nicht gefunden

echo.
echo [2/4] Node.js wird heruntergeladen...
echo.
echo Das kann 1-2 Minuten dauern - bitte warten!
echo.

REM Erstelle temp Ordner
set TEMP_DIR=%TEMP%\SPOTEYFA_Install
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Download URL
set NODEJS_URL=https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
set NODEJS_FILE=%TEMP_DIR%\nodejs.msi

echo Lade Node.js herunter...
powershell -Command "try { Invoke-WebRequest -Uri '%NODEJS_URL%' -OutFile '%NODEJS_FILE%' -UseBasicParsing; Write-Host 'Download erfolgreich!' } catch { Write-Host 'Fehler beim Download'; exit 1 }"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Download fehlgeschlagen!
    echo.
    echo Bitte installieren Sie Node.js manuell:
    echo 1. Gehen Sie zu https://nodejs.org
    echo 2. Laden Sie die LTS Version herunter
    echo 3. Installieren Sie Node.js
    echo 4. Fuehren Sie dann "Start-SPOTEYFA.bat" aus
    echo.
    pause
    exit /b 1
)

if not exist "%NODEJS_FILE%" (
    echo ❌ Download-Datei nicht gefunden!
    goto manual_install
)

echo ✅ Download erfolgreich!

echo.
echo [3/4] Node.js wird installiert...
echo.
echo ⏳ Installation laeuft - bitte warten...
echo    (Ein Installationsfenster koennte erscheinen)
echo.

REM Versuche stille Installation
msiexec /i "%NODEJS_FILE%" /quiet /norestart

REM Warte auf Installation
echo Warte 45 Sekunden auf Installation...
timeout /t 45 /nobreak >nul

REM Pruefe ob Installation erfolgreich
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Installation eventuell nicht komplett
    echo.
    echo Loesung: Starten Sie Ihren Computer NEU
    echo Dann fuehren Sie "Start-SPOTEYFA.bat" aus
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js erfolgreich installiert!

REM Cleanup
del "%NODEJS_FILE%" 2>nul
rmdir "%TEMP_DIR%" /s /q 2>nul

:start_spoteyfa
echo.
echo [4/4] SPOTEYFA wird gestartet...
echo.

REM Pruefe SPOTEYFA Dateien
if not exist "package.json" (
    echo ❌ SPOTEYFA Dateien nicht gefunden!
    echo Stellen Sie sicher, dass Sie im SPOTEYFA Ordner sind.
    pause
    exit /b 1
)

echo Installiere SPOTEYFA...
npm install --production

if %errorlevel% neq 0 (
    echo ⚠️ Installation mit Problemen, versuche Fallback...
    npm install --legacy-peer-deps --production
)

echo.
echo ========================================
echo        INSTALLATION ABGESCHLOSSEN!
echo ========================================
echo.
echo SPOTEYFA wird jetzt gestartet...
echo.

timeout /t 2 /nobreak >nul

npm start

if %errorlevel% neq 0 (
    echo.
    echo Problem beim Start - verwende Debug Modus...
    npm run debug
)

echo.
echo Installation beendet.
pause
exit /b 0

:manual_install
echo.
echo ❌ Automatische Installation fehlgeschlagen
echo.
echo MANUELLE INSTALLATION:
echo 1. Gehen Sie zu: https://nodejs.org
echo 2. Laden Sie "Windows Installer" herunter
echo 3. Installieren Sie Node.js
echo 4. Starten Sie den Computer neu  
echo 5. Fuehren Sie "Start-SPOTEYFA.bat" aus
echo.
pause
exit /b 1