# 🔌 Broken Conductor Detection System - Azure Deployment

[![Deploy to Azure](https://github.com/your-username/bcf-detection-azure/actions/workflows/azure-deploy.yml/badge.svg)](https://github.com/your-username/bcf-detection-azure/actions/workflows/azure-deploy.yml)

A sophisticated **Broken Conductor Fault (BCF) Detection System** for electrical power distribution networks, deployed on **Microsoft Azure App Service** with automated CI/CD pipeline.

## 🌐 **Live Application**
**🔗 [https://bcf-detection-1759662837.azurewebsites.net](https://bcf-detection-1759662837.azurewebsites.net)**

## 🎯 **What This System Does**

This application simulates and detects broken conductor faults in electrical distribution systems using:

- **OpenDSS Simulation Engine** - Industry-standard electrical system modeling
- **Symmetrical Components Analysis** (Fortescue's Method) - Mathematical fault detection
- **ANSI 46BC Protection Logic** - Professional relay protection standards
- **Real-time Web Interface** - Interactive monitoring and control
- **Azure Cloud Deployment** - Scalable, production-ready hosting

### 🔧 **Technical Features**
- ✅ **Positive/Negative Sequence Current Analysis** (I1/I2 ratio)
- ✅ **Configurable Trip Thresholds** (Default: 15%)
- ✅ **Definite Time Delay Protection** (1.0 second)
- ✅ **Minimum Load Supervision** (8% of rated current)
- ✅ **Real-time Visualization** with Chart.js
- ✅ **RESTful API Endpoints**
- ✅ **Health Monitoring & Logging**

## 🚀 **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │◄──►│  Azure App       │◄──►│   OpenDSS       │
│   (Frontend)    │    │  Service         │    │   Engine        │
│                 │    │  (Flask/Python)  │    │   (Simulation)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────▼──────┐
                       │   GitHub    │
                       │   Actions   │
                       │   (CI/CD)   │
                       └─────────────┘
```

## 📋 **API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main web application |
| `/test` | GET | Health check endpoint |
| `/health` | GET | System health status |
| `/run_simulation` | GET | Execute BCF detection simulation |
| `/get_chart_data` | GET | Get visualization data (JSON) |

## 🛠 **Local Development**

### Prerequisites
- Python 3.9+
- pip package manager

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/bcf-detection-azure.git
cd bcf-detection-azure

# Install dependencies
pip install -r requirements.txt

# Run locally
python app.py
```

Visit: `http://localhost:5000`

### Test the Core Engine
```bash
python bcf_detecter.py
```

## ☁️ **Azure Deployment**

### Automated Deployment (GitHub Actions)
1. **Fork this repository**
2. **Get Azure Publish Profile:**
   - Go to Azure Portal → App Services → Your App
   - Click "Get publish profile" → Download
3. **Add to GitHub Secrets:**
   - Repository Settings → Secrets → Actions
   - Add `AZURE_WEBAPP_PUBLISH_PROFILE` with the downloaded content
4. **Push to main branch** - Automatic deployment! 🚀

### Manual Azure CLI Deployment
```bash
# Login to Azure
az login

# Create resources
az group create --name bcf-detection-rg --location "East US"
az appservice plan create --name bcf-plan --resource-group bcf-detection-rg --sku B1 --is-linux
az webapp create --resource-group bcf-detection-rg --plan bcf-plan --name YOUR-APP-NAME --runtime "PYTHON|3.9"

# Deploy code
az webapp deployment source config-zip --resource-group bcf-detection-rg --name YOUR-APP-NAME --src deploy.zip
```

## 📊 **System Performance**

### Healthy System Example:
```
--- CASE 1: HEALTHY OPERATION ---
> I1 Magnitude (Positive Sequence): 154.78 A (Min Req: 6.40 A)
> I2 Magnitude (Negative Sequence): 11.81 A
> Calculated Ratio I2/I1: 0.0763 (Threshold: 0.15)
I2/I1 ratio is normal.
-> Status: NORMAL
```

### Broken Conductor Detection:
```
--- CASE 2: SIMULATE BCF (Phase A Open) ---
> I1 Magnitude (Positive Sequence): 102.35 A (Min Req: 6.40 A)
> I2 Magnitude (Negative Sequence): 53.61 A
> Calculated Ratio I2/I1: 0.5237 (Threshold: 0.15)
Broken Conductor condition confirmed!
*** TRIP COMMAND ISSUED ***
-> Status: TRIPPED
```

## 🔧 **Configuration**

Key settings in `bcf_detecter.py`:
- `I2_I1_THRESHOLD = 0.15` - Trip threshold (15%)
- `RATED_CURRENT_AMPS = 80.0` - System rated current
- `I1_MIN_THRESHOLD_PU = 0.08` - Minimum operating current (8%)
- `TRIP_DELAY_SECONDS = 1.0` - Time delay for coordination

## 📁 **Project Structure**

```
├── app.py                      # Flask web application
├── bcf_detecter.py            # Core BCF detection engine
├── LT_Feeder_Model.dss        # OpenDSS electrical model
├── requirements.txt           # Python dependencies
├── runtime.txt               # Python version for Azure
├── startup.sh               # Production startup script
├── .github/workflows/       # GitHub Actions CI/CD
│   └── azure-deploy.yml
├── templates/              # HTML templates
│   └── index.html
├── static/                # CSS, JS, images
│   ├── css/style.css
│   └── js/main.js
└── README.md              # This file
```

## 💰 **Azure Costs**

| Tier | Monthly Cost | Features |
|------|-------------|----------|
| **Free** | $0 | 60 CPU min/day, 1GB storage |
| **B1 Basic** | ~$13 | Always on, custom domains |
| **S1 Standard** | ~$56 | Auto-scaling, staging slots |

## 🔒 **Security Features**

- ✅ **HTTPS Enforced** - SSL/TLS encryption
- ✅ **Input Validation** - Secure API endpoints
- ✅ **Timeout Protection** - Prevents hanging processes
- ✅ **Error Handling** - Graceful failure management
- ✅ **Health Monitoring** - System status tracking

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📜 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 **Awards & Recognition**

- **SIH 2025 Project** - Smart India Hackathon submission
- **Industry-Standard Implementation** - Uses professional protection standards
- **Cloud-Native Design** - Built for modern deployment practices

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/your-username/bcf-detection-azure/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/bcf-detection-azure/discussions)
- **Email**: peeyushrampal31@gmail.com

---

**⚡ Built with ❤️ for electrical engineers and smart grid applications**

[![Azure](https://img.shields.io/badge/Microsoft-Azure-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)