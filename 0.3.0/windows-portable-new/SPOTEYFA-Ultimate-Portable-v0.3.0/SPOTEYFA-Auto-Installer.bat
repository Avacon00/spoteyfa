@echo off
setlocal EnableDelayedExpansion
title SPOTEYFA v0.3.0 - Automatische Installation
color 0A
mode con: cols=80 lines=25

REM === SPOTEYFA v0.3.0 Auto-Installer für absolute Anfänger ===
REM Installiert automatisch alle benötigten Programme

echo.
echo ================================================================================
echo                        SPOTEYFA v0.3.0 - AUTO INSTALLER                        
echo                     Apple-Style Spotify Player für Windows                      
echo ================================================================================
echo.
echo  Dieser Installer macht alles automatisch für Sie:
echo  - Prüft ob Node.js installiert ist
echo  - Lädt Node.js automatisch herunter (falls nötig)
echo  - Installiert Node.js automatisch
echo  - Installiert SPOTEYFA Dependencies
echo  - Startet SPOTEYFA
echo.
echo  Sie brauchen KEINE Programmierkenntnisse!
echo  Einfach den Anweisungen folgen.
echo.
echo ================================================================================
pause

echo.
echo [1/5] Prüfe System...
echo.

REM Prüfe ob wir Admin-Rechte haben
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ WICHTIG: Admin-Rechte benötigt für automatische Installation
    echo.
    echo Bitte starten Sie diese Datei als Administrator:
    echo 1. Rechtsklick auf "SPOTEYFA-Auto-Installer.bat"
    echo 2. "Als Administrator ausführen" wählen
    echo.
    pause
    exit /b 1
)

echo ✅ Admin-Rechte: OK
echo ✅ Windows System: Erkannt

REM Prüfe ob Node.js bereits installiert ist
echo.
echo [2/5] Prüfe Node.js Installation...
echo.

node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js ist bereits installiert: !NODE_VERSION!
    goto :install_spoteyfa
)

echo ❌ Node.js nicht gefunden
echo.
echo Möchten Sie Node.js automatisch installieren?
echo (Node.js ist kostenlos und sicher - wird für SPOTEYFA benötigt)
echo.
choice /c JN /m "Node.js installieren? [J]a / [N]ein"
if errorlevel 2 (
    echo.
    echo Installation abgebrochen.
    echo Sie können Node.js manuell von https://nodejs.org herunterladen
    pause
    exit /b 1
)

echo.
echo [3/5] Node.js wird heruntergeladen...
echo.

REM Erstelle temporären Ordner
set TEMP_DIR=%TEMP%\SPOTEYFA_Setup
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Bestimme System-Architektur
set "NODEJS_URL=https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
set "NODEJS_FILE=%TEMP_DIR%\nodejs-installer.msi"

echo Lade Node.js v20.11.0 herunter...
echo URL: %NODEJS_URL%
echo.

REM Download mit PowerShell (funktioniert auf allen Windows 10/11)
powershell -Command "& {
    Write-Host 'Download startet...'
    try {
        $ProgressPreference = 'Continue'
        Invoke-WebRequest -Uri '%NODEJS_URL%' -OutFile '%NODEJS_FILE%' -UseBasicParsing
        Write-Host 'Download erfolgreich!'
    } catch {
        Write-Host 'Download fehlgeschlagen: ' $_.Exception.Message
        exit 1
    }
}"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Download fehlgeschlagen!
    echo.
    echo Manuelle Installation erforderlich:
    echo 1. Öffnen Sie https://nodejs.org
    echo 2. Laden Sie die LTS Version herunter
    echo 3. Installieren Sie Node.js
    echo 4. Starten Sie diesen Installer erneut
    echo.
    pause
    exit /b 1
)

if not exist "%NODEJS_FILE%" (
    echo ❌ Download-Datei nicht gefunden!
    goto :manual_install
)

echo ✅ Node.js erfolgreich heruntergeladen!

echo.
echo [4/5] Node.js wird installiert...
echo.
echo ⏳ Bitte warten - Installation läuft...
echo    (Ein Installations-Fenster kann erscheinen)
echo.

REM Stille Installation von Node.js
msiexec /i "%NODEJS_FILE%" /quiet /norestart ADDLOCAL=ALL

REM Warte auf Installation
timeout /t 30 /nobreak >nul

REM Aktualisiere PATH für aktuelle Session
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Prüfe ob Installation erfolgreich war
echo Prüfe Node.js Installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Automatische Installation eventuell nicht vollständig
    echo.
    echo Bitte starten Sie Ihren Computer NEU und führen dann aus:
    echo "Start-SPOTEYFA.bat"
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js erfolgreich installiert: !NODE_VERSION!

REM Cleanup
if exist "%NODEJS_FILE%" del "%NODEJS_FILE%"
if exist "%TEMP_DIR%" rmdir "%TEMP_DIR%" /s /q

:install_spoteyfa
echo.
echo [5/5] SPOTEYFA wird installiert...
echo.

REM Prüfe ob wir uns im richtigen Verzeichnis befinden
if not exist "package.json" (
    echo ❌ SPOTEYFA Dateien nicht gefunden!
    echo.
    echo Stellen Sie sicher, dass Sie sich im SPOTEYFA Ordner befinden
    echo und alle Dateien entpackt wurden.
    echo.
    pause
    exit /b 1
)

if not exist "main.js" (
    echo ❌ SPOTEYFA main.js nicht gefunden!
    echo Bitte entpacken Sie die ZIP-Datei vollständig.
    pause
    exit /b 1
)

echo ✅ SPOTEYFA Dateien gefunden
echo.
echo Installiere SPOTEYFA Dependencies...
echo (Das kann 1-2 Minuten dauern)
echo.

npm install --production --silent

if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Dependency Installation mit Problemen
    echo Versuche alternative Installation...
    echo.
    npm install --legacy-peer-deps --production
)

echo.
echo ================================================================================
echo                              INSTALLATION ABGESCHLOSSEN!                        
echo ================================================================================
echo.
echo ✅ Node.js: Installiert und funktionsfähig
echo ✅ SPOTEYFA: Dependencies installiert  
echo ✅ System: Bereit für SPOTEYFA
echo.
echo SPOTEYFA wird jetzt gestartet...
echo.
echo Bei Problemen:
echo - Verwenden Sie "Debug-SPOTEYFA.bat"
echo - Oder "Force-Show-SPOTEYFA.bat"
echo.
echo ================================================================================
echo.

timeout /t 3 /nobreak >nul

echo Starte SPOTEYFA...
npm start

if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Start-Problem erkannt, verwende Debug-Modus...
    npm run debug
)

echo.
echo SPOTEYFA Auto-Installer beendet.
pause
goto :eof

:manual_install
echo.
echo ================================================================================
echo                           MANUELLE INSTALLATION ERFORDERLICH                    
echo ================================================================================
echo.
echo Der automatische Download hat nicht funktioniert.
echo Bitte installieren Sie Node.js manuell:
echo.
echo 1. Öffnen Sie https://nodejs.org
echo 2. Klicken Sie auf "LTS" Download (empfohlen für die meisten Benutzer)
echo 3. Führen Sie die heruntergeladene .msi Datei aus
echo 4. Folgen Sie dem Installations-Assistenten (Standard-Einstellungen sind OK)
echo 5. Starten Sie Ihren Computer NEU
echo 6. Führen Sie dann "Start-SPOTEYFA.bat" aus
echo.
echo ================================================================================
pause
exit /b 1