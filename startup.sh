#!/bin/bash

# Azure App Service startup script for Node.js app with Python dependencies
echo "Starting Broken Conductor Detection Node.js Application..."

# Install Python and dependencies if not already installed
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "Installing Python3..."
    apt-get update
    apt-get install -y python3 python3-pip
else
    echo "Python3 already available"
fi

# Install Python dependencies
echo "Installing Python dependencies..."
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# Verify OpenDSS installation
echo "Verifying OpenDSS installation..."
python3 -c "import opendssdirect as dss; print('OpenDSS available:', dss.__version__)" || echo "OpenDSS installation check failed"

# Start the Node.js application
echo "Starting Node.js server..."
exec node server.js