@echo off
setlocal

REM Paths
set BUILD_DIR=builds\ova-cli
set FRONTEND_DIST=core\frontend\dist\frontend
set OVASERVER_DIR=core\ova-cli
set FFMPEG_DIR=thirdparty\ffmpeg
set SSL_DIR=thirdparty\ssl

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

REM Copy ssl folder to builds folder
if exist "%SSL_DIR%" (
    echo Copying ssl files...
    xcopy "%SSL_DIR%" "%BUILD_DIR%\ssl" /E /I /Y > nul 2>&1
) else (
    echo WARNING: ssl folder not found at %SSL_DIR%, skipping copy.
)

REM Build the Go server using -C to change working directory
echo Building Go server...
go -C "%OVASERVER_DIR%" build -o "..\..\%BUILD_DIR%\ovacli.exe" > nul 2>&1

if exist "%BUILD_DIR%\ovacli.exe" (
    echo Build completed and files copied successfully.
) else (
    echo ERROR: Go build failed. Please check for errors in the Go project.
    exit /b 1
)

endlocal
