from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter()

@router.post("/quote")
def generate_quote(request: schemas.QuoteRequest, db: Session = Depends(get_db)):
    provider = db.query(models.Provider).filter(models.Provider.id == request.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
        
    base = provider.price_per_hour
    
    # Distance cost: max(0, distance_km - 3) * 50
    distance_cost = max(0, provider.distance_km - 3) * 50
    
    # Urgency surcharge
    urgency_surcharge = base * 0.20 if request.urgency.lower() == "urgent" else 0
    
    # Complexity multiplier
    comp = request.job_complexity.lower()
    if comp == "complex":
        complexity_mult = 1.6
    elif comp == "intermediate":
        complexity_mult = 1.3
    else:
        complexity_mult = 1.0
        
    complexity_surcharge = (base * complexity_mult) - base
        
    # Demand surcharge (simplified: assume +10% always or based on some static logic)
    demand_surcharge = base * 0.10
    
    # Loyalty discount (simplified: assume 0 unless user has bookings)
    user_bookings = db.query(models.Booking).filter(models.Booking.user_phone == request.user_phone).count()
    loyalty_discount = base * 0.05 if user_bookings >= 3 else 0
    
    quoted_price = base + distance_cost + urgency_surcharge + complexity_surcharge + demand_surcharge - loyalty_discount
    quoted_price = int(quoted_price) # round to integer
    
    breakdown = {
        "base_rate": base,
        "distance_cost": int(distance_cost),
        "urgency_surcharge": int(urgency_surcharge),
        "complexity_surcharge": int(complexity_surcharge),
        "demand_surcharge": int(demand_surcharge),
        "loyalty_discount": int(loyalty_discount)
    }
    
    # Normally Agent 3 (Pricing Engine) calls this endpoint, but since Agent 3 does it internally,
    # the PRD says Member 2 (Backend Lead) should expose this.
    # The agent might just use this to verify or the frontend might call it directly.
    return {
        "quoted_price": quoted_price,
        "price_breakdown": breakdown,
        "budget_alternative": "Consider booking during off-peak hours for a 15% discount.",
        "fairness_score": 95
    }
