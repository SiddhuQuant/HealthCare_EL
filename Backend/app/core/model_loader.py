"""
Loads and caches the model + scalers at startup.
All other modules import from here — no repeated disk I/O.
"""

import os
import json
import joblib
import torch
from pathlib import Path

from app.models.admet_net import ADMETNet

# ── Paths ────────────────────────────────────────────────────────────────────
ARTIFACTS_DIR = Path(__file__).parent.parent.parent / "artifacts"

# ── Global singletons (populated by load_all_artifacts) ──────────────────────
MODEL: ADMETNet = None
SCALERS: dict   = {}
CONFIG: dict    = {}
DEVICE          = torch.device("cpu")   # CPU is fine for inference


def load_all_artifacts():
    """
    Call once at FastAPI startup.
    Loads:
        admet_model.pt          → PyTorch weights
        scaler_esol.pkl         → StandardScaler for ESOL head
        scaler_lipo.pkl         → StandardScaler for Lipophilicity head
        scaler_bbbp.pkl         → StandardScaler for BBBP head
        scaler_tox21.pkl        → StandardScaler for Tox21 head
        model_config.json       → thresholds & normalisation params
    """
    global MODEL, SCALERS, CONFIG

    # ── 1. Config ─────────────────────────────────────────────────────────────
    config_path = ARTIFACTS_DIR / "model_config.json"
    if config_path.exists():
        with open(config_path) as f:
            CONFIG = json.load(f)
    else:
        # Sensible defaults derived from dataset statistics
        CONFIG = {
            "normalisation": {
                "ESOL": {"min": -11.0, "range": 13.0},
                "Lipophilicity": {"min": -1.5, "range": 6.0}
            },
            "thresholds": {
                "ESOL":          {"pass_above": 0.3},
                "BBBP":          {"pass_above": 0.5},
                "Lipophilicity": {"pass_above": 0.3},
                "Tox21":         {"pass_below": 0.5}
            }
        }

    # ── 2. Model weights ──────────────────────────────────────────────────────
    model_path = ARTIFACTS_DIR / "admet_model.pt"
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model weights not found at {model_path}.\n"
            "Place admet_model.pt inside the /artifacts folder."
        )
    MODEL = ADMETNet(input_dim=2048, dropout=0.3).to(DEVICE)
    MODEL.load_state_dict(torch.load(str(model_path), map_location=DEVICE))
    MODEL.eval()

    # ── 3. Scalers ────────────────────────────────────────────────────────────
    scaler_names = ["esol", "lipo", "bbbp", "tox21"]
    for name in scaler_names:
        pkl_path = ARTIFACTS_DIR / f"scaler_{name}.pkl"
        if pkl_path.exists():
            SCALERS[name] = joblib.load(str(pkl_path))
        else:
            # If scaler missing, warn but continue (will use raw fingerprint)
            print(f"⚠️  Scaler not found: {pkl_path.name}. Using unscaled features for {name}.")
            SCALERS[name] = None

    print(f"✅ Model loaded from {model_path.name}")
    print(f"✅ Scalers loaded: {[k for k, v in SCALERS.items() if v is not None]}")
