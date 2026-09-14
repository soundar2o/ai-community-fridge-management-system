from pydantic import BaseModel, Field
from typing import List, Optional

class DemandPredictionRequest(BaseModel):
    fridgeId: Optional[int] = Field(None, description="Community fridge ID")
    category: Optional[str] = Field("Cooked Meal", description="Food category")
    historicalDemand: Optional[List[int]] = Field(None, description="Optional historical demand list")

class DemandPredictionResponse(BaseModel):
    predictedDemand: int
    demandLevel: str
    confidence: float
    isPrototype: bool = False
    modelType: str = "FastAPI / Scikit-Learn RandomForestRegressor"

class WasteRiskRequest(BaseModel):
    quantity: int = Field(..., description="Food quantity")
    category: str = Field("Cooked Meal", description="Food category")
    daysUntilExpiry: float = Field(..., description="Days until food expires")
    fridgeId: Optional[int] = Field(None, description="Fridge ID")

class WasteRiskResponse(BaseModel):
    wasteRisk: str
    riskScore: float
    isPrototype: bool = False
    modelType: str = "FastAPI / Scikit-Learn RandomForestClassifier"

class RecommendationRequest(BaseModel):
    category: str
    quantity: int
    expiryHours: float
    fridges: Optional[List[dict]] = None

class RecommendationResponse(BaseModel):
    priorityFridge: str
    recommendedPriority: List[dict]
    explanation: str
    modelType: str = "FastAPI / Priority Matching Engine"

class FreshnessResponse(BaseModel):
    label: str
    confidence: float
    freshnessScore: float
    details: str
    isPrototype: bool = False
    modelType: str = "FastAPI / OpenCV Color & Texture Analysis"
