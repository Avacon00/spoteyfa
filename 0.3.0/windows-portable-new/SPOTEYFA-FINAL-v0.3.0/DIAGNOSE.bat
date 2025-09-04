@echo off
title SPOTEYFA - System Diagnose
color 0E
cd /d "%~dp0"

echo.
echo ========================================
echo    SPOTEYFA - SYSTEM DIAGNOSE
echo ========================================
echo.

echo [1/6] System-Informationen...
echo Betriebssystem: %OS%
echo Architektur: %PROCESSOR_ARCHITECTURE%
echo Benutzer: %USERNAME%
echo Verzeichnis: %cd%
echo.

echo [2/6] Node.js Pruefung...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ System Node.js: %%i
) else (
    echo ❌ System Node.js: Nicht gefunden
)

if exist "nodejs-portable\node.exe" (
    echo ✅ Portable Node.js: Verfügbar
    nodejs-portable\node.exe --version
) else (
    echo ❌ Portable Node.js: Nicht verfügbar
)
echo.

echo [3/6] Berechtigungen...
net session >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Administrator-Rechte: Verfügbar
) else (
    echo ⚠️ Administrator-Rechte: Nicht verfügbar
)
echo.

echo [4/6] Internet-Verbindung...
ping 8.8.8.8 -n 1 -w 3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Internet: Verfügbar
) else (
    echo ❌ Internet: Nicht verfügbar
)
echo.

echo [5/6] SPOTEYFA Dateien...
set MISSING_FILES=0

if exist "package.json" (
    echo ✅ package.json
) else (
    echo ❌ package.json fehlt
    set /a MISSING_FILES+=1
)

if exist "main.js" (
    echo ✅ main.js
) else (
    echo ❌ main.js fehlt
    set /a MISSING_FILES+=1
)

if exist "index.html" (
    echo ✅ index.html
) else (
    echo ❌ index.html fehlt
    set /a MISSING_FILES+=1
)

if exist "node_modules" (
    echo ✅ node_modules (Dependencies installiert)
) else (
    echo ⚠️ node_modules (Dependencies nicht installiert)
)
echo.

echo [6/6] Empfehlungen...
if %MISSING_FILES% gtr 0 (
    echo ❌ Kritische Dateien fehlen! 
    echo Laden Sie SPOTEYFA erneut herunter.
) else if not exist "node_modules" (
    echo ⚠️ Dependencies fehlen
    echo Führen Sie SPOTEYFA-AUTO-START.bat aus
) else (
    echo ✅ System bereit für SPOTEYFA
)
echo.

echo ========================================
echo           DIAGNOSE KOMPLETT
echo ========================================
echo.

if %MISSING_FILES% equ 0 (
    if exist "node_modules" (
        echo 🚀 SPOTEYFA kann gestartet werden:
        echo    SPOTEYFA-AUTO-START.bat
    ) else (
        echo 🔧 Installieren Sie zuerst Dependencies:
        echo    INSTALLATION.bat
    )
) else (
    echo 💿 Laden Sie SPOTEYFA neu herunter
)

echo.
pause
exit /b 0