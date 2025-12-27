@echo off
REM GearGuard Backend - Start Development Server
echo.
echo ========================================
echo    GearGuard - Starting Server
echo ========================================
echo.

cd /d %~dp0backend

echo Activating virtual environment...
call ..\..\.venv\Scripts\activate.bat

echo.
echo Starting Django development server...
echo.
echo API will be available at: http://localhost:8000/api/
echo Admin panel at: http://localhost:8000/admin/
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver

pause
