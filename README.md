# 🌱 EcoMeter - Car CO₂ Emissions Predictor

A full-stack MERN application with machine learning capabilities to predict car CO₂ emissions based on engine specifications. Built for MERN developers new to ML, this project provides a complete working example of integrating machine learning into a web application.

## 🚀 Live Demo

- **Frontend**: [Deployed on Vercel](https://your-app.vercel.app)
- **Backend API**: [Deployed on Render](https://your-backend.onrender.com)
- **ML Service**: [Deployed on Render](https://your-ml-service.onrender.com)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Docker Setup](#docker-setup)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Machine Learning Model](#machine-learning-model)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🎯 Core Features
- **CO₂ Prediction**: Predict car emissions based on engine size, cylinders, and fuel consumption
- **Real-time Results**: Instant predictions using trained ML model
- **Prediction History**: Track and manage prediction history with pagination
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Validation**: Comprehensive input validation on frontend and backend

### 🔧 Technical Features
- **Machine Learning Pipeline**: Trained Linear Regression model with feature scaling
- **RESTful API**: Well-structured API with proper error handling
- **Database Integration**: MongoDB for persistent data storage
- **Health Monitoring**: Health check endpoints for all services
- **Docker Support**: Complete containerization for easy deployment
- **CORS Configured**: Proper cross-origin resource sharing setup

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Toastify** - Toast notifications
- **Axios** - HTTP client for API calls

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Helmet** - Security middleware
- **Express Rate Limit** - Rate limiting middleware
- **CORS** - Cross-origin resource sharing

### ML Service
- **FastAPI** - Modern Python web framework
- **scikit-learn** - Machine learning library
- **Pandas** - Data manipulation library
- **Pydantic** - Data validation using Python type hints
- **Uvicorn** - ASGI server for FastAPI

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Vercel** - Frontend deployment
- **Render** - Backend and ML service deployment
- **MongoDB Atlas** - Cloud database

## 📁 Project Structure

```
EcoMeter/
├── 📄 FuelConsumptionCo2.csv     # Original dataset
├── 📄 README.md                   # This file
├── 📄 docker-compose.yml          # Docker orchestration
│
├── 📁 backend/                     # Express.js API server
│   ├── 📄 index.js                # Main server file
│   ├── 📄 package.json            # Node.js dependencies
│   ├── 📄 Dockerfile              # Docker configuration
│   ├── 📄 .env.example            # Environment template
│   ├── 📁 routes/
│   │   └── 📄 predictionRoutes.js # API routes
│   └── 📁 models/
│       └── 📄 Prediction.js       # MongoDB schema
│
├── 📁 frontend/                    # React frontend
│   ├── 📄 package.json            # React dependencies
│   ├── 📄 vite.config.js          # Vite configuration
│   ├── 📄 tailwind.config.js      # Tailwind configuration
│   ├── 📄 Dockerfile              # Docker configuration
│   ├── 📄 nginx.conf              # Nginx configuration
│   ├── 📄 .env.example            # Environment template
│   ├── 📄 index.html              # HTML entry point
│   └── 📁 src/
│       ├── 📄 App.jsx              # Main React component
│       ├── 📄 main.jsx             # React entry point
│       ├── 📄 index.css            # Global styles
│       ├── 📁 components/
│       │   ├── 📄 PredictionForm.jsx  # Prediction input form
│       │   └── 📄 HistoryList.jsx     # History display
│       └── 📁 services/
│           └── 📄 api.js           # API service layer
│
├── 📁 ml-service/                  # FastAPI ML service
│   ├── 📄 app.py                  # FastAPI application
│   ├── 📄 requirements.txt        # Python dependencies
│   └── 📄 Dockerfile              # Docker configuration
│
├── 📁 training/                    # ML model training
│   └── 📄 train.py                # Training script
│
└── 📁 model_artifacts/             # Trained model storage
    └── 📄 fuel_co2_pipeline_v1.pkl # Trained model
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **MongoDB** (local or Atlas) - *Optional: will connect to local MongoDB automatically*

### ⚡ **ONE-COMMAND STARTUP**

Choose your preferred method:

#### **Method 1: Windows Batch File (Recommended)**
```cmd
# Double-click start.bat OR run in command prompt:
start.bat
```

#### **Method 2: PowerShell Script**
```powershell
# Right-click start.ps1 -> "Run with PowerShell" OR:
.\start.ps1
```

#### **Method 3: NPM Script (If you prefer npm)**
```bash
# First-time setup:
npm install -g concurrently
npm install

# Then start:
npm start
```

### 🎯 **What the startup script does:**
1. ✅ **Checks if ML model exists** (trains it if missing)
2. 🤖 **Starts ML Service** on port 8001
3. ⚡ **Starts Backend** on port 10000  
4. 🎨 **Starts Frontend** on port 3000
5. 🌐 **Opens your browser** automatically

### 4. Access the Application
- **Frontend**: http://localhost:3000 *(opens automatically)*
- **Backend API**: http://localhost:10000
- **ML Service**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

### 🛑 **To Stop Services**
Close the opened terminal windows or press `Ctrl+C` in each service window.

---

## 🔧 Manual Setup (Alternative)

If you prefer to start services manually:

### 1. Train the ML Model (First time only)
```bash
cd training
pip install pandas scikit-learn joblib numpy
python train.py
cd ..
```

### 2. Start Services Manually
```bash
# Terminal 1: ML Service
cd ml-service
pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 8001

# Terminal 2: Backend
cd backend
npm install
node index.js

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

### 3. Docker Setup (Alternative)
```bash
docker-compose up --build
```

## 💻 Local Development

### Training the Model
The ML model must be trained before running the services:

```bash
cd training
python train.py
```

This creates `model_artifacts/fuel_co2_pipeline_v1.pkl` with:
- **Features**: Engine Size, Cylinders, Fuel Consumption
- **Target**: CO₂ Emissions
- **Model**: Linear Regression with StandardScaler
- **Performance**: ~87.6% R² score on test data

### Backend Development
```bash
cd backend
npm install
cp .env.example .env

# Edit .env file:
# MONGO_URI=mongodb://localhost:27017/ecometer
# ML_SERVICE_URL=http://localhost:8001

npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
cp .env.example .env

# Edit .env file:
# VITE_BACKEND_URL=http://localhost:10000

npm run dev
```

### ML Service Development
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

## 🐳 Docker Setup

### Complete Stack
```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services
```bash
# ML Service only
docker build -t ecometer-ml ./ml-service
docker run -p 8001:8001 ecometer-ml

# Backend only
docker build -t ecometer-backend ./backend
docker run -p 10000:10000 ecometer-backend

# Frontend only
docker build -t ecometer-frontend ./frontend
docker run -p 3000:3000 ecometer-frontend
```

## 🚀 Deployment

### Frontend (Vercel)
1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**:
   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   ```
3. **Build Settings**:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`

### Backend (Render)
1. **Create Web Service** from your repository
2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecometer
   ML_SERVICE_URL=https://your-ml-service.onrender.com
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. **Build Command**: `cd backend && npm install`
4. **Start Command**: `cd backend && npm start`

### ML Service (Render)
1. **Create Web Service** from your repository
2. **Environment Variables**:
   ```
   PYTHONUNBUFFERED=1
   ```
3. **Build Command**: `cd ml-service && pip install -r requirements.txt`
4. **Start Command**: `cd ml-service && uvicorn app:app --host 0.0.0.0 --port $PORT`

### Database (MongoDB Atlas)
1. **Create Cluster**: Set up a free MongoDB Atlas cluster
2. **Network Access**: Allow access from anywhere (0.0.0.0/0)
3. **Database User**: Create user with read/write permissions
4. **Connection String**: Use in your backend environment variables

## 📖 API Documentation

### Prediction Endpoints

#### POST `/api/predict`
Predict CO₂ emissions for a car.

**Request Body:**
```json
{
  "engineSize": 3.5,
  "cylinders": 6,
  "fuelConsumption": 10.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64f8c9b123456789abcdef01",
    "prediction": 244.73,
    "input": {
      "engineSize": 3.5,
      "cylinders": 6,
      "fuelConsumption": 10.0
    },
    "formattedPrediction": "244.73 g CO₂/km",
    "timestamp": "2024-09-18T10:30:00.000Z"
  }
}
```

#### GET `/api/history`
Get prediction history with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "limit": 20
    }
  }
}
```

#### GET `/api/history/stats`
Get prediction statistics and analytics.

#### DELETE `/api/history/:id`
Delete a specific prediction.

### Health Check Endpoints

#### GET `/health`
Backend service health check.

#### GET `/health` (ML Service)
ML service health check.

### ML Service Endpoints

#### POST `/predict`
Direct ML prediction endpoint.

#### GET `/model-info`
Get information about the loaded model.

## 🤖 Machine Learning Model

### Dataset
- **Source**: FuelConsumptionCo2.csv (1,067 records)
- **Features**: Engine Size, Cylinders, Fuel Consumption (Combined)
- **Target**: CO₂ Emissions (g/km)

### Model Details
- **Algorithm**: Linear Regression
- **Preprocessing**: StandardScaler for feature normalization
- **Performance**: 87.6% R² score on test set
- **Pipeline**: Saved as sklearn Pipeline for easy deployment

### Training Process
```bash
cd training
python train.py
```

**Model Output:**
- Training R²: 0.8606
- Test R²: 0.8760
- RMSE: 22.65 g CO₂/km
- MAE: 16.72 g CO₂/km

### Feature Importance
- **Fuel Consumption**: Highest impact on CO₂ emissions
- **Engine Size**: Moderate impact
- **Cylinders**: Lower but significant impact

## 🔧 Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=10000
MONGO_URI=mongodb://localhost:27017/ecometer
ML_SERVICE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
VITE_BACKEND_URL=http://localhost:10000
```

### Production Environment Variables

#### Vercel (Frontend)
```bash
VITE_BACKEND_URL=https://your-backend.onrender.com
```

#### Render (Backend)
```bash
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecometer
ML_SERVICE_URL=https://your-ml-service.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Render (ML Service)
```bash
PYTHONUNBUFFERED=1
```

## 🧪 Testing

### Test the ML Model
```bash
cd training
python train.py
```

### Test the ML Service
```bash
curl -X POST "http://localhost:8001/predict" \
  -H "Content-Type: application/json" \
  -d '{"ENGINESIZE": 3.5, "CYLINDERS": 6, "FUELCONSUMPTION_COMB": 10.0}'
```

### Test the Backend API
```bash
curl -X POST "http://localhost:10000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{"engineSize": 3.5, "cylinders": 6, "fuelConsumption": 10.0}'
```

## 🔍 Troubleshooting

### Common Issues

#### Model Not Found Error
```bash
# Ensure the model is trained
cd training
python train.py
```

#### MongoDB Connection Issues
- Check MongoDB URI in backend `.env`
- Ensure MongoDB is running (local) or accessible (Atlas)
- Verify network access in MongoDB Atlas

#### CORS Errors
- Check `FRONTEND_URL` in backend environment
- Verify frontend URL in CORS configuration

#### Port Conflicts
- Check if ports 3000, 8001, 10000 are available
- Modify ports in docker-compose.yml if needed

### Debug Commands
```bash
# Check service health
curl http://localhost:10000/health
curl http://localhost:8001/health

# View Docker logs
docker-compose logs backend
docker-compose logs ml-service
docker-compose logs frontend

# Check MongoDB connection
docker exec -it ecometer-mongodb mongo
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new features
- Update documentation for API changes
- Ensure Docker setup works with changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Dataset**: Government of Canada Fuel Consumption Ratings
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **ML Library**: scikit-learn
- **Deployment**: Vercel and Render

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@ecometer.app

---

**Built with ❤️ for MERN developers exploring Machine Learning**