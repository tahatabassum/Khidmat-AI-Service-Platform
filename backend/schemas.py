from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class ProviderBase(BaseModel):
    name: str
    owner_name: str
    service_type: str
    area: str
    city: str
    rating: float
    total_reviews: int
    on_time_score: float
    cancellation_rate: float
    experience_years: int
    skill_level: str
    price_per_hour: int
    distance_km: float
    available: bool
    phone: str
    slots: str # JSON encoded string

class ProviderCreate(ProviderBase):
    pass

class ProviderRegister(BaseModel):
    name: str
    phone: str
    service_type: str
    area: str
    city: str
    experience_years: int
    price_per_hour: int
    skill_level: str = "intermediate"
    slots: str = '["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"]'

class Provider(ProviderBase):
    id: int
    created_at: datetime
    distance_label: Optional[str] = None
    price_label: Optional[str] = None

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    provider_id: int
    slot: str
    user_name: str
    user_phone: str
    location: str
    quoted_price: int

class Booking(BaseModel):
    id: int
    booking_ref: str
    provider_id: int
    user_name: str
    user_phone: str
    service_type: str
    location: str
    slot: str
    status: str
    quoted_price: int
    actual_price: Optional[int] = None
    notes: Optional[str] = None
    user_rating: Optional[int] = None
    provider_rating: Optional[int] = None
    created_at: datetime
    confirmed_at: Optional[datetime] = None
    
    # We'll attach the provider when returning full receipt
    provider: Optional[Provider] = None

    class Config:
        from_attributes = True

class RatingCreate(BaseModel):
    user_rating: Optional[int] = None
    provider_rating: Optional[int] = None

class DisputeCreate(BaseModel):
    booking_ref: str
    type: str # mapping to dispute_type
    description: str

class Dispute(BaseModel):
    id: int
    booking_ref: str
    dispute_type: str
    description: str
    status: str
    resolution: Optional[str] = None
    compensation: int
    provider_flag: str
    created_at: datetime

    class Config:
        from_attributes = True

class TraceCreate(BaseModel):
    booking_ref: str
    trace_data: str

class QuoteRequest(BaseModel):
    provider_id: int
    service_type: str
    location: str
    urgency: str
    job_complexity: str
    user_phone: str

class ChatMessageCreate(BaseModel):
    sender_name: str
    text: str

class ChatMessage(BaseModel):
    id: int
    booking_ref: str
    sender_name: str
    text: str
    timestamp: datetime

    class Config:
        from_attributes = True
