#!/bin/bash

# Azure App Service startup script for Node.js app with Python dependencies
echo "Starting BCF Detection Node.js Application..."

# Check if we're on Azure (look for WEBSITE_SITE_NAME environment variable)
if [ -n "$WEBSITE_SITE_NAME" ]; then
    echo "Running on Azure App Service"
    
    # Try to install Python if not available
    if ! command -v python3 &> /dev/null; then
        echo "Python3 not found, trying to install..."
        
        # Try different package managers
        if command -v apt-get &> /dev/null; then
            apt-get update && apt-get install -y python3 python3-pip
        elif command -v apk &> /dev/null; then
            apk add --no-cache python3 py3-pip
        else
            echo "Could not install Python3 - no package manager found"
        fi
    fi
    
    # Try to install Python dependencies
    if command -v python3 &> /dev/null; then
        echo "Installing Python dependencies..."
        python3 -m pip install --upgrade pip
        python3 -m pip install -r requirements.txt
        
        # Test OpenDSS
        python3 -c "import opendssdirect as dss; print('OpenDSS version:', dss.__version__)" 2>/dev/null || echo "OpenDSS not available"
    else
        echo "Python3 still not available after installation attempt"
    fi
else
    echo "Running locally"
fi

# Start the Node.js application
echo "Starting Node.js server on port ${PORT:-3000}..."
exec node server.js