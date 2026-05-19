from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
from connections import manager
from chat_service import save_message, message_json

router = APIRouter()


@router.get("/{booking_ref}", response_model=List[schemas.ChatMessage])
def list_messages(booking_ref: str, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.booking_ref == booking_ref).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    rows = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.booking_ref == booking_ref)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )
    return [
        schemas.ChatMessage(
            id=m.id,
            booking_ref=m.booking_ref,
            sender_name=m.sender_name,
            text=m.text,
            timestamp=m.created_at,
        )
        for m in rows
    ]


@router.post("/{booking_ref}", response_model=schemas.ChatMessage)
async def send_message(
    booking_ref: str,
    body: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
):
    try:
        msg = save_message(db, booking_ref, body.sender_name, body.text)
    except LookupError:
        raise HTTPException(status_code=404, detail="Booking not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    await manager.broadcast(message_json(msg), booking_ref)
    return schemas.ChatMessage(
        id=msg.id,
        booking_ref=msg.booking_ref,
        sender_name=msg.sender_name,
        text=msg.text,
        timestamp=msg.created_at,
    )
