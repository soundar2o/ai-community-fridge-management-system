# Community Fridge System — FastAPI AI Service

This microservice provides Machine Learning & Computer Vision capabilities for the AI-Powered Digital Community Fridge Management System.

## Stack
- **Framework**: FastAPI + Uvicorn
- **Machine Learning**: Scikit-Learn (RandomForestRegressor, RandomForestClassifier)
- **Data Manipulation**: Pandas, NumPy
- **Computer Vision**: OpenCV, Pillow

## API Endpoints
1. `GET /health` — Service health check
2. `POST /api/ai/demand/predict` — Scikit-Learn Demand Quantity & Level Prediction
3. `POST /api/ai/waste/predict` — Scikit-Learn Food Waste Risk Assessment
4. `POST /api/ai/recommend/fridges` — Fridge Distribution Priority Recommendation Engine
5. `POST /api/ai/freshness/analyze` — OpenCV HSV & Texture Freshness Analysis

## How to Run

```bash
# 1. Navigate to ai-service
cd backend/ai-service

# 2. Install dependencies
py -m pip install -r requirements.txt

# 3. Run FastAPI application on port 8000
py -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
