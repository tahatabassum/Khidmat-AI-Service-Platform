import json
from datetime import datetime
from sqlalchemy.orm import Session
import models


def message_payload(msg: models.ChatMessage) -> dict:
    return {
        "id": msg.id,
        "booking_ref": msg.booking_ref,
        "sender_name": msg.sender_name,
        "text": msg.text,
        "timestamp": msg.created_at.isoformat() + "Z",
    }


def message_json(msg: models.ChatMessage) -> str:
    return json.dumps(message_payload(msg))


def save_message(db: Session, booking_ref: str, sender_name: str, text: str) -> models.ChatMessage:
    text = (text or "").strip()
    sender_name = (sender_name or "Guest").strip() or "Guest"
    if not text:
        raise ValueError("Message text cannot be empty")

    booking = db.query(models.Booking).filter(models.Booking.booking_ref == booking_ref).first()
    if not booking:
        raise LookupError("Booking not found")

    msg = models.ChatMessage(
        booking_ref=booking_ref,
        sender_name=sender_name,
        text=text,
        created_at=datetime.utcnow(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
