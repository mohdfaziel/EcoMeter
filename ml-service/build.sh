# Render Build Script for ML Service
#!/bin/bash

echo "🤖 Building ML Service..."

# Install system dependencies if needed
apt-get update && apt-get install -y curl

# Install Python dependencies
pip install --no-cache-dir -r requirements.txt

# Copy model artifacts if they exist
if [ -d "../model_artifacts" ]; then
    echo "📁 Copying model artifacts..."
    cp -r ../model_artifacts ./
elif [ -f "../model_artifacts/fuel_co2_pipeline_v1.pkl" ]; then
    echo "📦 Copying model file..."
    mkdir -p model_artifacts
    cp ../model_artifacts/fuel_co2_pipeline_v1.pkl ./model_artifacts/
else
    echo "⚠️ Model artifacts not found, will use fallback model"
fi

echo "✅ ML Service build complete!"