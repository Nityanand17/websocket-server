# PowerShell script to run the TypeBlaze Socket.IO server

# Install dependencies if not already installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

# Run the server
Write-Host "Starting TypeBlaze Socket.IO server..."
npm run dev

# This script can be run with: .\run-server.ps1 