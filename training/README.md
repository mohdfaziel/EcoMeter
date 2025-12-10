# Model Evaluation Guide

## Overview
The `evaluate.py` script provides comprehensive evaluation of the trained CO₂ emissions prediction model with all required metrics and visualizations.

## Features

### ✅ Computed Metrics
- **R² Score** - Coefficient of determination
- **MAE** - Mean Absolute Error
- **MSE** - Mean Squared Error  
- **RMSE** - Root Mean Squared Error
- **Regression Coefficients (β)** - Feature weights with intercept
- **Inference Time** - Average prediction time (measured over 1000 iterations)
- **Training Time** - Optional (set `MEASURE_TRAINING_TIME=True`)

### 📊 Generated Visualizations
1. **Scatter Plot** - Actual vs Predicted values with perfect prediction line
2. **Residual Plot** - Residuals vs Predicted values with statistics

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Verify File Structure
Ensure these files exist:
```
EcoMeter/
├── FuelConsumptionCo2.csv          # Dataset
├── model_artifacts/
│   └── fuel_co2_pipeline_v1.pkl    # Trained pipeline
└── training/
    ├── evaluate.py                  # This script
    ├── train.py                     # Training script
    └── requirements.txt             # Dependencies
```

## Usage

### Run Evaluation
```bash
cd training
python evaluate.py
```

### Output Structure

#### Console Output
```
============================================================
CO₂ EMISSIONS PREDICTION MODEL EVALUATION
============================================================

[1/6] Loading dataset...
✓ Dataset loaded: 1067 samples
✓ Test set prepared: 214 samples

[2/6] Loading trained pipeline...
✓ Pipeline loaded: Pipeline
✓ Model: LinearRegression
✓ Scaler: StandardScaler

[3/6] Generating predictions...
✓ Predictions generated: 214 samples

[4/6] Computing evaluation metrics...

[5/6] Measuring inference time...

============================================================
EVALUATION RESULTS
============================================================

R² Score: 0.XXXXXX
MAE (Mean Absolute Error): XX.XXXX
MSE (Mean Squared Error): XX.XXXX
RMSE (Root Mean Squared Error): XX.XXXX

Regression Coefficients (β):
  Intercept (β₀): XX.XXXXXX
  ENGINESIZE                     (β1): XX.XXXXXX
  CYLINDERS                      (β2): XX.XXXXXX
  FUELCONSUMPTION_COMB          (β3): XX.XXXXXX

Training Time: Not measured (set MEASURE_TRAINING_TIME=True to measure)
Inference Time (avg per prediction): X.XXXXXX ms

[6/6] Generating visualizations...
✓ Plots saved to: evaluation_results/evaluation_plots.png

============================================================
ADDITIONAL STATISTICS
============================================================
...
```

#### Generated Files
- `evaluation_results/evaluation_plots.png` - High-quality plots (300 DPI)

## Configuration

### Measure Training Time
To measure actual training time, edit `evaluate.py`:
```python
MEASURE_TRAINING_TIME = True  # Line ~115
```

### Adjust Paths
If your project structure differs, update these paths in `evaluate.py`:
```python
PIPELINE_PATH = os.path.join('..', 'model_artifacts', 'fuel_co2_pipeline_v1.pkl')
DATASET_PATH = os.path.join('..', 'FuelConsumptionCo2.csv')
```

## Technical Details

### Model Architecture
- **Type**: Linear Regression
- **Features**: 3 inputs
  - ENGINESIZE (Engine size in liters)
  - CYLINDERS (Number of cylinders)
  - FUELCONSUMPTION_COMB (Combined fuel consumption L/100km)
- **Target**: CO2EMISSIONS (g/km)
- **Pipeline**: StandardScaler → LinearRegression

### Data Split
- Uses same split as training: 80/20 train/test with `random_state=42`
- Ensures consistent evaluation on exact same test set

### Timing Methodology
- **Inference Time**: Average of 1000 predictions using `time.perf_counter()`
- **Training Time**: Optional re-training with timing wrapper

## Troubleshooting

### Import Error: matplotlib
```bash
pip install matplotlib
```

### FileNotFoundError: model or dataset
- Verify you're running from the `training/` directory
- Check that `../model_artifacts/fuel_co2_pipeline_v1.pkl` exists
- Check that `../FuelConsumptionCo2.csv` exists

### Different Test Results than Training
This is normal! The script recreates the exact same test split used during training (same random_state), so results should match the test metrics from `train.py`.

## Example Output

### Metrics Example
```
R² Score: 0.873405
MAE: 15.2341
MSE: 482.7621
RMSE: 21.9719
```

### Coefficients Example
```
Regression Coefficients (β):
  Intercept (β₀): 47.382916
  ENGINESIZE         (β1):  8.452341
  CYLINDERS          (β2):  3.872156
  FUELCONSUMPTION_COMB (β3): 11.234587
```

## Next Steps
- Compare metrics with baseline models
- Analyze residual patterns for model improvement
- Test on additional validation datasets
- Export metrics for model versioning/tracking
