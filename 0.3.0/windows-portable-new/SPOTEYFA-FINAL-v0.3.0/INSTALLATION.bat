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
echo 1. SUPER-INSTALLER (empfohlen)
echo    - Robuste Node.js Installation
echo    - Zeigt Details
echo.
echo 2. PORTABLE NODE.JS (garantiert)
echo    - Keine Installation noetig
echo    - Funktioniert immer
echo.
echo 3. Hilfe
echo.
echo 4. Beenden
echo.
choice /c 1234 /m "Option"

if errorlevel 4 exit /b
if errorlevel 3 goto help
if errorlevel 2 call PORTABLE-NODEJS.bat & pause & exit /b
if errorlevel 1 call SUPER-INSTALLER.bat & pause & exit /b

:help
cls
echo.
echo HILFE:
echo.
echo Problem: "Installation eventuell nicht komplett"
echo Loesung: Verwenden Sie Option 2 (Portable)
echo.
echo Problem: "Node.js nicht installiert"
echo Loesung: Als Administrator starten oder Option 2
echo.
pause
exit /b