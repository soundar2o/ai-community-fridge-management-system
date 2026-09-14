from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.ai_schemas import (
    DemandPredictionRequest, DemandPredictionResponse,
    WasteRiskRequest, WasteRiskResponse,
    RecommendationRequest, RecommendationResponse,
    FreshnessResponse
)
from app.services.demand_service import predict_demand
from app.services.waste_service import predict_waste_risk
from app.services.recommendation_service import recommend_fridges
from app.services.freshness_service import analyze_image_freshness

app = FastAPI(
    title="Digital Community Fridge AI Microservice",
    description="FastAPI AI Service powering Demand Prediction, Waste Risk Analysis, Recommendation Matching, and Freshness Detection.",
    version="1.0.0"
)

# Enable CORS for Spring Boot and React clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "UP", "service": "FastAPI AI Microservice", "version": "1.0.0"}

@app.post("/api/ai/demand/predict", response_model=DemandPredictionResponse)
def get_demand_prediction(req: DemandPredictionRequest):
    return predict_demand(req)

@app.post("/api/ai/waste/predict", response_model=WasteRiskResponse)
def get_waste_prediction(req: WasteRiskRequest):
    return predict_waste_risk(req)

@app.post("/api/ai/recommend/fridges", response_model=RecommendationResponse)
def get_fridge_recommendations(req: RecommendationRequest):
    return recommend_fridges(req)

@app.post("/api/ai/freshness/analyze", response_model=FreshnessResponse)
async def analyze_freshness(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
    contents = await file.read()
    return analyze_image_freshness(contents)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
