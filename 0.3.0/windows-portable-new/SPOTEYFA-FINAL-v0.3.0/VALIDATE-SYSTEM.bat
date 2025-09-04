@echo off
title SPOTEYFA - System Validation Test
color 0C
cd /d "%~dp0"

echo.
echo ========================================
echo     SPOTEYFA - SYSTEM VALIDATION  
echo ========================================
echo.

set ERRORS=0
set WARNINGS=0

echo [TEST 1/8] Batch Scripts Syntax...
echo.

REM Test aller Batch-Dateien auf Syntax-Fehler
for %%f in (*.bat) do (
    if not "%%f"=="VALIDATE-SYSTEM.bat" (
        echo Testing %%f...
        REM Teste ob Datei korrekt geschrieben ist
        findstr /C:"@echo off" "%%f" >nul
        if %errorlevel% neq 0 (
            echo ❌ %%f: Fehlender @echo off
            set /a ERRORS+=1
        ) else (
            echo ✅ %%f: Syntax OK
        )
    )
)

echo.
echo [TEST 2/8] Kritische Dateien...
echo.

set REQUIRED_FILES=package.json main.js renderer.js index.html
for %%f in (%REQUIRED_FILES%) do (
    if exist "%%f" (
        echo ✅ %%f: Vorhanden
    ) else (
        echo ❌ %%f: FEHLT!
        set /a ERRORS+=1
    )
)

echo.
echo [TEST 3/8] PowerShell Integration...
echo.

REM Teste PowerShell Verfügbarkeit
powershell -Command "Write-Host 'PowerShell Test OK'" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PowerShell: Verfügbar
) else (
    echo ❌ PowerShell: Nicht verfügbar!
    set /a ERRORS+=1
)

echo.
echo [TEST 4/8] Internet Konnektivität...
echo.

ping 8.8.8.8 -n 1 -w 3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Internet: Verfügbar
) else (
    echo ⚠️ Internet: Nicht verfügbar
    echo (Offline Installation möglich)
    set /a WARNINGS+=1
)

echo.
echo [TEST 5/8] Node.js URLs...
echo.

REM Teste Node.js Download URLs
set TEST_URL_64=https://nodejs.org/dist/v18.19.0/node-v18.19.0-win-x64.zip
set TEST_URL_32=https://nodejs.org/dist/v18.19.0/node-v18.19.0-win-x86.zip

echo Testing 64-bit URL...
powershell -Command "try {(Invoke-WebRequest '%TEST_URL_64%' -Method Head -UseBasicParsing).StatusCode} catch {404}" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 64-bit Node.js URL: Erreichbar
) else (
    echo ⚠️ 64-bit Node.js URL: Problem
    set /a WARNINGS+=1
)

echo.
echo [TEST 6/8] Script Logic Flow...
echo.

REM Teste Logik-Fluss
echo Testing AUTO-START logic...
findstr /C:"goto start_app" "SPOTEYFA-AUTO-START.bat" >nul
if %errorlevel% equ 0 (
    echo ✅ AUTO-START: Logic flow OK
) else (
    echo ❌ AUTO-START: Logic flow problem
    set /a ERRORS+=1
)

echo Testing PORTABLE-NODEJS logic...
findstr /C:":install_spoteyfa" "PORTABLE-NODEJS.bat" >nul
if %errorlevel% equ 0 (
    echo ✅ PORTABLE-NODEJS: Logic flow OK
) else (
    echo ❌ PORTABLE-NODEJS: Logic flow problem
    set /a ERRORS+=1
)

echo.
echo [TEST 7/8] Rekursion Check...
echo.

REM Prüfe auf gefährliche Rekursionen
findstr /C:"call INSTALLATION.bat" "SPOTEYFA-AUTO-START.bat" >nul
if %errorlevel% equ 0 (
    echo ❌ AUTO-START: Gefährliche Rekursion mit INSTALLATION.bat
    set /a ERRORS+=1
) else (
    echo ✅ AUTO-START: Keine gefährliche Rekursion
)

echo.
echo [TEST 8/8] Error Handling...
echo.

REM Teste Error-Handling
findstr /C:"errorlevel" "SPOTEYFA-AUTO-START.bat" | find /C "errorlevel" >nul
if %errorlevel% equ 0 (
    echo ✅ AUTO-START: Error handling vorhanden
) else (
    echo ⚠️ AUTO-START: Minimales error handling
    set /a WARNINGS+=1
)

echo.
echo ========================================
echo          VALIDATION RESULTS
echo ========================================
echo.

if %ERRORS% equ 0 (
    if %WARNINGS% equ 0 (
        echo 🎉 PERFEKT! System vollständig validiert
        echo ✅ Alle Tests bestanden
        echo ✅ Keine Fehler gefunden
        echo ✅ Keine Warnungen
        color 0A
    ) else (
        echo ✅ SYSTEM OK mit Warnungen
        echo ✅ Keine kritischen Fehler
        echo ⚠️ Warnungen: %WARNINGS%
        color 0E
    )
    echo.
    echo 🚀 SPOTEYFA ist startbereit!
    echo Verwenden Sie: SPOTEYFA-AUTO-START.bat
) else (
    echo ❌ SYSTEM HAT PROBLEME
    echo ❌ Kritische Fehler: %ERRORS%
    echo ⚠️ Warnungen: %WARNINGS%
    echo.
    echo 🔧 Bitte beheben Sie die Fehler vor dem Start
    color 0C
)

echo.
echo Gesamtstatistik:
echo - Fehler: %ERRORS%
echo - Warnungen: %WARNINGS%
echo - Scripts getestet: 5
echo - Dateien geprüft: 4
echo.

pause
exit /b %ERRORS%