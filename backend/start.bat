@echo off
REM Aigrit Backend Startup Script for Windows

echo 🚀 Starting Aigrit Backend Server...

REM Check if virtual environment exists
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo ⚠️  Please update the .env file with your configuration!
)

REM Initialize database
echo Initializing database...
python seed.py

REM Start the server
echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
python app.py

pause