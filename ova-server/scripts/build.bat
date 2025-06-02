@echo off

REM Paths
set BUILD_DIR=builds
set FRONTEND_DIST=frontend\dist\frontend
set FFMPEG_DIR=thirdparty\ffmpeg

REM Clean the builds folder
if exist "%BUILD_DIR%" (
    echo Cleaning existing builds folder...
    rmdir /S /Q "%BUILD_DIR%" > nul 2>&1
)

REM Recreate builds folder
mkdir "%BUILD_DIR%" > nul 2>&1

REM Check if frontend dist folder exists
if not exist "%FRONTEND_DIST%" (
    echo Frontend build not found!
    echo Please run 'ng build --configuration production' in the frontend project before building the server.
    exit /b 1
)

REM Copy frontend dist folder to builds folder
echo Copying frontend build files...
xcopy "%FRONTEND_DIST%" "%BUILD_DIR%\frontend" /E /I /Y > nul 2>&1

REM Copy ffmpeg folder to builds folder
if exist "%FFMPEG_DIR%" (
    echo Copying ffmpeg files...
    xcopy "%FFMPEG_DIR%" "%BUILD_DIR%\ffmpeg" /E /I /Y > nul 2>&1
) else (
    echo WARNING: ffmpeg folder not found at %FFMPEG_DIR%, skipping copy.
)

REM Build the Go server
echo Building Go server...
go build -o %BUILD_DIR%\ova-server.exe .\source-code > nul 2>&1

echo Build completed and files copied.
