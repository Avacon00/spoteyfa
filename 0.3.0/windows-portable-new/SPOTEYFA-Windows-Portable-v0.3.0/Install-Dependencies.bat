@echo off
title SPOTEYFA v0.3.0 - Install Dependencies
echo.
echo ====================================
echo  SPOTEYFA Dependency Installer
echo ====================================
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js first.
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
npm install --production

echo.
echo Installation complete!
echo You can now start SPOTEYFA with "Start-SPOTEYFA.bat"
echo.
pause
