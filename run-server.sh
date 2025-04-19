#!/bin/bash

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the server
echo "Starting TypeBlaze Socket.IO server..."
npm run dev

# This script can be run with: sh run-server.sh 