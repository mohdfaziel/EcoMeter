#!/usr/bin/env python3
"""
Simple startup script for ML Service
"""
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting EcoMeter ML Service on port 8003")
    
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8003,
        reload=True,
        log_level="info"
    )