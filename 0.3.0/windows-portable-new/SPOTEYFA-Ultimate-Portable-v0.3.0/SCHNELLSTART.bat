@echo off
title SPOTEYFA v0.3.0 - Schnellstart-Anleitung
color 0F
mode con: cols=90 lines=35

cls
echo.
echo ===============================================================================
echo                    SPOTEYFA v0.3.0 - SCHNELLSTART-ANLEITUNG                     
echo                          Apple-Style Spotify Player                             
echo ===============================================================================
echo.
echo   Wählen Sie Ihre bevorzugte Installationsmethode:
echo.
echo   🟢 FÜR ANFÄNGER (Vollautomatisch):
echo      Doppelklick auf: SPOTEYFA-ONE-CLICK.bat
echo      ➤ Alles wird automatisch installiert und gestartet
echo      ➤ Keine Eingaben erforderlich
echo      ➤ Perfekt für Benutzer ohne Programmiererfahrung
echo.
echo   🟡 MIT BESTÄTIGUNG (Halb-Automatisch):
echo      Doppelklick auf: SPOTEYFA-Auto-Installer.bat
echo      ➤ Fragt nach Admin-Rechten und Bestätigung
echo      ➤ Dann automatische Installation
echo      ➤ Für Benutzer die Kontrolle wollen
echo.
echo   🔵 TRADITIONELL (Manuell):
echo      1. Installieren Sie Node.js von https://nodejs.org
echo      2. Doppelklick auf: Start-SPOTEYFA.bat
echo      ➤ Für erfahrene Benutzer
echo      ➤ Wenn Sie Node.js bereits haben
echo.
echo ===============================================================================
echo.
echo   📚 DETAILLIERTE ANLEITUNG:
echo      Öffnen Sie: README-INSTALLATION.md
echo.
echo   🆘 BEI PROBLEMEN:
echo      - Verwenden Sie Debug-SPOTEYFA.bat für Fehlerdetails
echo      - Verwenden Sie Force-Show-SPOTEYFA.bat bei UI-Problemen
echo      - Lesen Sie README-INSTALLATION.md für Lösungen
echo.
echo ===============================================================================
echo.
echo   Welche Methode möchten Sie verwenden?
echo.
choice /c 123X /m "1=Ein-Klick, 2=Auto-Installer, 3=Manuell, X=Beenden"

if errorlevel 4 exit /b 0
if errorlevel 3 (
    echo.
    echo Öffne Start-SPOTEYFA.bat...
    start "" "Start-SPOTEYFA.bat"
    exit /b 0
)
if errorlevel 2 (
    echo.
    echo Öffne SPOTEYFA-Auto-Installer.bat...
    start "" "SPOTEYFA-Auto-Installer.bat"
    exit /b 0
)
if errorlevel 1 (
    echo.
    echo Öffne SPOTEYFA-ONE-CLICK.bat...
    start "" "SPOTEYFA-ONE-CLICK.bat"
    exit /b 0
)

exit /b 0