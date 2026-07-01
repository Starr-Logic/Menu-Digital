#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
cd "$PROJECT_ROOT"

echo "Cleaning up old processes on ports 3000 and 5173..."
fuser -k 3000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null
fuser -k 5174/tcp 2>/dev/null
fuser -k 5175/tcp 2>/dev/null
fuser -k 24679/tcp 2>/dev/null
sleep 1

echo "Starting Backend API server..."
cd Backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "Starting Frontend Vite server..."
cd Frontend
npm run dev &
FRONTEND_PID=$!
cd ..

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait $BACKEND_PID $FRONTEND_PID
