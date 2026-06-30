"""
Pydantic v2 schemas — request body and full response shape.
"""

from pydantic import BaseModel, field_validator
from typing import Optional


# ── Request ───────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    smiles: str

    @field_validator("smiles")
    @classmethod
    def smiles_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("SMILES string cannot be empty.")
        if len(v) > 2000:
            raise ValueError("SMILES string too long (max 2000 chars).")
        return v


# ── Per-property result ───────────────────────────────────────────────────────

class PropertyResult(BaseModel):
    name:       str           # "Absorption", "Distribution", etc.
    property:   str           # "ESOL Solubility", "Blood-Brain Barrier", etc.
    score:      float         # 0–1 normalised
    raw:        float         # raw model output
    unit:       str
    verdict:    str           # "pass" | "warning" | "fail"
    confidence: str           # "High" | "Moderate" | "Low"
    label:      str           # Human-readable one-liner


# ── Lipinski sub-schema ───────────────────────────────────────────────────────

class RuleCheck(BaseModel):
    value:     float
    pass_:     bool           # aliased from "pass" (reserved keyword)
    threshold: float
    unit:      str

    class Config:
        populate_by_name = True


class LipinskiResult(BaseModel):
    pass_:      bool
    violations: int
    summary:    str

    class Config:
        populate_by_name = True


class DrugLikenessResult(BaseModel):
    molecular_weight:  float
    logP:              float
    hbd:               int
    hba:               int
    tpsa:              float
    rotatable_bonds:   int
    ring_count:        int
    mol_formula:       str
    qed:               Optional[float]
    lipinski:          dict          # full rule breakdown
    tpsa_verdict:      str
    tpsa_label:        str
    rot_verdict:       str
    rot_label:         str
    qed_verdict:       str
    qed_label:         str


# ── Overall result ────────────────────────────────────────────────────────────

class PredictResponse(BaseModel):
    smiles:       str
    valid_smiles: bool

    # ADMET scores
    admet: dict[str, PropertyResult]

    # Drug-likeness
    drug_likeness: DrugLikenessResult

    # Summary
    overall_verdict: str        # "pass" | "warning" | "fail"
    overall_label:   str        # "Promising candidate" etc.
    pass_count:      int        # how many of 4 ADMET heads passed
    total_heads:     int        # always 4
