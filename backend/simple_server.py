#!/usr/bin/env python3

import sys
import traceback

try:
    print("Starting simple FastAPI server...")
    
    # Test imports
    import fastapi
    print("✓ FastAPI imported")
    
    import uvicorn
    print("✓ Uvicorn imported")
    
    # Create simple app
    app = fastapi.FastAPI()
    
    @app.get("/")
    def read_root():
        return {"message": "Finesse Backend is working!", "status": "success"}
    
    @app.get("/health")
    def health_check():
        return {"status": "healthy", "service": "finesse-backend"}
    
    print("✓ FastAPI app created successfully")
    print("Starting server on http://localhost:8000")
    
    # Start server
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
    
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Missing dependencies. Please install:")
    print("pip install fastapi uvicorn")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    traceback.print_exc()
    sys.exit(1)
