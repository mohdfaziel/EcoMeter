# EcoMeter

AI-powered CO₂ emissions prediction platform with comprehensive vehicle database management and intelligent ML service integration.

## Features

- **ML Prediction Engine** - Real-time CO₂ emissions forecasting with smart server wake-up
- **Car Database** - 1000+ vehicle rankings with AI-powered scoring system  
- **Admin Dashboard** - Complete CRUD operations with authentication and analytics
- **Prediction History** - Track and manage previous calculations
- **Responsive Design** - Mobile-first interface with modern UI/UX

## Architecture

**Frontend:** React 18, Vite, Tailwind CSS, React Router  
**Backend:** Node.js, Express, MongoDB Atlas, JWT Authentication  
**ML Service:** Python, FastAPI, scikit-learn, Uvicorn  
**Infrastructure:** Render (Backend/ML), Vercel (Frontend)

## Quick Start

```bash
# Clone and setup
git clone https://github.com/mohdfaziel/EcoMeter.git
cd EcoMeter

# Install dependencies and start all services
npm run start

# Or start individually:
npm run start:frontend  # http://localhost:3000
npm run start:backend   # http://localhost:10000  
npm run start:ml        # http://localhost:8003
```

## Environment Setup

Create `.env` files in frontend directory:

```bash
# Frontend/.env
VITE_BACKEND_URL=http://localhost:10000
VITE_ML_SERVICE_URL=###################
```

## API Documentation

**Predict Emissions:**
```bash
POST /api/predict
{
  "engineSize": 2.5,
  "cylinders": 4,
  "fuelConsumption": 8.5
}
```

**Car Database:**
```bash
GET /api/cars?sortBy=score&limit=50    # Get ranked cars
POST /api/cars                         # Add new car (Admin)
PUT /api/cars/:model                   # Update car (Admin)
DELETE /api/cars/:model                # Delete car (Admin)
```

**Admin Authentication:**
```bash
POST /api/admin/login                  # Admin login
PUT /api/admin/change-password         # Update credentials
```

## ML Model Performance

- **Algorithm:** Linear Regression with StandardScaler preprocessing
- **Accuracy:** 87.6% R² score on test data
- **Dataset:** Government of Canada Fuel Consumption (1,067 vehicles)
- **Features:** Engine displacement, cylinder count, fuel consumption
- **Deployment:** Auto-scaling FastAPI service on Render

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/enhancement`  
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/enhancement`
5. Create Pull Request