# EcoMeter

Machine learning web application that predicts vehicle CO₂ emissions based on engine specifications.

## Features

- Real-time CO₂ emissions prediction
- Prediction history tracking
- Responsive web interface
- RESTful API with MongoDB storage

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS  
**Backend:** Node.js, Express, MongoDB  
**ML Service:** Python, FastAPI, scikit-learn  
**Deployment:** Vercel, Render, MongoDB Atlas

## Quick Start

```bash
# Clone repository
git clone https://github.com/mohdfaziel/EcoMeter.git
cd EcoMeter

# Install dependencies
cd backend && npm install
cd ../frontend && npm install  
cd ../ml-service && pip install -r requirements.txt

# Start services (3 terminals)
cd ml-service && python start.py     # Port 8001
cd backend && npm run dev            # Port 10000
cd frontend && npm run dev           # Port 3000
```

## API Usage

**Predict CO₂ Emissions:**
```bash
POST /api/predict
{
  "engineSize": 3.5,
  "cylinders": 6,
  "fuelConsumption": 10.0
}
```

**Get History:**
```bash
GET /api/history?page=1&limit=20
```

## Machine Learning Model

- **Algorithm:** Linear Regression with StandardScaler
- **Accuracy:** 87.6% R² score
- **Dataset:** Government of Canada Fuel Consumption (1,067 records)
- **Features:** Engine Size, Cylinders, Fuel Consumption

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push branch: `git push origin feature/name`
5. Submit pull request