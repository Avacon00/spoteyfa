@echo off
title SPOTEYFA - Portable Node.js Installer
color 0B
echo.
echo ========================================
echo    SPOTEYFA - PORTABLE NODE.JS
echo ========================================
echo.
echo Diese Version laedt eine portable Node.js
echo Version herunter - KEINE Installation noetig!
echo.
pause

echo.
echo [1/4] Systempruefung...

REM Pruefe ob Node.js bereits da ist
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js bereits vorhanden: %%i
    goto install_spoteyfa
)

echo ❌ Node.js nicht gefunden - lade portable Version

echo.
echo [2/4] Portable Node.js Download...

set NODEJS_DIR=%cd%\nodejs-portable
set NODEJS_ZIP=%TEMP%\nodejs-portable.zip

REM Bestimme Architektur
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    set NODEJS_URL=https://nodejs.org/dist/v18.19.0/node-v18.19.0-win-x64.zip
    set ARCH=x64
) else (
    set NODEJS_URL=https://nodejs.org/dist/v18.19.0/node-v18.19.0-win-x86.zip  
    set ARCH=x86
)

echo Lade portable Node.js %ARCH% herunter...
echo URL: %NODEJS_URL%
echo.

powershell -Command "
Write-Host 'Download startet...'
try {
    Invoke-WebRequest -Uri '%NODEJS_URL%' -OutFile '%NODEJS_ZIP%' -UseBasicParsing
    $size = (Get-Item '%NODEJS_ZIP%').Length / 1MB
    Write-Host ('Download komplett: {0:F1} MB' -f $size)
} catch {
    Write-Host ('Fehler: ' + $_.Exception.Message)  
    exit 1
}"

if %errorlevel% neq 0 (
    echo ❌ Download fehlgeschlagen!
    goto manual_install
)

if not exist "%NODEJS_ZIP%" (
    echo ❌ ZIP-Datei nicht erstellt!
    goto manual_install
)

echo ✅ Download erfolgreich

echo.
echo [3/4] Node.js entpacken...

if exist "%NODEJS_DIR%" (
    echo Loesche altes portable Node.js...
    rmdir "%NODEJS_DIR%" /s /q
)

echo Entpacke Node.js nach: %NODEJS_DIR%

powershell -Command "
try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory('%NODEJS_ZIP%', '%cd%')
    Write-Host 'Entpacken erfolgreich'
} catch {
    Write-Host ('Fehler beim Entpacken: ' + $_.Exception.Message)
    exit 1  
}"

if %errorlevel% neq 0 (
    echo ❌ Entpacken fehlgeschlagen!
    goto manual_install
)

REM Finde entpackten Node.js Ordner
for /d %%i in (node-v18.19.0-win-*) do (
    if exist "%%i\node.exe" (
        echo Benenne %%i zu nodejs-portable um...
        ren "%%i" "nodejs-portable"
    )
)

if not exist "%NODEJS_DIR%\node.exe" (
    echo ❌ Node.exe nicht gefunden nach Entpacken!
    goto manual_install
)

echo ✅ Node.js erfolgreich entpackt

REM Cleanup ZIP
del "%NODEJS_ZIP%" 2>nul

REM Fuege zu PATH hinzu
set "PATH=%NODEJS_DIR%;%PATH%"

echo.
echo Teste portable Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Portable Node.js funktioniert nicht!
    goto manual_install
)

for /f "tokens=*" %%i in ('node --version') do echo ✅ Portable Node.js: %%i

:install_spoteyfa
echo.
echo [4/4] SPOTEYFA Installation...

if not exist "package.json" (
    echo ❌ SPOTEYFA Dateien nicht gefunden!
    pause
    exit /b 1
)

echo Installiere SPOTEYFA mit portable Node.js...
npm install --production

if %errorlevel% neq 0 (
    echo ⚠️ Versuche alternative Installation...
    npm install --production --no-optional
)

echo.
echo ========================================
echo    PORTABLE INSTALLATION KOMPLETT!
echo ========================================
echo.
echo ✅ Portable Node.js: Funktionsfaehig
echo ✅ SPOTEYFA: Installiert
echo.
echo WICHTIG: Verwenden Sie ab jetzt:
echo "SPOTEYFA-PORTABLE-STARTEN.bat"
echo.

REM Erstelle portable Starter
echo @echo off > SPOTEYFA-PORTABLE-STARTEN.bat
echo title SPOTEYFA - Portable Start >> SPOTEYFA-PORTABLE-STARTEN.bat
echo set "PATH=%NODEJS_DIR%;%%PATH%%" >> SPOTEYFA-PORTABLE-STARTEN.bat
echo npm start >> SPOTEYFA-PORTABLE-STARTEN.bat
echo pause >> SPOTEYFA-PORTABLE-STARTEN.bat

echo ✅ Portable Starter erstellt: SPOTEYFA-PORTABLE-STARTEN.bat

echo.
echo SPOTEYFA wird gestartet...
timeout /t 3 /nobreak >nul

npm start

pause
exit /b 0

:manual_install
echo.
echo ❌ Portable Installation fehlgeschlagen
echo.
echo ALTERNATIVEN:
echo.
echo 1. MANUELLE INSTALLATION:
echo    - Gehen Sie zu https://nodejs.org
echo    - Laden Sie Node.js herunter
echo    - Als Administrator installieren
echo.
echo 2. MICROSOFT STORE:
echo    - Oeffnen Sie Microsoft Store
echo    - Suchen Sie "Node.js"
echo    - Installieren
echo.
echo 3. CHOCOLATEY (fuer Experten):
echo    - choco install nodejs
echo.
pause
exit /b 1