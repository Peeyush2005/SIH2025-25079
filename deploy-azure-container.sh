#!/bin/bash

# Azure Container Instance Deployment for BCF Detection System
# This approach ensures OpenDSS works properly with full Python environment

set -e

echo "🚀 Deploying BCF Detection System to Azure Container Instances..."

# Configuration
RESOURCE_GROUP="bcf-detection-rg"
CONTAINER_NAME="bcf-detection-app"
LOCATION="East US"
IMAGE_NAME="bcf-detection:latest"
REGISTRY_NAME="bcfdetectionregistry"

# Create resource group if it doesn't exist
echo "📝 Creating resource group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION" --output table

# Create Azure Container Registry
echo "🏗️ Creating Azure Container Registry..."
az acr create --resource-group $RESOURCE_GROUP --name $REGISTRY_NAME --sku Basic --admin-enabled true --output table

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $REGISTRY_NAME --resource-group $RESOURCE_GROUP --query "loginServer" --output tsv)
ACR_USERNAME=$(az acr credential show --name $REGISTRY_NAME --resource-group $RESOURCE_GROUP --query "username" --output tsv)
ACR_PASSWORD=$(az acr credential show --name $REGISTRY_NAME --resource-group $RESOURCE_GROUP --query "passwords[0].value" --output tsv)

echo "🔐 ACR Details:"
echo "  Server: $ACR_LOGIN_SERVER"
echo "  Username: $ACR_USERNAME"

# Build and push Docker image
echo "🐳 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "🏷️ Tagging image for ACR..."
docker tag $IMAGE_NAME $ACR_LOGIN_SERVER/$IMAGE_NAME

echo "🔑 Logging into ACR..."
az acr login --name $REGISTRY_NAME

echo "📤 Pushing image to ACR..."
docker push $ACR_LOGIN_SERVER/$IMAGE_NAME

# Deploy to Azure Container Instances
echo "☁️ Deploying to Azure Container Instances..."
az container create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --image $ACR_LOGIN_SERVER/$IMAGE_NAME \
  --registry-login-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label bcf-detection-$(date +%s) \
  --ports 3000 \
  --cpu 1 \
  --memory 2 \
  --environment-variables NODE_ENV=production PORT=3000 \
  --output table

# Get the FQDN
FQDN=$(az container show --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME --query "ipAddress.fqdn" --output tsv)

echo ""
echo "🎉 Deployment Complete!"
echo "🌐 Your BCF Detection System is now available at:"
echo "   http://$FQDN:3000"
echo ""
echo "🔧 Test endpoints:"
echo "   Health: http://$FQDN:3000/api/health"
echo "   BCF Simulation: http://$FQDN:3000/api/run"
echo ""
echo "📊 View logs: az container logs --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME"