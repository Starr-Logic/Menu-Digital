@echo off
set MESSAGE=%~1
if "%MESSAGE%"=="" (
    echo Please provide a commit message.
    echo Usage: git-push-team.bat "commit message"
    exit /b 1
)

git add .
git commit -m "%MESSAGE%"

for /f "tokens=*" %%a in ('git branch --show-current') do set CURRENT_BRANCH=%%a

echo Pulling and rebasing from origin %CURRENT_BRANCH%...
git pull --rebase origin %CURRENT_BRANCH%
if %errorlevel% neq 0 (
    echo =========================================
    echo ERROR: Conflict detected during pull!
    echo Please resolve conflicts manually, then run:
    echo   git rebase --continue
    echo   git push origin %CURRENT_BRANCH%
    echo =========================================
    exit /b 1
)

echo Pushing to origin %CURRENT_BRANCH% (Team)...
git push origin %CURRENT_BRANCH%
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    exit /b 1
)
echo Done!
