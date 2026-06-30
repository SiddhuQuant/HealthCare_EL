"""
Health check endpoints.
"""

from fastapi import APIRouter
import app.core.model_loader as loader

router = APIRouter()


@router.get("/health")
async def health():

    return {

        "status": "ok",

        "model_loaded": loader.MODEL is not None,

        "scalers_loaded": [
            k for k, v in loader.SCALERS.items()
            if v is not None
        ],
    }