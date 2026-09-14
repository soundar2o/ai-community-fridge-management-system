from app.schemas.ai_schemas import RecommendationRequest, RecommendationResponse

def recommend_fridges(req: RecommendationRequest) -> RecommendationResponse:
    default_fridges = [
        {"id": 1, "name": "Downtown Community Fridge", "occupancy": 0.25, "demandLevel": "HIGH", "distanceKm": 1.2},
        {"id": 2, "name": "Uptown Food Hub", "occupancy": 0.18, "demandLevel": "MEDIUM", "distanceKm": 3.4},
        {"id": 3, "name": "Westside Community Pantry", "occupancy": 0.33, "demandLevel": "LOW", "distanceKm": 5.1}
    ]

    fridges_to_eval = req.fridges if req.fridges else default_fridges

    scored_fridges = []
    for f in fridges_to_eval:
        demand_score = 30 if f.get("demandLevel") == "HIGH" else (20 if f.get("demandLevel") == "MEDIUM" else 10)
        urgency_score = 40 if req.expiryHours < 24 else (20 if req.expiryHours < 48 else 10)
        capacity_score = int((1.0 - f.get("occupancy", 0.5)) * 30)

        total_score = demand_score + urgency_score + capacity_score
        scored_fridges.append({
            "fridgeId": f.get("id"),
            "fridgeName": f.get("name", f"Fridge #{f.get('id')}"),
            "priorityScore": total_score,
            "demandLevel": f.get("demandLevel", "MEDIUM"),
            "recommendedReason": f"High capacity room & {f.get('demandLevel', 'MEDIUM')} category demand"
        })

    scored_fridges.sort(key=lambda x: x["priorityScore"], reverse=True)
    top_fridge = scored_fridges[0]["fridgeName"] if len(scored_fridges) > 0 else "Downtown Community Fridge"

    return RecommendationResponse(
        priorityFridge=top_fridge,
        recommendedPriority=scored_fridges,
        explanation=f"Recommended depositing {req.category} at '{top_fridge}' to optimize distribution velocity and prevent waste."
    )
