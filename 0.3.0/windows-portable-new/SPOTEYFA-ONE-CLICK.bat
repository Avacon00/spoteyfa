@echo off
setlocal EnableDelayedExpansion
title SPOTEYFA v0.3.0 - Ein-Klick-Installation
color 0B
mode con: cols=85 lines=30

REM === SPOTEYFA One-Click Installer für absolute Anfänger ===
REM Macht ALLES automatisch - kein Benutzer-Input nötig

cls
echo.
echo ===============================================================================
echo                    SPOTEYFA v0.3.0 - EIN-KLICK-INSTALLATION                     
echo                        Apple-Style Spotify Player                               
echo ===============================================================================
echo.
echo   🎵 VOLLAUTOMATISCHE INSTALLATION - KEINE EINGABEN NÖTIG!
echo.
echo   Was passiert automatisch:
echo   ✅ System wird geprüft
echo   ✅ Node.js wird heruntergeladen (falls nötig) 
echo   ✅ Node.js wird installiert (falls nötig)
echo   ✅ SPOTEYFA wird installiert
echo   ✅ SPOTEYFA wird gestartet
echo.
echo   Einfach warten - alles wird automatisch gemacht!
echo.
echo ===============================================================================
echo.
echo ⏳ Installation startet in 3 Sekunden...
timeout /t 3 /nobreak >nul

cls
echo.
echo ===============================================================================
echo                              SYSTEM-CHECK                                      
echo ===============================================================================
echo.

REM Check 1: Windows Version
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
echo ✅ Windows Version: %VERSION%

REM Check 2: Architektur
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    set ARCH=x64
    set NODEJS_URL=https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
) else (
    set ARCH=x86
    set NODEJS_URL=https://nodejs.org/dist/v20.11.0/node-v20.11.0-x86.msi
)
echo ✅ System-Architektur: %ARCH%

REM Check 3: Admin-Rechte (optional, aber hilfreich)
net session >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Administrator-Rechte: Verfügbar
    set HAS_ADMIN=1
) else (
    echo ⚠️ Administrator-Rechte: Nicht verfügbar (OK für Node.js Portable)
    set HAS_ADMIN=0
)

REM Check 4: Internet-Verbindung
ping google.com -n 1 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Internet-Verbindung: OK
) else (
    echo ❌ Internet-Verbindung: Fehler
    echo.
    echo PROBLEM: Keine Internet-Verbindung erkannt!
    echo Node.js kann nicht heruntergeladen werden.
    echo.
    echo Lösungen:
    echo 1. Prüfen Sie Ihre Internet-Verbindung
    echo 2. Deaktivieren Sie temporär Firewall/Antivirus
    echo 3. Verwenden Sie "Start-SPOTEYFA.bat" wenn Node.js bereits installiert ist
    echo.
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo                              NODE.JS CHECK                                      
echo ===============================================================================
echo.

REM Prüfe Node.js Installation
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set EXISTING_VERSION=%%i
    echo ✅ Node.js bereits installiert: !EXISTING_VERSION!
    echo ⏩ Überspringe Node.js Installation
    goto :spoteyfa_install
)

echo ❌ Node.js nicht installiert
echo ⏳ Node.js wird automatisch installiert...
echo.

REM Erstelle temporären Ordner
set TEMP_DIR=%TEMP%\SPOTEYFA_%RANDOM%
mkdir "%TEMP_DIR%" 2>nul

echo [DOWNLOAD] Node.js v20.11.0 wird heruntergeladen...
echo URL: %NODEJS_URL%

set NODEJS_FILE=%TEMP_DIR%\nodejs.msi

REM Multi-Method Download (PowerShell + Fallback)
powershell -Command "
    $ErrorActionPreference = 'Stop'
    try {
        Write-Host '⏳ Download läuft...'
        $client = New-Object System.Net.WebClient
        $client.DownloadFile('%NODEJS_URL%', '%NODEJS_FILE%')
        Write-Host '✅ Download erfolgreich!'
    } catch {
        Write-Host '❌ PowerShell Download fehlgeschlagen'
        exit 1
    }
" 2>nul

if %errorlevel% neq 0 (
    echo ⚠️ PowerShell Download fehlgeschlagen, versuche alternative Methode...
    
    REM Fallback: curl (verfügbar ab Windows 10 1803)
    curl -L -o "%NODEJS_FILE%" "%NODEJS_URL%" --silent --show-error
    
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Automatischer Download fehlgeschlagen!
        echo.
        echo MANUELLE LÖSUNG:
        echo 1. Öffnen Sie: https://nodejs.org/en/download
        echo 2. Laden Sie "Windows Installer (.msi)" herunter
        echo 3. Installieren Sie Node.js
        echo 4. Führen Sie "Start-SPOTEYFA.bat" aus
        echo.
        pause
        exit /b 1
    )
)

if not exist "%NODEJS_FILE%" (
    echo ❌ Download-Datei nicht erstellt!
    goto :download_failed
)

echo ✅ Node.js heruntergeladen (Dateigröße: 
for %%A in ("%NODEJS_FILE%") do echo %%~zA Bytes)

echo.
echo [INSTALL] Node.js wird installiert...

if %HAS_ADMIN% equ 1 (
    echo ⚡ Verwende Administrator-Rechte für Installation...
    msiexec /i "%NODEJS_FILE%" /quiet /norestart ADDLOCAL=ALL
    set INSTALL_METHOD=Admin
) else (
    echo ⚡ Verwende Benutzer-Installation...
    msiexec /i "%NODEJS_FILE%" /quiet /norestart ALLUSERS=0 ADDLOCAL=ALL
    set INSTALL_METHOD=User
)

