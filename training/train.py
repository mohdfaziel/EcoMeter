"""
Car CO2 Emissions Prediction Model Training Script

This script trains a Linear Regression model to predict CO2 emissions based on:
- Engine Size (ENGINESIZE)
- Number of Cylinders (CYLINDERS) 
- Combined Fuel Consumption (FUELCONSUMPTION_COMB)

The trained model is saved as a sklearn Pipeline for easy deployment.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import os

def load_data(csv_path):
    """Load and preprocess the fuel consumption dataset"""
    print("Loading dataset...")
    df = pd.read_csv(csv_path)
    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    
    # Display basic statistics
    print("\nDataset Info:")
    print(df.info())
    print("\nFirst few rows:")
    print(df.head())
    
    return df

def prepare_features(df):
    """Prepare features and target variables"""
    print("\nPreparing features...")
    
    # Select features as specified in requirements
    feature_columns = ['ENGINESIZE', 'CYLINDERS', 'FUELCONSUMPTION_COMB']
    target_column = 'CO2EMISSIONS'
    
    # Check for missing values
    print("Missing values per column:")
    print(df[feature_columns + [target_column]].isnull().sum())
    
    # Remove rows with missing values in our target features
    df_clean = df[feature_columns + [target_column]].dropna()
    print(f"Rows after removing missing values: {len(df_clean)}")
    
    # Separate features and target
    X = df_clean[feature_columns]
    y = df_clean[target_column]
    
    print(f"\nFeature statistics:")
    print(X.describe())
    print(f"\nTarget statistics:")
    print(y.describe())
    
    return X, y

def train_model(X, y):
    """Train the Linear Regression model with preprocessing pipeline"""
    print("\nTraining model...")
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    # Create preprocessing and model pipeline
    pipeline = Pipeline([
        ('scaler', StandardScaler()),  # Standardize features
        ('regressor', LinearRegression())  # Linear regression model
    ])
    
    # Train the model
    pipeline.fit(X_train, y_train)
    
    # Make predictions
    y_train_pred = pipeline.predict(X_train)
    y_test_pred = pipeline.predict(X_test)
    
    # Evaluate the model
    print("\n" + "="*50)
    print("MODEL EVALUATION")
    print("="*50)
    
    # Training metrics
    train_mse = mean_squared_error(y_train, y_train_pred)
    train_rmse = np.sqrt(train_mse)
    train_mae = mean_absolute_error(y_train, y_train_pred)
    train_r2 = r2_score(y_train, y_train_pred)
    
    print(f"\nTraining Metrics:")
    print(f"MSE:  {train_mse:.2f}")
    print(f"RMSE: {train_rmse:.2f}")
    print(f"MAE:  {train_mae:.2f}")
    print(f"R²:   {train_r2:.4f}")
    
    # Test metrics
    test_mse = mean_squared_error(y_test, y_test_pred)
    test_rmse = np.sqrt(test_mse)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    
    print(f"\nTest Metrics:")
    print(f"MSE:  {test_mse:.2f}")
    print(f"RMSE: {test_rmse:.2f}")
    print(f"MAE:  {test_mae:.2f}")
    print(f"R²:   {test_r2:.4f}")
    
    # Feature coefficients
    print(f"\nModel Coefficients:")
    feature_names = X.columns
    coefficients = pipeline.named_steps['regressor'].coef_
    intercept = pipeline.named_steps['regressor'].intercept_
    
    for name, coef in zip(feature_names, coefficients):
        print(f"{name}: {coef:.4f}")
    print(f"Intercept: {intercept:.4f}")
    
    # Example predictions
    print(f"\nExample Predictions (first 5 test samples):")
    for i in range(min(5, len(X_test))):
        actual = y_test.iloc[i]
        predicted = y_test_pred[i]
        features = X_test.iloc[i]
        print(f"Sample {i+1}:")
        print(f"  Features: Engine={features['ENGINESIZE']}, Cylinders={features['CYLINDERS']}, FuelCons={features['FUELCONSUMPTION_COMB']}")
        print(f"  Actual: {actual:.1f}, Predicted: {predicted:.1f}, Difference: {abs(actual-predicted):.1f}")
    
    return pipeline

def save_model(pipeline, output_path):
    """Save the trained pipeline"""
    print(f"\nSaving model to {output_path}...")
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Save the pipeline
    joblib.dump(pipeline, output_path)
    
    # Verify the saved model
    loaded_pipeline = joblib.load(output_path)
    print("Model saved and verified successfully!")
    
    return output_path

def main():
    """Main training pipeline"""
    print("="*60)
    print("CAR CO2 EMISSIONS PREDICTION MODEL TRAINING")
    print("="*60)
    
    # Paths
    csv_path = os.path.join('..', 'FuelConsumptionCo2.csv')
    model_output_path = os.path.join('..', 'model_artifacts', 'fuel_co2_pipeline_v1.pkl')
    
    try:
        # Load data
        df = load_data(csv_path)
        
        # Prepare features
        X, y = prepare_features(df)
        
        # Train model
        pipeline = train_model(X, y)
        
        # Save model
        model_path = save_model(pipeline, model_output_path)
        
        print("\n" + "="*60)
        print("TRAINING COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"Model saved to: {model_path}")
        print(f"Model is ready for deployment in the ML service.")
        
        # Test the saved model with a sample prediction
        print(f"\nTesting saved model with sample input...")
        loaded_model = joblib.load(model_path)
        
        # Sample input: Engine=3.5, Cylinders=6, FuelConsumption=10.0
        sample_input = [[3.5, 6, 10.0]]
        sample_prediction = loaded_model.predict(sample_input)
        print(f"Sample prediction for [Engine=3.5, Cylinders=6, FuelCons=10.0]: {sample_prediction[0]:.1f} g CO2/km")
        
    except Exception as e:
        print(f"Error during training: {str(e)}")
        raise

if __name__ == "__main__":
    main()