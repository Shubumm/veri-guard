import joblib
import json
import numpy as np
import pandas as pd
import xgboost as xgb
import shap
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, 'model', 'fraud_model.pkl'))

with open(os.path.join(BASE_DIR, 'model', 'model_config.json'), 'r') as f:
    config = json.load(f)

THRESHOLD = config['threshold']
PREDICTORS = config['predictors']

# Initialize SHAP explainer once at startup
explainer = shap.TreeExplainer(model)

def predict_fraud(data: dict):
    df = pd.DataFrame([data])
    dmatrix = xgb.DMatrix(df[PREDICTORS])
    prob = float(model.predict(dmatrix)[0])

    if prob >= THRESHOLD:
        risk_level = 'HIGH'
        action = 'BLOCKED'
    elif prob >= 0.5:
        risk_level = 'MEDIUM'
        action = 'FLAGGED'
    else:
        risk_level = 'LOW'
        action = 'APPROVED'

    # SHAP explanation
    shap_values = explainer.shap_values(df[PREDICTORS])
    shap_array = shap_values[0] if isinstance(shap_values, list) else shap_values[0]

    # Top 5 features by absolute SHAP value
    feature_impacts = []
    for i, feat in enumerate(PREDICTORS):
        feature_impacts.append({
            'feature': feat,
            'impact': round(float(shap_array[i]), 4),
            'value': round(float(df[feat].iloc[0]), 4)
        })

    feature_impacts.sort(key=lambda x: abs(x['impact']), reverse=True)
    top_features = feature_impacts[:5]

    return {
        'fraud_probability': round(prob, 4),
        'risk_level': risk_level,
        'action': action,
        'threshold_used': THRESHOLD,
        'top_features': top_features
    }