echo ⏳ Warte auf Installation-Abschluss...
timeout /t 45 /nobreak >nul

REM Aktualisiere PATH
if %HAS_ADMIN% equ 1 (
    set "PATH=%PATH%;C:\Program Files\nodejs"
) else (
    set "PATH=%PATH%;%APPDATA%\npm;%LOCALAPPDATA%\Programs\nodejs"
)

REM Prüfe Installation
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NEW_VERSION=%%i
    echo ✅ Node.js erfolgreich installiert: !NEW_VERSION! (%INSTALL_METHOD%)
) else (
    echo.
    echo ⚠️ Node.js Installation eventuell nicht abgeschlossen
    echo.
    echo LÖSUNG: Starten Sie Ihren Computer NEU
    echo Führen Sie danach "Start-SPOTEYFA.bat" aus
    echo.
    pause
    exit /b 1
)

REM Cleanup
del "%NODEJS_FILE%" 2>nul
rmdir "%TEMP_DIR%" /s /q 2>nul

:spoteyfa_install
echo.
echo ===============================================================================
echo                              SPOTEYFA INSTALLATION                              
echo ===============================================================================
echo.

REM Prüfe SPOTEYFA Dateien
echo [CHECK] Prüfe SPOTEYFA Dateien...

set MISSING_FILES=0
if not exist "package.json" (
    echo ❌ package.json fehlt
    set /a MISSING_FILES+=1
)
if not exist "main.js" (
    echo ❌ main.js fehlt  
    set /a MISSING_FILES+=1
)
if not exist "Start-SPOTEYFA.bat" (
    echo ❌ Start-SPOTEYFA.bat fehlt
    set /a MISSING_FILES+=1
)

if %MISSING_FILES% gtr 0 (
    echo.
    echo ❌ SPOTEYFA Dateien unvollständig!
    echo.
    echo Lösung:
    echo 1. Entpacken Sie die SPOTEYFA ZIP-Datei vollständig
    echo 2. Stellen Sie sicher, dass alle Dateien extrahiert wurden
    echo 3. Führen Sie diesen Installer erneut aus
    echo.
    pause
    exit /b 1
)

echo ✅ Alle SPOTEYFA Dateien vorhanden

echo.
echo [INSTALL] Installiere SPOTEYFA Dependencies...
echo ⏳ Das kann 1-2 Minuten dauern - bitte warten...

npm install --production --silent --no-audit --no-fund

if %errorlevel% neq 0 (
    echo ⚠️ Standard-Installation fehlgeschlagen, verwende Fallback...
    npm install --production --legacy-peer-deps --no-audit --no-fund
    
    if %errorlevel% neq 0 (
        echo ❌ Dependency-Installation fehlgeschlagen
        echo.
        echo Mögliche Lösungen:
        echo 1. Starten Sie "Debug-SPOTEYFA.bat" für Details
        echo 2. Prüfen Sie Ihre Internet-Verbindung
        echo 3. Deaktivieren Sie temporär Antivirus-Software
        echo.
        pause
        exit /b 1
    )
)

echo ✅ SPOTEYFA Dependencies installiert

echo.
echo ===============================================================================
echo                              ✅ INSTALLATION ABGESCHLOSSEN                       
echo ===============================================================================
echo.
echo 🎉 SPOTEYFA ist bereit!
echo.
echo ✅ Node.js: Installiert und funktionsfähig
echo ✅ SPOTEYFA: Vollständig installiert
echo ✅ Dependencies: Alle installiert
echo.
echo 🚀 SPOTEYFA wird jetzt automatisch gestartet...
echo.
echo Bei Problemen verwenden Sie:
echo   - Debug-SPOTEYFA.bat (für Details)
echo   - Force-Show-SPOTEYFA.bat (bei UI-Problemen)
echo.
timeout /t 3 /nobreak >nul

echo [START] Starte SPOTEYFA...
start /min npm start

REM Fallback falls regulärer Start fehlschlägt
timeout /t 5 /nobreak >nul
tasklist /fi "imagename eq node.exe" | find "node.exe" >nul
if %errorlevel% neq 0 (
    echo ⚠️ Regulärer Start fehlgeschlagen, verwende Debug-Modus...
    npm run debug
)

echo.
echo 🎵 SPOTEYFA Installation und Start abgeschlossen!
echo    Fenster kann geschlossen werden wenn SPOTEYFA läuft.
pause

goto :eof

:download_failed
echo.
echo ===============================================================================
echo                               DOWNLOAD FEHLGESCHLAGEN                           
echo ===============================================================================
echo.
echo Der automatische Download von Node.js ist fehlgeschlagen.
echo.
echo MANUELLE INSTALLATION:
echo.
echo 1. Besuchen Sie: https://nodejs.org/en/download
echo 2. Laden Sie "Windows Installer" für Ihr System herunter:
if "%ARCH%"=="x64" (
    echo    - 64-bit Windows: node-v20.x.x-x64.msi
) else (
    echo    - 32-bit Windows: node-v20.x.x-x86.msi
)
echo 3. Führen Sie die heruntergeladene .msi Datei aus
echo 4. Folgen Sie dem Installationsassistent
echo 5. Starten Sie Ihren Computer neu
echo 6. Führen Sie "Start-SPOTEYFA.bat" aus
echo.
echo ===============================================================================
pause
exit /b 1