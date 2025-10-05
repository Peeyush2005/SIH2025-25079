# Deployment configuration for Azure App Service

# Environment Variables for Azure App Service:
# Set these in the Azure portal under Configuration > Application settings

ENVIRONMENT_VARIABLES = {
    'FLASK_APP': 'app.py',
    'FLASK_ENV': 'production',
    'FLASK_DEBUG': 'False',
    'PYTHONPATH': '/home/site/wwwroot',
    'SCM_DO_BUILD_DURING_DEPLOYMENT': 'true'
}

# Azure App Service specific notes:
# 1. The app will run on port 8000 by default
# 2. Azure automatically sets the PORT environment variable
# 3. Static files are served from the static/ and templates/ directories
# 4. Logs can be viewed in the Azure portal under Monitoring > Log stream