# ☁️ Azure Deployment - Quick Start Guide

## 🎯 **Your app is ready for Azure deployment!**

### 📋 **What I've prepared for you:**

1. **✅ Updated requirements.txt** - Added OpenDSSDirect.py and gunicorn
2. **✅ Azure-optimized app.py** - Production-ready Flask configuration
3. **✅ Runtime specification** - Python 3.9 runtime file
4. **✅ Startup script** - Gunicorn configuration for Azure
5. **✅ ARM Template** - Infrastructure as Code
6. **✅ GitHub Actions** - CI/CD pipeline
7. **✅ Automated deployment script** - One-click deployment

---

## 🚀 **3 Ways to Deploy:**

### **Option 1: Automated Script (Easiest)**
```bash
# Install Azure CLI first: https://docs.microsoft.com/cli/azure/install-azure-cli
./deploy.sh
```

### **Option 2: Manual Azure CLI**
```bash
# 1. Login and create resources
az login
az group create --name bcf-detection-rg --location "East US"
az appservice plan create --name bcf-plan --resource-group bcf-detection-rg --sku B1 --is-linux
az webapp create --resource-group bcf-detection-rg --plan bcf-plan --name YOUR-APP-NAME --runtime "PYTHON|3.9"

# 2. Configure settings
az webapp config appsettings set --resource-group bcf-detection-rg --name YOUR-APP-NAME --settings FLASK_APP=app.py FLASK_ENV=production SCM_DO_BUILD_DURING_DEPLOYMENT=true

# 3. Deploy code
zip -r deploy.zip . -x "*.git*" "*.pyc" "__pycache__/*" "venv/*"
az webapp deployment source config-zip --resource-group bcf-detection-rg --name YOUR-APP-NAME --src deploy.zip
```

### **Option 3: GitHub Actions (Recommended for production)**
1. Push code to GitHub
2. Get publish profile from Azure portal
3. Add `AZURE_WEBAPP_PUBLISH_PROFILE` to GitHub secrets
4. Push to main branch → automatic deployment!

---

## 📊 **After Deployment:**

### **Test URLs:**
- **Main App**: `https://your-app-name.azurewebsites.net/`
- **Health Check**: `https://your-app-name.azurewebsites.net/health`
- **API Test**: `https://your-app-name.azurewebsites.net/run_simulation`

### **Monitor Logs:**
```bash
az webapp log tail --resource-group bcf-detection-rg --name your-app-name
```

---

## 💰 **Cost Information:**
- **B1 Tier**: ~$13/month (perfect for development/testing)
- **S1 Tier**: ~$56/month (recommended for production)
- **Free Tier**: Available but limited (60 CPU minutes/day)

---

## 🔧 **Key Features Configured:**
- ✅ **Production WSGI Server** (Gunicorn)
- ✅ **Automatic SSL** (HTTPS)
- ✅ **Health Monitoring** (/health endpoint)
- ✅ **Error Handling** (Timeout protection)
- ✅ **Static File Serving** (CSS/JS/Images)
- ✅ **Environment Variables** (Production config)

---

## 🎉 **You're all set!**

Your Broken Conductor Detection application is now **Azure-ready** with:
- Professional production configuration
- Monitoring and health checks
- Scalable infrastructure
- CI/CD pipeline support

**Choose your deployment method above and get your app live in minutes!** 🚀