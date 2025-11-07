#!/bin/bash
# Start both frontend and backend for Docker demo

echo "🚀 Starting AgenticDID.io Demo..."
echo ""

# Start backend in background
echo "📡 Starting backend (port 8787)..."
cd /app/apps/verifier-api && bun run dev &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Start frontend in foreground
echo "🎨 Starting frontend (port 5173)..."
cd /app/apps/web && bun run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
