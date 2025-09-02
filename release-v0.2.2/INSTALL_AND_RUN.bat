@echo off
echo.
echo ====================================
echo  Apple Spotify Player - Setup
echo ====================================
echo.
echo Installing dependencies...
npm install
if errorlevel 1 (
    echo.
    echo ❌ Installation failed!
    echo Please make sure Node.js is installed.
    pause
    exit /b 1
)

echo.
echo ✅ Installation completed!
echo.
echo Starting Apple Spotify Player...
npm start

pause
