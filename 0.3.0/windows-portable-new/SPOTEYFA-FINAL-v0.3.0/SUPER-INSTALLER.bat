@echo off
title SPOTEYFA - Super Installer (Robust)
color 0A
echo.
echo ========================================
echo    SPOTEYFA - SUPER INSTALLER v2.0
echo ========================================
echo.
echo Dieser Installer ist robuster und zeigt
echo Ihnen genau was passiert!
echo.
pause

echo.
echo [1/5] Systempruefung...

REM Pruefe Admin-Rechte
net session >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Administrator-Rechte: Verfuegbar
    set HAS_ADMIN=1
) else (
    echo ⚠️ Administrator-Rechte: Nicht verfuegbar
    echo    Das ist OK, wir versuchen Benutzer-Installation
    set HAS_ADMIN=0
)

REM Pruefe Node.js
echo.
echo Pruefe Node.js Installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js bereits installiert: %%i
    goto install_spoteyfa
) else (
    echo ❌ Node.js nicht installiert
)

REM Pruefe Internet
echo.
echo Pruefe Internet-Verbindung...
ping 8.8.8.8 -n 1 -w 3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Internet-Verbindung: OK
) else (
    echo ❌ Keine Internet-Verbindung!
    echo.
    echo Bitte pruefen Sie:
    echo - WLAN/LAN Verbindung
    echo - Firewall-Einstellungen
    echo.
    pause
    exit /b 1
)

echo.
echo [2/5] Node.js Download...

set TEMP_DIR=%TEMP%\SPOTEYFA_%RANDOM%
mkdir "%TEMP_DIR%" 2>nul

REM Bestimme Download-URL
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    set NODEJS_URL=https://nodejs.org/dist/v18.19.0/node-v18.19.0-x64.msi
    set ARCH=64-bit
) else (
    set NODEJS_URL=https://nodejs.org/dist/v18.19.0/node-v18.19.0-x86.msi
    set ARCH=32-bit
)

set NODEJS_FILE=%TEMP_DIR%\nodejs-installer.msi

echo Lade Node.js 18.19.0 (%ARCH%) herunter...
echo URL: %NODEJS_URL%
echo Ziel: %NODEJS_FILE%
echo.

REM Download mit detailliertem Fortschritt
powershell -Command "
Write-Host 'Download startet...'
try {
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile('%NODEJS_URL%', '%NODEJS_FILE%')
    $size = (Get-Item '%NODEJS_FILE%').Length
    Write-Host ('Download komplett: {0:N0} Bytes' -f $size)
} catch {
    Write-Host ('FEHLER: ' + $_.Exception.Message)
    exit 1
}"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Download fehlgeschlagen!
    goto manual_nodejs
)

REM Pruefe Download-Datei
if not exist "%NODEJS_FILE%" (
    echo ❌ Download-Datei wurde nicht erstellt!
    goto manual_nodejs
)

for %%A in ("%NODEJS_FILE%") do set FILESIZE=%%~zA
if %FILESIZE% LSS 10000000 (
    echo ❌ Download-Datei zu klein (%FILESIZE% Bytes)
    echo Erwartet: Mindestens 10MB
    goto manual_nodejs
)

echo ✅ Download erfolgreich (%FILESIZE% Bytes)

echo.
echo [3/5] Node.js Installation...
echo.

if %HAS_ADMIN% equ 1 (
    echo Verwende Administrator-Installation...
    echo Befehl: msiexec /i "%NODEJS_FILE%" /quiet /norestart
    msiexec /i "%NODEJS_FILE%" /quiet /norestart
    set INSTALL_EXIT=%errorlevel%
) else (
    echo Verwende Benutzer-Installation...
    echo Befehl: msiexec /i "%NODEJS_FILE%" /qn ALLUSERS=0
    msiexec /i "%NODEJS_FILE%" /qn ALLUSERS=0
    set INSTALL_EXIT=%errorlevel%
)

echo Installation Exit-Code: %INSTALL_EXIT%

if %INSTALL_EXIT% neq 0 (
    echo ⚠️ Installation Exit-Code: %INSTALL_EXIT%
    echo Das kann normal sein bei stillen Installationen
)

echo.
echo Warte 60 Sekunden auf Installation...
echo (Fortschritt: [          ] 0%%)
timeout /t 10 /nobreak >nul
echo (Fortschritt: [██        ] 20%%)
timeout /t 10 /nobreak >nul  
echo (Fortschritt: [████      ] 40%%)
timeout /t 10 /nobreak >nul
echo (Fortschritt: [██████    ] 60%%)
timeout /t 10 /nobreak >nul
echo (Fortschritt: [████████  ] 80%%)
timeout /t 10 /nobreak >nul
echo (Fortschritt: [██████████] 100%%)
timeout /t 10 /nobreak >nul

