from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import random
import numpy as np

from predict import predict_fraud
from validate import validate_input
from database import log_transaction, get_recent_transactions, get_stats

app = FastAPI(
    title="Fraud Detection API",
    description="Real-time fraud detection engine for fintech",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transaction(BaseModel):
    Time: float
    V1: float; V2: float; V3: float; V4: float; V5: float
    V6: float; V7: float; V8: float; V9: float; V10: float
    V11: float; V12: float; V13: float; V14: float; V15: float
    V16: float; V17: float; V18: float; V19: float; V20: float
    V21: float; V22: float; V23: float; V24: float; V25: float
    V26: float; V27: float; V28: float
    Amount: float

# Fraud and legitimate transaction templates for simulator
FRAUD_TEMPLATE = {
    "Time": 406, "V1": -2.3122265423263, "V2": 1.95199201064158,
    "V3": -1.60985073229769, "V4": 3.9979055875468, "V5": -0.522187864667764,
    "V6": -1.42654531920595, "V7": -2.53738730624579, "V8": 1.39165724829804,
    "V9": -2.77008927719433, "V10": -2.77227214465915, "V11": 3.20203320709635,
    "V12": -2.89990738849473, "V13": -0.595221881324605, "V14": -4.28925378244217,
    "V15": 0.389724120274487, "V16": -1.14074717980657, "V17": -2.83005567450437,
    "V18": -0.0168224681808257, "V19": 0.416955705037907, "V20": 0.126910559061474,
    "V21": 0.517232370861764, "V22": -0.0350493686052974, "V23": -0.465211076182388,
    "V24": 0.320198198514526, "V25": 0.0445191674731724, "V26": 0.177839798284401,
    "V27": 0.261145002567677, "V28": -0.143275874698919, "Amount": 149.62
}

LEGIT_TEMPLATE = {
    "Time": 44261, "V1": 0.339812267, "V2": -2.743745237,
    "V3": -0.134070514, "V4": -1.385729189, "V5": -1.451413965,
    "V6": 0.248487158, "V7": -0.694138956, "V8": 0.177280379,
    "V9": -2.483061139, "V10": 1.399559588, "V11": 0.425851823,
    "V12": 0.412381787, "V13": 0.860869513, "V14": -2.507046661,
    "V15": 0.522287296, "V16": 0.508457542, "V17": -0.551404553,
    "V18": 0.397737587, "V19": -0.422116152, "V20": -0.029659853,
    "V21": 0.045229566, "V22": -0.086545463, "V23": -0.030353583,
    "V24": 0.215913963, "V25": 0.215913963, "V26": 0.145486674,
    "V27": -0.015337945, "V28": 0.017509053, "Amount": 520.12
}

def generate_transaction(fraud: bool = False):
    template = FRAUD_TEMPLATE if fraud else LEGIT_TEMPLATE
    tx = {}
    for k, v in template.items():
        noise = random.uniform(-0.1, 0.1)
        tx[k] = round(v + noise * abs(v), 6) if k != "Time" else round(v + random.randint(0, 1000), 2)
    tx["Amount"] = round(random.uniform(10, 3000) if not fraud else random.uniform(1, 500), 2)
    return tx

# ─── Routes ───────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Fraud Detection API is running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy", "model_version": "1.0.0"}

@app.post("/predict")
def predict(transaction: Transaction):
    data = transaction.dict()
    errors = validate_input(data)
    if errors:
        raise HTTPException(status_code=400, detail=errors)
    result = predict_fraud(data)
    log_transaction(data, result)
    return {"status": "success", "result": result}

@app.get("/transactions")
def recent_transactions(limit: int = 10):
    return {"status": "success", "transactions": get_recent_transactions(limit)}

@app.get("/stats")
def stats():
    return {"status": "success", "stats": get_stats()}

@app.post("/simulate")
def simulate():
    """Generate and process one random transaction (20% chance of fraud)"""
    is_fraud = random.random() < 0.2
    tx = generate_transaction(fraud=is_fraud)
    errors = validate_input(tx)
    if errors:
        raise HTTPException(status_code=400, detail=errors)
    result = predict_fraud(tx)
    log_transaction(tx, result)
    return {"status": "success", "result": result, "transaction": tx}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)