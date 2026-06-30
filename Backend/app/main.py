"""
ADMET Property Prediction API
FastAPI backend with RDKit, PyTorch, Lipinski Rules, Confidence Scoring
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.model_loader import load_all_artifacts
from app.routers import predict, health


# ── Lifespan: load model once at startup ──────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Loading ADMET model artifacts...")
    load_all_artifacts()
    print("✅ Model ready.")
    yield
    print("👋 Shutting down.")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ADMET Property Prediction API",
    description="Predict Absorption, Distribution, Metabolism, Excretion, Toxicity from SMILES",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS — allow React dev server ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(predict.router, prefix="/api", tags=["Prediction"])
app.include_router(health.router,  prefix="/api", tags=["Health"])
