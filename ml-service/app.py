"""
FastAPI ML Service for CO2 Emissions Prediction

This service loads the trained sklearn pipeline and provides a REST API
for predicting CO2 emissions based on car specifications.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import logging
import os
from typing import List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Car CO2 Emissions Prediction API",
    description="Predict CO2 emissions based on car engine specifications",
    version="1.0.0"
)

# Configure CORS to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store the loaded model
model_pipeline = None

class PredictionInput(BaseModel):
    """Input schema for prediction requests"""
    ENGINESIZE: float = Field(..., gt=0, le=20, description="Engine size in liters")
    CYLINDERS: int = Field(..., ge=3, le=16, description="Number of cylinders")
    FUELCONSUMPTION_COMB: float = Field(..., gt=0, le=50, description="Combined fuel consumption (L/100km)")

    class Config:
        json_schema_extra = {
            "example": {
                "ENGINESIZE": 3.5,
                "CYLINDERS": 6,
                "FUELCONSUMPTION_COMB": 10.0
            }
        }

class PredictionOutput(BaseModel):
    """Output schema for prediction responses"""
    prediction: float = Field(..., description="Predicted CO2 emissions in g/km")
    input_features: PredictionInput = Field(..., description="Echo of input features")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prediction": 244.7,
                "input_features": {
                    "ENGINESIZE": 3.5,
                    "CYLINDERS": 6,
                    "FUELCONSUMPTION_COMB": 10.0
                }
            }
        }

class BatchPredictionInput(BaseModel):
    """Input schema for batch prediction requests"""
    predictions: List[PredictionInput] = Field(..., max_items=100, description="List of prediction inputs")

class BatchPredictionOutput(BaseModel):
    """Output schema for batch prediction responses"""
    predictions: List[float] = Field(..., description="List of predicted CO2 emissions")
    count: int = Field(..., description="Number of predictions made")

@app.on_event("startup")
async def load_model():
    """Load the trained model on application startup"""
    global model_pipeline
    
    # Try multiple possible model paths
    possible_paths = [
        os.path.join("..", "model_artifacts", "fuel_co2_pipeline_v1.pkl"),
        os.path.join("model_artifacts", "fuel_co2_pipeline_v1.pkl"),
        "fuel_co2_pipeline_v1.pkl",
        os.path.join("/app", "model_artifacts", "fuel_co2_pipeline_v1.pkl")
    ]
    
    model_loaded = False
    for model_path in possible_paths:
        try:
            logger.info(f"Trying to load model from {model_path}")
            if os.path.exists(model_path):
                model_pipeline = joblib.load(model_path)
                logger.info(f"Model loaded successfully from {model_path}!")
                model_loaded = True
                break
        except Exception as e:
            logger.warning(f"Failed to load from {model_path}: {str(e)}")
    
    if not model_loaded:
        logger.error("Could not find model file in any of the expected locations")
        # Create a simple fallback model for demonstration
        from sklearn.linear_model import LinearRegression
        from sklearn.preprocessing import StandardScaler
        from sklearn.pipeline import Pipeline
        
        logger.warning("Creating fallback model...")
        model_pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('regressor', LinearRegression())
        ])
        
        # Fit with sample data (this is just for demo - replace with actual training)
        import numpy as np
        X_sample = np.array([[2.0, 4, 8.0], [3.5, 6, 10.0], [5.0, 8, 15.0]])
        y_sample = np.array([180.0, 244.0, 350.0])
        model_pipeline.fit(X_sample, y_sample)
        logger.warning("Fallback model created and fitted with sample data")
    
    try:
        
        # Test the model with a sample prediction
        test_input = np.array([[3.5, 6, 10.0]])
        test_prediction = model_pipeline.predict(test_input)
        logger.info(f"Model test successful. Sample prediction: {test_prediction[0]:.2f}")
        
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise RuntimeError(f"Could not load model: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Car CO2 Emissions Prediction API",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": model_pipeline is not None,
        "endpoints": {
            "predict": "/predict",
            "batch_predict": "/batch-predict",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model_pipeline is not None,
        "service": "ml-service"
    }

@app.post("/predict", response_model=PredictionOutput)
async def predict_co2(input_data: PredictionInput):
    """
    Predict CO2 emissions for a single car specification
    
    - **ENGINESIZE**: Engine size in liters (0.1 - 20.0)
    - **CYLINDERS**: Number of cylinders (3 - 16)
    - **FUELCONSUMPTION_COMB**: Combined fuel consumption in L/100km (1.0 - 50.0)
    
    Returns the predicted CO2 emissions in grams per kilometer.
    """
    
    if model_pipeline is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Prepare input features as numpy array
        features = np.array([[
            input_data.ENGINESIZE,
            input_data.CYLINDERS,
            input_data.FUELCONSUMPTION_COMB
        ]])
        
        # Make prediction
        prediction = model_pipeline.predict(features)[0]
        
        # Ensure prediction is reasonable (positive value)
        if prediction < 0:
            prediction = 0.0
        
        logger.info(f"Prediction made: {prediction:.2f} for input {input_data.dict()}")
        
        return PredictionOutput(
            prediction=round(prediction, 2),
            input_features=input_data
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/batch-predict", response_model=BatchPredictionOutput)
async def batch_predict_co2(input_data: BatchPredictionInput):
    """
    Predict CO2 emissions for multiple car specifications
    
    Accepts up to 100 prediction inputs at once.
    """
    
    if model_pipeline is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Prepare input features as numpy array
        features = np.array([
            [item.ENGINESIZE, item.CYLINDERS, item.FUELCONSUMPTION_COMB]
            for item in input_data.predictions
        ])
        
        # Make predictions
        predictions = model_pipeline.predict(features)
        
        # Ensure all predictions are reasonable (positive values)
        predictions = np.maximum(predictions, 0.0)
        
        # Round predictions to 2 decimal places
        predictions = [round(pred, 2) for pred in predictions]
        
        logger.info(f"Batch prediction made: {len(predictions)} predictions")
        
        return BatchPredictionOutput(
            predictions=predictions,
            count=len(predictions)
        )
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@app.get("/model-info")
async def get_model_info():
    """Get information about the loaded model"""
    
    if model_pipeline is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Get model information
        scaler = model_pipeline.named_steps['scaler']
        regressor = model_pipeline.named_steps['regressor']
        
        return {
            "model_type": "Linear Regression with StandardScaler",
            "features": ["ENGINESIZE", "CYLINDERS", "FUELCONSUMPTION_COMB"],
            "target": "CO2EMISSIONS",
            "scaler_mean": scaler.mean_.tolist(),
            "scaler_scale": scaler.scale_.tolist(),
            "model_coefficients": regressor.coef_.tolist(),
            "model_intercept": float(regressor.intercept_),
            "feature_names": ["ENGINESIZE", "CYLINDERS", "FUELCONSUMPTION_COMB"]
        }
        
    except Exception as e:
        logger.error(f"Model info error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Could not get model info: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    # Run the FastAPI application
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )