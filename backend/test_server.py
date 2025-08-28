#!/usr/bin/env python3

import sys
import traceback

try:
    print("Testing imports...")
    from app.main import app
    print("✓ App imported successfully")
    
    import uvicorn
    print("✓ Uvicorn imported successfully")
    
    print("Starting server on http://localhost:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("Full traceback:")
    traceback.print_exc()
    sys.exit(1)
