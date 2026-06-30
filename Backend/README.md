# ADMET Backend — Setup Guide

## Folder structure

```
admet_backend/
├── app/
│   ├── main.py                  ← FastAPI app + CORS + lifespan
│   ├── core/
│   │   ├── model_loader.py      ← loads .pt + scalers at startup
│   │   ├── predictor.py         ← fingerprint → model → ADMET scores
│   │   └── lipinski.py          ← Lipinski Ro5 + QED + TPSA
│   ├── models/
│   │   ├── admet_net.py         ← PyTorch model architecture
│   │   └── schemas.py           ← Pydantic request/response schemas
│   └── routers/
│       ├── predict.py           ← POST /api/predict, /validate, /examples
│       └── health.py            ← GET /api/health
├── artifacts/                   ← ⬅ PUT YOUR ZIP CONTENTS HERE
│   ├── admet_model.pt
│   ├── scaler_esol.pkl
│   ├── scaler_lipo.pkl
│   ├── scaler_bbbp.pkl
│   ├── scaler_tox21.pkl
│   └── model_config.json        (optional — auto-generated if missing)
├── requirements.txt
└── run.py
```

## Step 1 — Place your model artifacts

Unzip `admet_model_artifacts.zip` from Colab.
Copy ALL files into the `artifacts/` folder:
```
admet_model.pt
scaler_esol.pkl   (or scaler_A.pkl — rename to scaler_esol.pkl)
scaler_lipo.pkl   (or scaler_E.pkl — rename to scaler_lipo.pkl)
scaler_bbbp.pkl   (or scaler_D.pkl — rename to scaler_bbbp.pkl)
scaler_tox21.pkl  (or scaler_T.pkl — rename to scaler_tox21.pkl)
```

> ⚠️ Scaler rename cheatsheet (from Colab output → expected name):
>   scaler_A.pkl → scaler_esol.pkl
>   scaler_D.pkl → scaler_bbbp.pkl
>   scaler_E.pkl → scaler_lipo.pkl
>   scaler_T.pkl → scaler_tox21.pkl

## Step 2 — Create virtual environment

```bash
cd admet_backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate
```

## Step 3 — Install dependencies

```bash
pip install -r requirements.txt
```

For RDKit specifically (if pip install rdkit fails):
```bash
conda install -c conda-forge rdkit
```

## Step 4 — Run the server

```bash
python run.py
```

API is now live at: http://localhost:8000
Interactive docs:   http://localhost:8000/docs

## API Endpoints

| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| GET    | /api/health       | Check model loaded status          |
| POST   | /api/predict      | Full ADMET + Lipinski prediction   |
| POST   | /api/validate     | Quick SMILES validation            |
| GET    | /api/examples     | Example molecules for UI           |

## Example curl

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"smiles": "CC(=O)Oc1ccccc1C(=O)O"}'
```
