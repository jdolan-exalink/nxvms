@REM NXvms Version Management Script (Windows)
@REM Usage: .\scripts\update-version.bat <version>
@REM Example: .\scripts\update-version.bat 0.2.0

@echo off
setlocal enabledelayedexpansion

set "VERSION=%1"

if "%VERSION%"=="" (
  echo Error: Version not provided
  echo Usage: .\scripts\update-version.bat ^<version^>
  echo Example: .\scripts\update-version.bat 0.2.0
  exit /b 1
)

REM Simple validation - just check for dots
echo %VERSION% | find "." >nul
if errorlevel 1 (
  echo Error: Invalid version format: %VERSION%
  echo Please use semantic versioning: X.Y.Z
  exit /b 1
)

echo 📦 Updating NXvms to version %VERSION%...

REM Update .version file
(echo %VERSION%) > .version
echo ✅ Updated .version

REM Update client package.json
cd client
call npm version %VERSION% --no-git-tag-v
if errorlevel 1 exit /b 1
echo ✅ Updated client/package.json

REM Update server package.json if exists
if exist "..\server\package.json" (
  cd ..\server
  call npm version %VERSION% --no-git-tag-v
  if errorlevel 1 exit /b 1
  echo ✅ Updated server/package.json
  cd ..
)

echo.
echo ✨ Version updated to %VERSION%!
echo.
echo 📝 Next steps:
echo 1. Review the changes: git status
echo 2. Commit: git add . && git commit -m "chore: release v%VERSION%"
echo 3. Tag: git tag -a v%VERSION% -m "Release version %VERSION%"
echo 4. Push: git push origin main --tags
