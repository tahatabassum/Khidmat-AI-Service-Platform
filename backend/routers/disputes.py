from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Dispute)
def create_dispute(dispute: schemas.DisputeCreate, db: Session = Depends(get_db)):
    # Check if booking exists
    booking = db.query(models.Booking).filter(models.Booking.booking_ref == dispute.booking_ref).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    new_dispute = models.Dispute(
        booking_ref=dispute.booking_ref,
        dispute_type=dispute.type,
        description=dispute.description
    )
    db.add(new_dispute)
    db.commit()
    db.refresh(new_dispute)
    return new_dispute

@router.get("/{ref}", response_model=schemas.Dispute)
def get_dispute(ref: str, db: Session = Depends(get_db)):
    dispute = db.query(models.Dispute).filter(models.Dispute.booking_ref == ref).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    return dispute
