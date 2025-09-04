@echo off
title SPOTEYFA - Auto Start v0.3.0
color 0A
cd /d "%~dp0"

echo.
echo ========================================
echo    SPOTEYFA - AUTO START v0.3.0
echo ========================================
echo.

REM Pruefe ob Node.js verfuegbar ist
echo [1/3] Node.js Pruefung...

REM Teste systemweit installiertes Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ System Node.js: %%i
    goto start_app
)

REM Teste portable Node.js im lokalen Ordner
if exist "nodejs-portable\node.exe" (
    echo ✅ Portable Node.js gefunden
    set "PATH=%cd%\nodejs-portable;%PATH%"
    node --version >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=*" %%i in ('node --version') do echo ✅ Portable Node.js: %%i
        goto start_app
    )
)

echo ❌ Node.js nicht gefunden!
echo.
echo AUTOMATISCHE INSTALLATION wird gestartet...
echo.
pause

REM Versuche automatische Installation - DIREKT ohne Rekursion
echo Starte PORTABLE Node.js Installation...
if exist "PORTABLE-NODEJS.bat" (
    call PORTABLE-NODEJS.bat
    goto start_app
) else if exist "SUPER-INSTALLER.bat" (
    call SUPER-INSTALLER.bat
    goto start_app  
) else (
    echo ❌ Keine Installations-Scripts gefunden!
    echo.
    echo MANUELLE SCHRITTE:
    echo 1. Downloaden Sie Node.js von https://nodejs.org
    echo 2. Als Administrator installieren
    echo 3. Computer neu starten
    echo 4. Dieses Script erneut ausfuehren
    echo.
    pause
    exit /b 1
)

:start_app
echo.
echo [2/3] Dependencies pruefen...

REM Pruefe ob node_modules vorhanden
if not exist "node_modules" (
    echo ❌ Dependencies nicht installiert
    echo Installiere automatisch...
    npm install --production
    if %errorlevel% neq 0 (
        echo ❌ Dependency Installation fehlgeschlagen
        echo Versuche alternative Methoden...
        npm cache clean --force
        npm install --production --legacy-peer-deps
    )
)

if exist "node_modules" (
    echo ✅ Dependencies verfuegbar
) else (
    echo ❌ Dependencies Installation fehlgeschlagen!
    pause
    exit /b 1
)

echo.
echo [3/3] SPOTEYFA starten...
echo.

REM Starte SPOTEYFA
npm start

REM Fehlerbehandlung
if %errorlevel% neq 0 (
    echo.
    echo ❌ Start fehlgeschlagen! Versuche Debug-Modus...
    npm run debug
    
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Auch Debug-Modus fehlgeschlagen!
        echo.
        echo DIAGNOSE-INFORMATIONEN:
        echo - Node.js Version:
        node --version
        echo - NPM Version:
        npm --version
        echo - Verzeichnis:
        echo %cd%
        echo - Package.json vorhanden:
        if exist "package.json" (echo ✅ Ja) else (echo ❌ Nein)
        echo - Main.js vorhanden:
        if exist "main.js" (echo ✅ Ja) else (echo ❌ Nein)
        echo.
        echo LOESUNGSVORSCHLAEGE:
        echo 1. Als Administrator starten
        echo 2. Windows Defender temporaer deaktivieren
        echo 3. Portable Version verwenden
        echo.
    )
)

echo.
pause
exit /b 0