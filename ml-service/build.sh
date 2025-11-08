#!/bin/bash

echo "🤖 Building ML Service..."

# Ensure we're in the ml-service directory
cd ml-service || exit 1

# Upgrade pip first
python -m pip install --upgrade pip

# Install wheel for faster builds
pip install wheel

# Install Python dependencies with specific index to avoid compilation
pip install --only-binary=all --find-links https://download.pytorch.org/whl/cpu -r requirements.txt || \
pip install --prefer-binary -r requirements.txt || \
pip install -r requirements.txt

echo "✅ ML Service build complete!"