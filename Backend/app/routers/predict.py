"""
/api/predict — main prediction endpoint
/api/validate — quick SMILES validation
/api/examples  — return example molecules for UI demo
"""

from fastapi import APIRouter, HTTPException
from rdkit import Chem

from app.models.schemas import PredictRequest, PredictResponse
from app.core.predictor import predict_admet, smiles_to_fingerprint
from app.core.lipinski import compute_lipinski

router = APIRouter()


# ── Helper: overall verdict from per-head results ────────────────────────────

def _overall_verdict(admet_results: dict) -> tuple[str, str, int]:
    verdicts = [v["verdict"] for v in admet_results.values()]
    passes   = verdicts.count("pass")
    warnings = verdicts.count("warning")
    fails    = verdicts.count("fail")

    if fails >= 2:
        return "fail",    f"Poor candidate — {fails} critical failures", passes
    elif fails == 1 or warnings >= 2:
        return "warning", f"Review needed — {fails} fail, {warnings} warning(s)", passes
    elif passes == len(verdicts):
        return "pass",    "Promising drug candidate — all ADMET checks passed", passes
    else:
        return "pass",    f"Acceptable candidate — {passes}/{len(verdicts)} checks passed", passes


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/predict
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    """
    Full ADMET + drug-likeness prediction for a SMILES string.

    Returns:
    - ADMET scores (Absorption, Distribution, Excretion, Toxicity)
    - Lipinski Rule of Five + extended descriptors
    - Pass / Warning / Fail verdict per property + overall
    """
    smiles = request.smiles.strip()

    # ── Validate SMILES ───────────────────────────────────────────────────────
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise HTTPException(
            status_code=422,
            detail={
                "error":   "invalid_smiles",
                "message": f"'{smiles}' is not a valid SMILES string. "
                           "Try: CC(=O)Oc1ccccc1C(=O)O (Aspirin)"
            }
        )

    # ── ADMET prediction ──────────────────────────────────────────────────────
    try:
        admet_results = predict_admet(smiles)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "prediction_failed", "message": str(e)})

    # ── Drug-likeness ─────────────────────────────────────────────────────────
    try:
        drug_likeness = compute_lipinski(smiles)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "lipinski_failed", "message": str(e)})

    # ── Overall summary ───────────────────────────────────────────────────────
    overall_verdict, overall_label, pass_count = _overall_verdict(admet_results)

    return PredictResponse(
        smiles=smiles,
        valid_smiles=True,
        admet=admet_results,
        drug_likeness=drug_likeness,
        overall_verdict=overall_verdict,
        overall_label=overall_label,
        pass_count=pass_count,
        total_heads=len(admet_results),
    )


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/validate  — lightweight SMILES check (no inference)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/validate")
async def validate_smiles(request: PredictRequest):
    """Quick endpoint for React to validate SMILES as user types (debounced)."""
    smiles = request.smiles.strip()
    mol    = Chem.MolFromSmiles(smiles)
    valid  = mol is not None

    if valid:
        from rdkit.Chem import rdMolDescriptors
        formula = rdMolDescriptors.CalcMolFormula(mol)
        atoms   = mol.GetNumAtoms()
        return {"valid": True, "formula": formula, "num_atoms": atoms}

    return {"valid": False, "formula": None, "num_atoms": 0}


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/examples  — demo molecules for the UI
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/examples")
async def get_examples():
    """Return a set of example molecules for the React UI demo panel."""
    return {
        "examples": [
            {
                "name":        "Aspirin",
                "smiles":      "CC(=O)Oc1ccccc1C(=O)O",
                "description": "Common analgesic / anti-inflammatory",
                "category":    "approved_drug"
            },
            {
                "name":        "Caffeine",
                "smiles":      "Cn1cnc2c1c(=O)n(c(=O)n2C)C",
                "description": "CNS stimulant",
                "category":    "approved_drug"
            },
            {
                "name":        "Ibuprofen",
                "smiles":      "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
                "description": "NSAID pain reliever",
                "category":    "approved_drug"
            },
            {
                "name":        "Penicillin G",
                "smiles":      "CC1(C)SC2C(NC1=O)C(=O)N2Cc1ccccc1",
                "description": "Beta-lactam antibiotic",
                "category":    "approved_drug"
            },
            {
                "name":        "Atorvastatin",
                "smiles":      "CC(C)c1c(C(=O)Nc2ccccc2F)c(-c2ccccc2)c(-c2ccc(F)cc2)n1CCC(O)CC(O)CC(=O)O",
                "description": "Cholesterol-lowering statin",
                "category":    "approved_drug"
            },
            {
                "name":        "Ethanol",
                "smiles":      "CCO",
                "description": "Simple alcohol — expect poor drug-likeness",
                "category":    "control"
            },
        ]
    }
