from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tqb_ai_generator import TQB_AI_Generator
from tqb_db_connector import db

app = FastAPI(title="TravelQuoteBot AI API", version="1.0.0")

# Initialize AI generator
ai_generator = TQB_AI_Generator()

class ItineraryRequest(BaseModel):
    operator_id: str  # UUID of tour operator
    days: int
    cities: List[str]
    tour_type: str = "Private"
    pax: int = 2
    interests: List[str] = ["history", "culture"]
    start_date: str
    budget: str = "moderate"
    prompt: Optional[str] = None  # NEW: Optional pre-built prompt from Next.js

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "TravelQuoteBot AI",
        "version": "1.0.0",
        "port": 8001
    }

@app.post("/tqb-ai/generate-itinerary")
async def generate_itinerary(request: ItineraryRequest):
    try:
        print(f"\\n=== Generating itinerary for operator: {request.operator_id} ===")
        print(f"Cities: {request.cities}, Days: {request.days}, Pax: {request.pax}")

        # Check if we received a pre-built prompt from Next.js
        if request.prompt:
            print("Using pre-built prompt from Next.js (same as Claude)")
        else:
            print("Building prompt internally (Python generator)")

        # Fetch operator's data from database
        accommodations = db.get_operator_accommodations(request.operator_id, request.cities)
        activities = db.get_operator_activities(request.operator_id, request.cities)
        restaurants = db.get_operator_restaurants(request.operator_id, request.cities)

        print(f"Found: {len(accommodations)} hotels, {len(activities)} activities, {len(restaurants)} restaurants")

        # Generate itinerary using AI
        params = {
            "operator_id": request.operator_id,
            "days": request.days,
            "cities": request.cities,
            "tour_type": request.tour_type,
            "pax": request.pax,
            "interests": request.interests,
            "start_date": request.start_date,
            "budget": request.budget,
            "accommodations": accommodations,
            "activities": activities,
            "restaurants": restaurants,
            "prompt": request.prompt  # NEW: Pass the pre-built prompt if provided
        }

        result = ai_generator.generate_itinerary(params)

        return {
            "success": True,
            "itinerary": result
        }

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("\\n" + "="*60)
    print("Starting TravelQuoteBot AI API Server...")
    print("Port: 8001")
    print("API Documentation: http://localhost:8001/docs")
    print("Health Check: http://localhost:8001/health")
    print("="*60 + "\\n")
    uvicorn.run(app, host="0.0.0.0", port=8001, timeout_keep_alive=300)
