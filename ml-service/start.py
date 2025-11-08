#!/usr/bin/env python3
"""
Startup script for the ML Service on Render
Handles port configuration automatically
"""
import os
import uvicorn

if __name__ == "__main__":
    # Get port from environment, handle various formats
    port = os.environ.get('PORT', '8001')
    
    # Handle cases where PORT might be set to '$PORT' string
    if port == '$PORT' or not port.isdigit():
        port = '8001'
    
    port = int(port)
    
    print(f"🚀 Starting ML Service on port {port}")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )