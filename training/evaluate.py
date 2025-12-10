"""
Model Evaluation Script for CO₂ Emissions Prediction
Computes comprehensive metrics and generates visualizations for trained Linear Regression model
"""

import joblib
import numpy as np
import pandas as pd
import time
import matplotlib.pyplot as plt
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
import os

# ================================
# Configuration
# ================================
PIPELINE_PATH = os.path.join('..', 'model_artifacts', 'fuel_co2_pipeline_v1.pkl')
DATASET_PATH = os.path.join('..', 'FuelConsumptionCo2.csv')

# Feature names (based on actual model training features)
# Model uses: ENGINESIZE, CYLINDERS, FUELCONSUMPTION_COMB
FEATURE_NAMES = [
    'ENGINESIZE',
    'CYLINDERS',
    'FUELCONSUMPTION_COMB'
]

TARGET_COLUMN = 'CO2EMISSIONS'

# ================================
# Load Model and Data
# ================================
print("=" * 60)
print("CO₂ EMISSIONS PREDICTION MODEL EVALUATION")
print("=" * 60)
print("\n[1/6] Loading dataset...")

# Load dataset
df = pd.read_csv(DATASET_PATH)
print(f"✓ Dataset loaded: {df.shape[0]} samples")

# Prepare features (same as training script)
df_clean = df[FEATURE_NAMES + [TARGET_COLUMN]].dropna()
X = df_clean[FEATURE_NAMES]
y = df_clean[TARGET_COLUMN]

# Split data (same way as training - test_size=0.2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"✓ Test set prepared: {len(X_test)} samples")

print("\n[2/6] Loading trained pipeline...")
# Load trained pipeline (contains scaler + regressor)
pipeline = joblib.load(PIPELINE_PATH)
print(f"✓ Pipeline loaded: {type(pipeline).__name__}")

# Extract model and scaler from pipeline
model = pipeline.named_steps['regressor']
scaler = pipeline.named_steps['scaler']
print(f"✓ Model: {type(model).__name__}")
print(f"✓ Scaler: {type(scaler).__name__}")

# ================================
# Make Predictions
# ================================
print("\n[3/6] Generating predictions...")
y_pred = pipeline.predict(X_test)
print(f"✓ Predictions generated: {len(y_pred)} samples")

# ================================
# Calculate Metrics
# ================================
print("\n[4/6] Computing evaluation metrics...")

# R² Score
r2 = r2_score(y_test, y_pred)

# MAE (Mean Absolute Error)
mae = mean_absolute_error(y_test, y_pred)

# MSE (Mean Squared Error)
mse = mean_squared_error(y_test, y_pred)

# RMSE (Root Mean Squared Error)
rmse = np.sqrt(mse)

# Regression Coefficients (β)
coefficients = model.coef_
intercept = model.intercept_

# ================================
# Measure Inference Time
# ================================
print("\n[5/6] Measuring inference time...")

# Perform multiple predictions to get accurate average
num_iterations = 1000
single_sample = X_test.iloc[0:1]  # Take first sample

start_time = time.perf_counter()
for _ in range(num_iterations):
    _ = pipeline.predict(single_sample)
end_time = time.perf_counter()

avg_inference_time = (end_time - start_time) / num_iterations

# ================================
# Training Time Measurement
# ================================
print("\n[Optional] To measure training time, uncomment the training section below.")

# Optional: Measure actual training time
MEASURE_TRAINING_TIME = False  # Set to True to measure training time

if MEASURE_TRAINING_TIME:
    print("\n[Bonus] Measuring training time...")
    from sklearn.linear_model import LinearRegression
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline
    
    temp_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', LinearRegression())
    ])
    
    start_time = time.perf_counter()
    temp_pipeline.fit(X_train, y_train)
    end_time = time.perf_counter()
    
    training_time = end_time - start_time
    training_time_str = f"{training_time:.6f} seconds"
else:
    training_time_str = "Not measured (set MEASURE_TRAINING_TIME=True to measure)"

# ================================
# Print Results
# ================================
print("\n" + "=" * 60)
print("EVALUATION RESULTS")
print("=" * 60)

print(f"\nR² Score: {r2:.6f}")
print(f"MAE (Mean Absolute Error): {mae:.4f}")
print(f"MSE (Mean Squared Error): {mse:.4f}")
print(f"RMSE (Root Mean Squared Error): {rmse:.4f}")

