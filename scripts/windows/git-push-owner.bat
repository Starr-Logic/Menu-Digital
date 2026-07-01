@echo off
set MESSAGE=%~1
if "%MESSAGE%"=="" (
    echo Please provide a commit message.
    echo Usage: git-push-owner.bat "commit message"
    exit /b 1
)

git add .
git commit -m "%MESSAGE%"

echo Pulling and rebasing from origin main...
git pull --rebase origin main
if %errorlevel% neq 0 (
    echo =========================================
    echo ERROR: Conflict detected during pull!
    echo Please resolve conflicts manually, then run:
    echo   git rebase --continue
    echo   git push origin main
    echo =========================================
    exit /b 1
)

echo Pushing to origin main (Owner)...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    exit /b 1
)
echo Done!
