@echo off
echo =====================================
echo SPOTEYFA v0.3.0 - Windows Fix Script
echo =====================================
echo.
echo Problem: SPOTEYFA starts but no window appears
echo Solution: Force show window and reset position
echo.
pause

echo Killing existing SPOTEYFA processes...
taskkill /f /im SPOTEYFA.exe 2>nul
taskkill /f /im "Apple Spotify Player.exe" 2>nul  
taskkill /f /im electron.exe 2>nul

echo Waiting 2 seconds...
timeout /t 2 >nul

echo Attempting to start SPOTEYFA with debug options...
echo.

rem Try multiple possible installation paths
if exist "%LOCALAPPDATA%\Programs\SPOTEYFA\SPOTEYFA.exe" (
    echo Found SPOTEYFA in LocalAppData...
    cd /d "%LOCALAPPDATA%\Programs\SPOTEYFA"
    echo Starting with window force-show...
    start "" "SPOTEYFA.exe" --show --enable-logging --log-level=0
    goto :success
)

if exist "%ProgramFiles%\SPOTEYFA\SPOTEYFA.exe" (
    echo Found SPOTEYFA in Program Files...
    cd /d "%ProgramFiles%\SPOTEYFA"
    echo Starting with window force-show...
    start "" "SPOTEYFA.exe" --show --enable-logging --log-level=0
    goto :success
)

if exist "%ProgramFiles(x86)%\SPOTEYFA\SPOTEYFA.exe" (
    echo Found SPOTEYFA in Program Files x86...
    cd /d "%ProgramFiles(x86)%\SPOTEYFA"
    echo Starting with window force-show...
    start "" "SPOTEYFA.exe" --show --enable-logging --log-level=0
    goto :success
)

echo ERROR: SPOTEYFA.exe not found in common locations!
echo.
echo Please check these directories:
echo - %LOCALAPPDATA%\Programs\SPOTEYFA\
echo - %ProgramFiles%\SPOTEYFA\
echo - %ProgramFiles(x86)%\SPOTEYFA\
echo.
echo Or try reinstalling SPOTEYFA as Administrator.
pause
exit /b 1

:success
echo.
echo SPOTEYFA started with debug flags!
echo.
echo If you still don't see the window:
echo 1. Check Task Manager - is SPOTEYFA.exe running?
echo 2. Try Win+Tab to see if window is on another desktop
echo 3. Check if Spotify is running
echo 4. Look for any error messages above
echo.
echo This window will close in 10 seconds...
timeout /t 10
exit /b 0