@echo off
title SPOTEYFA v0.3.0 - Startup
echo.
echo ====================================
echo  SPOTEYFA v0.3.0 Portable
echo  Apple-Style Spotify Player
echo ====================================
echo.
echo Starting SPOTEYFA...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is required but not found!
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install --production
    echo.
)

REM Start SPOTEYFA
echo Launching SPOTEYFA Player...
npm start

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start SPOTEYFA
    echo Trying debug mode...
    npm run debug
)

echo.
pause
