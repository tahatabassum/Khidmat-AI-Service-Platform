from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime
import models, schemas
from database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    # 1. Check if provider exists
    provider = db.query(models.Provider).filter(models.Provider.id == booking.provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
        
    # 2. Check slot conflict (has this provider already been booked for this slot?)
    conflict = db.query(models.Booking).filter(
        models.Booking.provider_id == booking.provider_id,
        models.Booking.slot == booking.slot,
        models.Booking.status.in_(["pending", "confirmed"])
    ).first()
    
    if conflict:
        import json
        available_slots = json.loads(provider.slots) if provider.slots else []
        # Filter out the conflicting slot
        suggested = [s for s in available_slots if s != booking.slot][:2]
        # Return 409 Conflict with suggested slots
        raise HTTPException(status_code=409, detail={"error": "slot taken", "suggested_slots": suggested})
        
    # 3. Create booking
    booking_ref = f"SVC-{datetime.utcnow().year}-{uuid.uuid4().hex[:4].upper()}"
    
    new_booking = models.Booking(
        booking_ref=booking_ref,
        provider_id=booking.provider_id,
        user_name=booking.user_name,
        user_phone=booking.user_phone,
        service_type=provider.service_type,
        location=booking.location,
        slot=booking.slot,
        quoted_price=booking.quoted_price,
        status="confirmed",
        confirmed_at=datetime.utcnow()
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    return new_booking

@router.get("/{ref}", response_model=schemas.Booking)
def get_booking(ref: str, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.booking_ref == ref).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.get("/user/{phone}", response_model=List[schemas.Booking])
def get_user_bookings(phone: str, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(models.Booking.user_phone == phone).order_by(models.Booking.created_at.desc()).all()
    return bookings

@router.delete("/{ref}")
def cancel_booking(ref: str, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.booking_ref == ref).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = "cancelled"
    db.commit()
    return {"cancelled": True, "message": "Booking cancelled"}

@router.post("/{ref}/complete")
def complete_booking(ref: str, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.booking_ref == ref).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = "completed"
    db.commit()
    return {"completed": True, "message": "Booking marked as completed"}

@router.post("/{ref}/rate")
def rate_booking(ref: str, rating: schemas.RatingCreate, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.booking_ref == ref).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if rating.user_rating is not None:
        booking.user_rating = rating.user_rating
        
    if rating.provider_rating is not None:
        booking.provider_rating = rating.provider_rating
        
        # Update provider's overall rating
        provider = db.query(models.Provider).filter(models.Provider.id == booking.provider_id).first()
        if provider:
            # simple running average
            total_score = (provider.rating * provider.total_reviews) + rating.provider_rating
            provider.total_reviews += 1
            provider.rating = round(total_score / provider.total_reviews, 1)

    db.commit()
    return {"rated": True, "message": "Rating submitted successfully"}
