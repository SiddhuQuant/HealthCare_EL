const BASE = 'http://localhost:8000/api'

export async function predictMolecule(smiles) {
  const res = await fetch(`${BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smiles }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail?.message || 'Prediction failed')
  }
  return res.json()
}

export async function validateSmiles(smiles) {
  const res = await fetch(`${BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smiles }),
  })
  if (!res.ok) return { valid: false }
  return res.json()
}

export async function getExamples() {
  const res = await fetch(`${BASE}/examples`)
  if (!res.ok) return { examples: [] }
  return res.json()
}

export const EXAMPLE_MOLECULES = [
  { name: 'Aspirin',      smiles: 'CC(=O)Oc1ccccc1C(=O)O',                       desc: 'Analgesic / Anti-inflammatory' },
  { name: 'Caffeine',     smiles: 'Cn1cnc2c1c(=O)n(c(=O)n2C)C',                  desc: 'CNS Stimulant' },
  { name: 'Ibuprofen',    smiles: 'CC(C)Cc1ccc(cc1)C(C)C(=O)O',                   desc: 'NSAID Pain Reliever' },
  { name: 'Penicillin G', smiles: 'CC1(C)SC2C(NC1=O)C(=O)N2Cc1ccccc1',           desc: 'Beta-lactam Antibiotic' },
  { name: 'Atorvastatin', smiles: 'CC(C)c1c(C(=O)Nc2ccccc2F)c(-c2ccccc2)c(-c2ccc(F)cc2)n1CCC(O)CC(O)CC(=O)O', desc: 'Cholesterol Statin' },
  { name: 'Ethanol',      smiles: 'CCO',                                            desc: 'Simple Alcohol (control)' },
]