print(f"\nRegression Coefficients (β):")
print(f"  Intercept (β₀): {intercept:.6f}")
for i, (feature, coef) in enumerate(zip(FEATURE_NAMES, coefficients)):
    print(f"  {feature:30s} (β{i+1}): {coef:12.6f}")

print(f"\nTraining Time: {training_time_str}")
print(f"Inference Time (avg per prediction): {avg_inference_time*1000:.6f} ms ({avg_inference_time:.9f} seconds)")

# ================================
# Generate Visualizations
# ================================
print("\n[6/6] Generating visualizations...")

# Create figure with two subplots
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# --------------------------------
# Plot 1: Actual vs Predicted (Scatter Plot)
# --------------------------------
ax1 = axes[0]

# Convert to numpy arrays for plotting
y_test_np = y_test.values if hasattr(y_test, 'values') else y_test
y_pred_np = y_pred

ax1.scatter(y_test_np, y_pred_np, alpha=0.5, edgecolors='k', linewidth=0.5)

# Add perfect prediction line
min_val = min(y_test_np.min(), y_pred_np.min())
max_val = max(y_test_np.max(), y_pred_np.max())
ax1.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Perfect Prediction')

ax1.set_xlabel('Actual CO₂ Emissions', fontsize=12, fontweight='bold')
ax1.set_ylabel('Predicted CO₂ Emissions', fontsize=12, fontweight='bold')
ax1.set_title('Actual vs Predicted CO₂ Emissions', fontsize=14, fontweight='bold', pad=15)
ax1.legend()
ax1.grid(True, alpha=0.3)

# Add R² score to plot
ax1.text(0.05, 0.95, f'R² = {r2:.4f}', transform=ax1.transAxes,
         fontsize=11, verticalalignment='top',
         bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

# --------------------------------
# Plot 2: Residual Plot
# --------------------------------
ax2 = axes[1]
residuals = y_test_np - y_pred_np
ax2.scatter(y_pred_np, residuals, alpha=0.5, edgecolors='k', linewidth=0.5)

# Add zero line
ax2.axhline(y=0, color='r', linestyle='--', lw=2, label='Zero Residual')

ax2.set_xlabel('Predicted CO₂ Emissions', fontsize=12, fontweight='bold')
ax2.set_ylabel('Residuals (Actual - Predicted)', fontsize=12, fontweight='bold')
ax2.set_title('Residual Plot', fontsize=14, fontweight='bold', pad=15)
ax2.legend()
ax2.grid(True, alpha=0.3)

# Add statistics to residual plot
residual_mean = residuals.mean()
residual_std = residuals.std()
ax2.text(0.05, 0.95, f'Mean: {residual_mean:.4f}\nStd: {residual_std:.4f}',
         transform=ax2.transAxes, fontsize=11, verticalalignment='top',
         bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))

plt.tight_layout()

# Save plots
output_dir = 'evaluation_results'
os.makedirs(output_dir, exist_ok=True)
plot_path = os.path.join(output_dir, 'evaluation_plots.png')
plt.savefig(plot_path, dpi=300, bbox_inches='tight')
print(f"✓ Plots saved to: {plot_path}")

plt.show()

# ================================
# Additional Statistics
# ================================
print("\n" + "=" * 60)
print("ADDITIONAL STATISTICS")
print("=" * 60)

print(f"\nPrediction Statistics:")
print(f"  Mean Predicted Value: {y_pred_np.mean():.4f}")
print(f"  Std Predicted Value: {y_pred_np.std():.4f}")
print(f"  Min Predicted Value: {y_pred_np.min():.4f}")
print(f"  Max Predicted Value: {y_pred_np.max():.4f}")

print(f"\nActual Statistics:")
print(f"  Mean Actual Value: {y_test_np.mean():.4f}")
print(f"  Std Actual Value: {y_test_np.std():.4f}")
print(f"  Min Actual Value: {y_test_np.min():.4f}")
print(f"  Max Actual Value: {y_test_np.max():.4f}")

print(f"\nResidual Statistics:")
print(f"  Mean Residual: {residuals.mean():.4f}")
print(f"  Std Residual: {residuals.std():.4f}")
print(f"  Min Residual: {residuals.min():.4f}")
print(f"  Max Residual: {residuals.max():.4f}")

print("\n" + "=" * 60)
print("EVALUATION COMPLETE")
print("=" * 60)
