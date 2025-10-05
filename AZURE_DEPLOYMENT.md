# Broken Conductor Detection - Azure Deployment Guide

## Prerequisites
- Azure subscription
- Azure CLI installed locally
- Git repository (this project)

## Quick Deployment Methods

### Method 1: Azure CLI Deployment (Recommended)

1. **Login to Azure:**
```bash
az login
```

2. **Create Resource Group:**
```bash
az group create --name bcf-detection-rg --location "East US"
```

3. **Create App Service Plan:**
```bash
az appservice plan create --name bcf-detection-plan --resource-group bcf-detection-rg --sku B1 --is-linux
```

4. **Create Web App:**
```bash
az webapp create --resource-group bcf-detection-rg --plan bcf-detection-plan --name broken-conductor-detection --runtime "PYTHON|3.9"
```

5. **Configure App Settings:**
```bash
az webapp config appsettings set --resource-group bcf-detection-rg --name broken-conductor-detection --settings FLASK_APP=app.py FLASK_ENV=production SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

6. **Deploy Code:**
```bash
# From your project directory
az webapp deployment source config-zip --resource-group bcf-detection-rg --name broken-conductor-detection --src deploy.zip
```

### Method 2: GitHub Actions Deployment

1. **Set up GitHub repository secrets:**
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Download from Azure portal
   - `AZURE_WEBAPP_NAME`: Your web app name

2. **Push to main branch** - GitHub Actions will automatically deploy

### Method 3: Azure Resource Manager Template

```bash
az deployment group create --resource-group bcf-detection-rg --template-file azure-deploy-template.json --parameters webAppName=broken-conductor-detection
```

## Post-Deployment Configuration

### Environment Variables (Set in Azure Portal)
- `FLASK_APP`: app.py
- `FLASK_ENV`: production
- `FLASK_DEBUG`: False
- `SCM_DO_BUILD_DURING_DEPLOYMENT`: true

### Startup Command
Set in Azure Portal under Configuration > General Settings:
```
gunicorn --bind=0.0.0.0 --timeout 600 app:app
```

## Monitoring and Troubleshooting

### View Logs
```bash
az webapp log tail --resource-group bcf-detection-rg --name broken-conductor-detection
```

### Health Check
Visit: `https://your-app-name.azurewebsites.net/health`

### Test Endpoints
- Main app: `https://your-app-name.azurewebsites.net/`
- Test: `https://your-app-name.azurewebsites.net/test`
- Simulation: `https://your-app-name.azurewebsites.net/run_simulation`

## Scaling and Performance

### Scale Up (Better Performance)
```bash
az appservice plan update --name bcf-detection-plan --resource-group bcf-detection-rg --sku S1
```

### Scale Out (More Instances)
```bash
az webapp scale --resource-group bcf-detection-rg --name broken-conductor-detection --instance-count 2
```

## Cost Optimization
- Use B1 tier for development/testing
- Use S1+ for production
- Enable auto-scaling based on CPU/memory metrics

## Security Best Practices
- Enable HTTPS only
- Set up authentication if needed
- Configure CORS if accessing from different domains
- Use Application Insights for monitoring