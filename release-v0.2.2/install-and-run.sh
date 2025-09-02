#!/bin/bash
echo "🎵 Apple Spotify Player - Setup"
echo "================================"
echo
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Installation failed!"
    echo "Please make sure Node.js is installed."
    exit 1
fi

echo
echo "✅ Installation completed!"
echo
echo "Starting Apple Spotify Player..."
npm start