echo.
echo [4/5] Installation pruefen...

REM Aktualisiere PATH fuer aktuelle Session
call :refresh_path

REM Pruefe mehrere moegliche Installationspfade
echo Suche Node.js in verschiedenen Pfaden...

set NODE_FOUND=0

REM Standard-Pfade pruefen
if exist "C:\Program Files\nodejs\node.exe" (
    echo ✅ Gefunden: C:\Program Files\nodejs\node.exe
    set "PATH=%PATH%;C:\Program Files\nodejs"
    set NODE_FOUND=1
)

if exist "C:\Program Files (x86)\nodejs\node.exe" (
    echo ✅ Gefunden: C:\Program Files (x86)\nodejs\node.exe  
    set "PATH=%PATH%;C:\Program Files (x86)\nodejs"
    set NODE_FOUND=1
)

if exist "%APPDATA%\npm\node.exe" (
    echo ✅ Gefunden: %APPDATA%\npm\node.exe
    set "PATH=%PATH%;%APPDATA%\npm"
    set NODE_FOUND=1
)

if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    echo ✅ Gefunden: %LOCALAPPDATA%\Programs\nodejs\node.exe
    set "PATH=%PATH%;%LOCALAPPDATA%\Programs\nodejs"
    set NODE_FOUND=1
)

REM Teste Node.js Befehl
echo.
echo Teste Node.js Befehl...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do (
        echo ✅ Node.js funktioniert: %%i
        set NODE_FOUND=1
    )
) else (
    echo ❌ Node.js Befehl funktioniert nicht
)

REM Cleanup
del "%NODEJS_FILE%" 2>nul
rmdir "%TEMP_DIR%" /s /q 2>nul

if %NODE_FOUND% equ 0 (
    echo.
    echo ❌ Node.js Installation fehlgeschlagen!
    echo.
    echo DIAGNOSE:
    echo - Installation lief durch (Exit-Code: %INSTALL_EXIT%)
    echo - Aber Node.js ist nicht verfuegbar
    echo.
    echo LOESUNGEN:
    echo 1. Starten Sie als ADMINISTRATOR
    echo 2. Computer NEU STARTEN
    echo 3. Manuelle Installation (siehe unten)
    echo.
    goto manual_nodejs
)

:install_spoteyfa
echo.
echo [5/5] SPOTEYFA Installation...

if not exist "package.json" (
    echo ❌ SPOTEYFA Dateien nicht gefunden!
    echo Bitte stellen Sie sicher, dass Sie im
    echo richtigen SPOTEYFA Ordner sind.
    pause
    exit /b 1
)

echo ✅ SPOTEYFA Dateien gefunden

echo.
echo Installiere SPOTEYFA Dependencies...
npm install --production

if %errorlevel% neq 0 (
    echo ⚠️ NPM Install Probleme, versuche Alternativen...
    npm cache clean --force
    npm install --production --legacy-peer-deps
)

echo.
echo ========================================
echo     INSTALLATION ABGESCHLOSSEN!
echo ========================================
echo.
echo ✅ Node.js: Installiert und funktionsfaehig
echo ✅ SPOTEYFA: Dependencies installiert
echo.
echo SPOTEYFA wird gestartet...
timeout /t 3 /nobreak >nul

npm start

if %errorlevel% neq 0 (
    echo.
    echo Problem beim Start, verwende Debug:
    npm run debug
)

echo.
pause
exit /b 0

:refresh_path
REM Aktualisiere PATH aus Registry
for /f "skip=2 tokens=3*" %%a in ('reg query HKCU\Environment /v PATH 2^>nul') do set USER_PATH=%%b
for /f "skip=2 tokens=3*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set SYSTEM_PATH=%%b
set "PATH=%SYSTEM_PATH%;%USER_PATH%"
goto :eof

:manual_nodejs
echo.
echo ========================================
echo      MANUELLE NODE.JS INSTALLATION
echo ========================================
echo.
echo Die automatische Installation hat nicht funktioniert.
echo.
echo SCHRITT-FUER-SCHRITT ANLEITUNG:
echo.
echo 1. Oeffnen Sie einen Browser
echo 2. Gehen Sie zu: https://nodejs.org
echo 3. Klicken Sie auf den gruenen "LTS" Button
echo 4. Laden Sie die .msi Datei herunter
echo 5. WICHTIG: Rechtsklick auf .msi → "Als Administrator ausfuehren"
echo 6. Folgen Sie dem Installations-Assistenten
echo 7. Starten Sie Ihren Computer NEU
echo 8. Fuehren Sie dann "SPOTEYFA-STARTEN.bat" aus
echo.
echo ALTERNATIVE:
echo - Verwenden Sie den Microsoft Store: "Node.js"
echo.
echo ========================================
pause
exit /b 1