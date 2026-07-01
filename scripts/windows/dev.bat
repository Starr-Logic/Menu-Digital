@echo off
cd %~dp0..\..

echo Starting Backend API server...
start "Menu Digital - Backend" cmd /c "cd Backend && npm run dev"

echo Starting Frontend Vite server...
start "Menu Digital - Frontend" cmd /c "cd Frontend && npm run dev"
