import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from app.schemas.ai_schemas import WasteRiskRequest, WasteRiskResponse

# Training Dataset for Food Waste Risk Classification
# Features: [quantity, days_until_expiry, category_code] -> target: waste_risk (0=LOW, 1=MEDIUM, 2=HIGH)
training_waste = pd.DataFrame([
    {"qty": 50, "days": 0.5, "cat": 1, "risk": 2}, # HIGH
    {"qty": 40, "days": 1.0, "cat": 1, "risk": 2}, # HIGH
    {"qty": 5, "days": 5.0, "cat": 2, "risk": 0},  # LOW
    {"qty": 10, "days": 3.0, "cat": 3, "risk": 1}, # MEDIUM
    {"qty": 30, "days": 0.8, "cat": 4, "risk": 2}, # HIGH
    {"qty": 2, "days": 10.0, "cat": 2, "risk": 0}, # LOW
    {"qty": 15, "days": 2.0, "cat": 5, "risk": 1}, # MEDIUM
    {"qty": 100, "days": 1.5, "cat": 1, "risk": 2},# HIGH
    {"qty": 4, "days": 4.0, "cat": 3, "risk": 0},  # LOW
])

CATEGORY_MAP = {
    "Cooked Meal": 1,
    "Groceries": 2,
    "Fruits & Vegetables": 3,
    "Bakery": 4,
    "Dairy": 5,
    "Beverages": 6,
    "Other": 7
}

X = training_waste[["qty", "days", "cat"]]
y = training_waste["risk"]

waste_model = RandomForestClassifier(n_estimators=50, random_state=42)
waste_model.fit(X, y)

def predict_waste_risk(req: WasteRiskRequest) -> WasteRiskResponse:
    cat_code = CATEGORY_MAP.get(req.category, 7)
    days = max(0.1, float(req.daysUntilExpiry))
    qty = max(1, req.quantity)

    features = np.array([[qty, days, cat_code]])
    probs = waste_model.predict_proba(features)[0]
    
    # Risk score calculated from weighted probability (0 to 1)
    risk_score = float(np.sum(probs * np.array([0.1, 0.5, 0.95])))
    risk_score = min(0.99, max(0.05, round(risk_score, 2)))

    if risk_score >= 0.70 or days <= 1.0:
        risk_level = "HIGH"
    elif risk_score >= 0.35:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return WasteRiskResponse(
        wasteRisk=risk_level,
        riskScore=risk_score,
        isPrototype=False,
        modelType="FastAPI / Scikit-Learn RandomForestClassifier"
    )
