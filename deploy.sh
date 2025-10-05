#!/bin/bash

# Azure Deployment Script for Broken Conductor Detection App
# Run this script to deploy the application to Azure App Service

set -e

echo "🚀 Starting Azure deployment for Broken Conductor Detection App..."

# Configuration
RESOURCE_GROUP="bcf-detection-rg"
APP_SERVICE_PLAN="bcf-detection-plan"
WEB_APP_NAME="broken-conductor-detection-$(date +%s)"  # Add timestamp for uniqueness
LOCATION="East US"
SKU="B1"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login check
echo "🔐 Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Please login to Azure first:"
    az login
fi

# Get current subscription
SUBSCRIPTION=$(az account show --query name -o tsv)
echo "📋 Using subscription: $SUBSCRIPTION"

# Create resource group
echo "📦 Creating resource group: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output table

# Create App Service plan
echo "🏗️  Creating App Service plan: $APP_SERVICE_PLAN"
az appservice plan create \
    --name "$APP_SERVICE_PLAN" \
    --resource-group "$RESOURCE_GROUP" \
    --sku "$SKU" \
    --is-linux \
    --output table

# Create Web App
echo "🌐 Creating Web App: $WEB_APP_NAME"
az webapp create \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$APP_SERVICE_PLAN" \
    --name "$WEB_APP_NAME" \
    --runtime "PYTHON|3.9" \
    --output table

# Configure app settings
echo "⚙️  Configuring application settings..."
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEB_APP_NAME" \
    --settings \
        FLASK_APP=app.py \
        FLASK_ENV=production \
        FLASK_DEBUG=False \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    --output table

# Set startup command
echo "🔧 Setting startup command..."
az webapp config set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEB_APP_NAME" \
    --startup-file "gunicorn --bind=0.0.0.0 --timeout 600 app:app" \
    --output table

# Create deployment package
echo "📁 Creating deployment package..."
rm -f deploy.zip
zip -r deploy.zip . -x "*.git*" "*.pyc" "__pycache__/*" "venv/*" "*.zip" "deploy.sh"

# Deploy application
echo "🚀 Deploying application..."
az webapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEB_APP_NAME" \
    --src deploy.zip

# Get the URL
APP_URL="https://$WEB_APP_NAME.azurewebsites.net"

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Web App Name: $WEB_APP_NAME"
echo "   URL: $APP_URL"
echo ""
echo "🔗 Access your application:"
echo "   Main App: $APP_URL"
echo "   Health Check: $APP_URL/health"
echo "   Test Page: $APP_URL/test"
echo ""
echo "📊 Monitor your app:"
echo "   az webapp log tail --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME"
echo ""
echo "🗑️  To delete resources when done:"
echo "   az group delete --name $RESOURCE_GROUP --yes --no-wait"

# Clean up
rm -f deploy.zip

echo ""
echo "🎉 Happy monitoring! Your Broken Conductor Detection app is now live on Azure!"