"""
Run the ADMET FastAPI server.
Usage:
    python run.py
or:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,       # auto-reload on code changes
        log_level="info",
    )
