#!/bin/bash

# Azure App Service startup script for Flask application
echo "Starting Broken Conductor Detection Application..."

# Install any additional system dependencies if needed
# apt-get update && apt-get install -y <package-name>

# Start the Flask application with Gunicorn
echo "Starting Gunicorn server..."
exec gunicorn --bind=0.0.0.0:8000 --timeout 600 --workers=1 app:app