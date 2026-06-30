"""
Lipinski Rule of Five + extended drug-likeness descriptors.
All computed with RDKit — no model inference needed.
"""

from rdkit import Chem
from rdkit.Chem import Descriptors, rdMolDescriptors, QED


def compute_lipinski(smiles: str) -> dict:
    """
    Compute drug-likeness descriptors and Lipinski Rule of Five.

    Lipinski Ro5:
        MW   ≤ 500 Da
        LogP ≤ 5
        HBD  ≤ 5   (hydrogen bond donors)
        HBA  ≤ 10  (hydrogen bond acceptors)

    Extended:
        TPSA           — Topological Polar Surface Area (< 140 Å² for good absorption)
        RotatableBonds — (< 10 for good oral bioavailability)
        QED            — Quantitative Estimate of Drug-likeness (0-1, higher = better)
        MolFormula     — molecular formula string
        RingCount      — number of rings
    """
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return {"error": f"Invalid SMILES: {smiles}"}

    # ── Core descriptors ─────────────────────────────────────────────────────
    mw   = round(Descriptors.ExactMolWt(mol), 2)
    logp = round(Descriptors.MolLogP(mol), 3)
    hbd  = rdMolDescriptors.CalcNumHBD(mol)
    hba  = rdMolDescriptors.CalcNumHBA(mol)
    tpsa = round(Descriptors.TPSA(mol), 2)
    rot  = rdMolDescriptors.CalcNumRotatableBonds(mol)
    rings = rdMolDescriptors.CalcNumRings(mol)
    mol_formula = rdMolDescriptors.CalcMolFormula(mol)

    try:
        qed_score = round(QED.qed(mol), 4)
    except Exception:
        qed_score = None

    # ── Lipinski rule checks ──────────────────────────────────────────────────
    ro5_checks = {
        "MW ≤ 500":   {"value": mw,   "pass": mw   <= 500, "threshold": 500,  "unit": "Da"},
        "LogP ≤ 5":   {"value": logp, "pass": logp <=   5, "threshold":   5,  "unit": ""},
        "HBD ≤ 5":    {"value": hbd,  "pass": hbd  <=   5, "threshold":   5,  "unit": ""},
        "HBA ≤ 10":   {"value": hba,  "pass": hba  <=  10, "threshold":  10,  "unit": ""},
    }

    violations = sum(1 for v in ro5_checks.values() if not v["pass"])
    lipinski_pass = violations <= 1   # Lipinski allows 1 violation

    # ── TPSA interpretation ───────────────────────────────────────────────────
    if tpsa < 60:
        tpsa_label, tpsa_verdict = "High GI absorption", "pass"
    elif tpsa < 140:
        tpsa_label, tpsa_verdict = "Moderate GI absorption", "warning"
    else:
        tpsa_label, tpsa_verdict = "Poor GI absorption", "fail"

    # ── Rotatable bonds ───────────────────────────────────────────────────────
    rot_pass    = rot < 10
    rot_label   = "Flexible — good oral absorption" if rot_pass else "High flexibility — may reduce bioavailability"
    rot_verdict = "pass" if rot_pass else "warning"

    # ── QED drug-likeness ─────────────────────────────────────────────────────
    if qed_score is not None:
        if qed_score >= 0.67:
            qed_label, qed_verdict = "Drug-like (high QED)", "pass"
        elif qed_score >= 0.34:
            qed_label, qed_verdict = "Moderately drug-like", "warning"
        else:
            qed_label, qed_verdict = "Low drug-likeness", "fail"
    else:
        qed_label, qed_verdict = "Could not compute", "warning"

    return {
        # Raw values
        "molecular_weight":     mw,
        "logP":                 logp,
        "hbd":                  hbd,
        "hba":                  hba,
        "tpsa":                 tpsa,
        "rotatable_bonds":      rot,
        "ring_count":           rings,
        "mol_formula":          mol_formula,
        "qed":                  qed_score,

        # Lipinski Ro5
        "lipinski": {
            "pass":       lipinski_pass,
            "violations": violations,
            "rules":      ro5_checks,
            "summary":    "Drug-like (Lipinski Ro5)" if lipinski_pass else f"Violates {violations} Lipinski rule(s)"
        },

        # Extended interpretations
        "tpsa_verdict":     tpsa_verdict,
        "tpsa_label":       tpsa_label,
        "rot_verdict":      rot_verdict,
        "rot_label":        rot_label,
        "qed_verdict":      qed_verdict,
        "qed_label":        qed_label,
    }
