from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas
from database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Provider])
def list_providers(
    service_type: Optional[str] = None, 
    city: Optional[str] = None, 
    area: Optional[str] = None, 
    available_only: Optional[bool] = False,
    db: Session = Depends(get_db)
):
    query = db.query(models.Provider)
    if service_type:
        query = query.filter(models.Provider.service_type.ilike(f"%{service_type}%"))
    if city:
        query = query.filter(models.Provider.city.ilike(f"%{city}%"))
    if area:
        query = query.filter(models.Provider.area.ilike(f"%{area}%"))
    if available_only:
        query = query.filter(models.Provider.available == True)
        
    return query.all()

@router.get("/search", response_model=List[schemas.Provider])
def search_providers(
    service_type: str,
    location: str,
    available_only: bool = True,
    db: Session = Depends(get_db)
):
    # Normalize AI-generated service types to match DB values
    # e.g. "Plumbing" -> "Plumber", "AC Repair" -> "AC Technician"
    service_map = {
        "plumbing": "Plumber",
        "plumber": "Plumber",
        "electrician": "Electrician",
        "electrical": "Electrician",
        "ac repair": "AC Technician",
        "ac technician": "AC Technician",
        "ac tech": "AC Technician",
        "hvac": "AC Technician",
        "air conditioning": "AC Technician",
        "tutor": "Tutor",
        "tutoring": "Tutor",
        "teaching": "Tutor",
        "cleaner": "Cleaner",
        "cleaning": "Cleaner",
        "painter": "Painter",
        "painting": "Painter",
        "carpenter": "Carpenter",
        "carpentry": "Carpenter",
        "beautician": "Beautician",
        "beauty": "Beautician",
    }
    
    normalized_service = service_map.get(service_type.lower().strip(), service_type)
    
    query = db.query(models.Provider).filter(models.Provider.service_type.ilike(f"%{normalized_service}%"))
    if available_only:
        query = query.filter(models.Provider.available == True)
    
    # Try location-aware search first
    location_str = str(location).strip() if location else ""
    if location_str and location_str.lower() not in ["none", "null", "n/a", ""]:
        location_query = query.filter(
            (models.Provider.area.ilike(f"%{location_str}%")) | 
            (models.Provider.city.ilike(f"%{location_str}%"))
        )
        providers = location_query.order_by(models.Provider.rating.desc(), models.Provider.distance_km.asc()).all()
        
        # FALLBACK: If no providers in that location, return all providers of that service type
        if not providers:
            providers = query.order_by(models.Provider.rating.desc(), models.Provider.distance_km.asc()).all()
    else:
        providers = query.order_by(models.Provider.rating.desc(), models.Provider.distance_km.asc()).all()
    
    for p in providers:
        p.distance_label = f"{p.distance_km} km away"
        p.price_label = f"Rs. {p.price_per_hour}/hr"
        
    return providers

@router.get("/services/list")
def list_unique_services(db: Session = Depends(get_db)):
    services = db.query(models.Provider.service_type).distinct().all()
    return [s[0] for s in services]

@router.get("/{id}", response_model=schemas.Provider)
def get_provider(id: int, db: Session = Depends(get_db)):
    provider = db.query(models.Provider).filter(models.Provider.id == id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    provider.distance_label = f"{provider.distance_km} km away"
    provider.price_label = f"Rs. {provider.price_per_hour}/hr"
    return provider

@router.post("/register", response_model=schemas.Provider)
def register_provider(data: schemas.ProviderRegister, db: Session = Depends(get_db)):
    """Self-registration endpoint for service providers."""
    import random
    
    # Check duplicate phone
    existing = db.query(models.Provider).filter(models.Provider.phone == data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    provider = models.Provider(
        name=data.name,
        owner_name=data.name,
        service_type=data.service_type,
        area=data.area,
        city=data.city,
        rating=0.0,
        total_reviews=0,
        on_time_score=1.0,
        cancellation_rate=0.0,
        experience_years=data.experience_years,
        skill_level=data.skill_level,
        price_per_hour=data.price_per_hour,
        distance_km=round(random.uniform(0.5, 10.0), 1),
        available=True,
        phone=data.phone,
        slots=data.slots
    )
    db.add(provider)
    db.commit()
    db.refresh(provider)
    provider.distance_label = f"{provider.distance_km} km away"
    provider.price_label = f"Rs. {provider.price_per_hour}/hr"
    return provider
