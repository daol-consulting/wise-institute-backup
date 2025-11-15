#!/bin/bash

# WISE Institute Development Script
echo "🌐 WISE Institute Website Development"
echo "====================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development server
echo "🚀 Starting development server..."
echo "📍 Open http://localhost:3000 in your browser"
echo ""

npm run dev
