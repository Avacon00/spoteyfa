@echo off
title SPOTEYFA v0.3.0 Installation
color 0F
cls
echo.
echo =======================================
echo      SPOTEYFA v0.3.0 INSTALLATION
echo =======================================
echo.
echo Waehlen Sie:
echo.
echo 1. AUTO-START (NEU - Empfohlen)
echo    - Automatische Erkennung
echo    - Startet sofort
echo.
echo 2. SUPER-INSTALLER 
echo    - Robuste Node.js Installation
echo    - Zeigt Details
echo.
echo 3. PORTABLE NODE.JS (Garantiert)
echo    - Keine Installation noetig
echo    - Funktioniert immer
echo.
echo 4. Hilfe
echo.
echo 5. Beenden
echo.
choice /c 12345 /m "Option"

if errorlevel 5 exit /b
if errorlevel 4 goto help
if errorlevel 3 call PORTABLE-NODEJS.bat & pause & exit /b
if errorlevel 2 call SUPER-INSTALLER.bat & pause & exit /b
if errorlevel 1 call SPOTEYFA-AUTO-START.bat & pause & exit /b

:help
cls
echo.
echo HILFE:
echo.
echo Problem: "Node.js nicht installiert"
echo Loesung: Option 1 (AUTO-START) verwenden
echo.
echo Problem: "Installation eventuell nicht komplett"
echo Loesung: Option 3 (Portable) verwenden
echo.
echo Problem: "App startet nicht"
echo Loesung: Als Administrator starten
echo.
echo Empfehlung: Option 1 (AUTO-START) - erkennt
echo automatisch ob Node.js installiert ist und
echo installiert es falls noetig.
echo.
pause
exit /b