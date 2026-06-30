"""
Core prediction logic:
  SMILES → Morgan fingerprint → scaled → model → ADMET scores + confidence
"""

import numpy as np
import torch
from rdkit import Chem
from rdkit.Chem import AllChem

import app.core.model_loader as loader


# ─────────────────────────────────────────────────────────────────────────────
# 1. Featurisation
# ─────────────────────────────────────────────────────────────────────────────

def smiles_to_fingerprint(smiles: str) -> np.ndarray:
    """
    Convert SMILES → 2048-bit Morgan fingerprint (radius=2).
    Raises ValueError for invalid SMILES.
    """
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"Invalid SMILES string: '{smiles}'")
    fp = AllChem.GetMorganFingerprintAsBitVect(mol, radius=2, nBits=2048)
    return np.array(fp, dtype=np.float32)


def scale_fingerprint(fp: np.ndarray, scaler_key: str) -> np.ndarray:
    """Apply the named scaler (if loaded) to the fingerprint."""
    scaler = loader.SCALERS.get(scaler_key)
    if scaler is not None:
        return scaler.transform(fp.reshape(1, -1)).astype(np.float32)
    return fp.reshape(1, -1)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Confidence interpretation
# ─────────────────────────────────────────────────────────────────────────────

def _classify_score(score: float, prop: str) -> dict:
    """
    Convert a raw 0-1 score into verdict + confidence label.

    Returns:
        verdict:    "pass" | "warning" | "fail"
        confidence: "High" | "Moderate" | "Low"
        label:      Human-readable one-liner
    """
    thresholds = {
        # (pass_above_hi, pass_above_lo, fail_below) for regression-like 0-1 scores
        # For classification: pass=prob>0.6, warning=0.4-0.6, fail<0.4 (inverted for toxicity)
        "ESOL":          {"high_pass": 0.55, "low_pass": 0.35, "mode": "higher_better"},
        "BBBP":          {"high_pass": 0.65, "low_pass": 0.45, "mode": "higher_better"},
        "Lipophilicity": {"high_pass": 0.55, "low_pass": 0.35, "mode": "higher_better"},
        "Tox21":         {"high_pass": 0.35, "low_pass": 0.55, "mode": "lower_better"},
        # Metabolism and Excretion from Lipinski
        "LogP":          {"high_pass": 0.7,  "low_pass": 0.4,  "mode": "higher_better"},
        "MW":            {"high_pass": 0.7,  "low_pass": 0.4,  "mode": "higher_better"},
    }

    labels_pass = {
        "ESOL":          "Good aqueous solubility",
        "BBBP":          "Strong BBB penetration",
        "Lipophilicity": "Favourable lipophilicity",
        "Tox21":         "Low toxicity risk",
    }
    labels_warn = {
        "ESOL":          "Moderate solubility — monitor",
        "BBBP":          "Uncertain BBB penetration",
        "Lipophilicity": "Borderline lipophilicity",
        "Tox21":         "Moderate toxicity concern",
    }
    labels_fail = {
        "ESOL":          "Poor aqueous solubility",
        "BBBP":          "Low BBB penetration",
        "Lipophilicity": "Unfavourable lipophilicity",
        "Tox21":         "High toxicity risk",
    }

    cfg  = thresholds.get(prop, {"high_pass": 0.6, "low_pass": 0.4, "mode": "higher_better"})
    mode = cfg["mode"]

    if mode == "higher_better":
        if score >= cfg["high_pass"]:
            verdict, conf = "pass", "High"
            label = labels_pass.get(prop, "Favourable")
        elif score >= cfg["low_pass"]:
            verdict, conf = "warning", "Moderate"
            label = labels_warn.get(prop, "Borderline")
        else:
            verdict, conf = "fail", "High"
            label = labels_fail.get(prop, "Unfavourable")
    else:  # lower_better (toxicity)
        if score <= cfg["high_pass"]:
            verdict, conf = "pass", "High"
            label = labels_pass.get(prop, "Favourable")
        elif score <= cfg["low_pass"]:
            verdict, conf = "warning", "Moderate"
            label = labels_warn.get(prop, "Borderline")
        else:
            verdict, conf = "fail", "High"
            label = labels_fail.get(prop, "Unfavourable")

    # Moderate confidence near decision boundary
    boundary_gap = abs(score - (cfg["high_pass"] + cfg["low_pass"]) / 2)
    if boundary_gap < 0.08:
        conf = "Low"

    return {"verdict": verdict, "confidence": conf, "label": label}


# ─────────────────────────────────────────────────────────────────────────────
# 3. Normalise raw regression outputs to 0-1
# ─────────────────────────────────────────────────────────────────────────────

def _normalise(raw: float, prop: str) -> float:
    norm = loader.CONFIG.get("normalisation", {}).get(prop)
    if norm:
        return float(np.clip((raw - norm["min"]) / norm["range"], 0.0, 1.0))
    # Fallback sigmoid squish
    return float(1 / (1 + np.exp(-raw)))


# ─────────────────────────────────────────────────────────────────────────────
# 4. Main predict function
# ─────────────────────────────────────────────────────────────────────────────

def predict_admet(smiles: str) -> dict:
    """
    Full pipeline: SMILES → fingerprint → model → scored ADMET dict.

    Returns:
        {
          "ESOL":          { score, raw, verdict, confidence, label, unit },
          "BBBP":          { ... },
          "Lipophilicity": { ... },
          "Tox21":         { ... },
        }
    """
    # 1. Fingerprint
    fp = smiles_to_fingerprint(smiles)

    # 2. Scale (use esol scaler as representative — all share the same fp space)
    fp_scaled = scale_fingerprint(fp, "esol")

    # 3. Inference
    loader.MODEL.eval()
    with torch.no_grad():
        x = torch.tensor(fp_scaled).to(loader.DEVICE)
        outputs = loader.MODEL(x)

        raw_esol  = outputs["esol"].item()
        raw_lipo  = outputs["lipo"].item()
        raw_bbbp  = outputs["bbbp"].item()
        raw_tox21 = outputs["tox21"].item()
    # 4. Normalise regression outputs to 0-1
    score_esol = _normalise(raw_esol, "ESOL")
    score_lipo = _normalise(raw_lipo, "Lipophilicity")

    # Classification outputs are already 0-1 via sigmoid
    score_bbbp  = raw_bbbp
    score_tox21 = raw_tox21

    # 5. Build results
    results = {
        "ESOL": {
            "name":       "Absorption",
            "property":   "ESOL Solubility",
            "score":      round(score_esol,  4),
            "raw":        round(raw_esol,    4),
            "unit":       "log mol/L",
            **_classify_score(score_esol, "ESOL"),
        },
        "BBBP": {
            "name":       "Distribution",
            "property":   "Blood-Brain Barrier",
            "score":      round(score_bbbp,  4),
            "raw":        round(raw_bbbp,    4),
            "unit":       "probability",
            **_classify_score(score_bbbp, "BBBP"),
        },
        "Lipophilicity": {
            "name":       "Excretion",
            "property":   "Lipophilicity",
            "score":      round(score_lipo,  4),
            "raw":        round(raw_lipo,    4),
            "unit":       "log D",
            **_classify_score(score_lipo, "Lipophilicity"),
        },
        "Tox21": {
            "name":       "Toxicity",
            "property":   "Tox21 Assay",
            "score":      round(score_tox21, 4),
            "raw":        round(raw_tox21,   4),
            "unit":       "probability",
            **_classify_score(score_tox21, "Tox21"),
        },
    }

    return results
