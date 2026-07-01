@echo off
set MESSAGE=%~1
if "%MESSAGE%"=="" (
    set /p MESSAGE="Commit message: "
)
if "%MESSAGE%"=="" (
    echo Commit message cannot be empty.
    exit /b 1
)
echo Safe Team Git Sync
echo Commit local work, rebase on latest origin/main, then push.
call "%~dp0git-push.bat" "%MESSAGE%"
