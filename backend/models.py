from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Provider(Base):
    __tablename__ = "providers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    owner_name = Column(String)
    service_type = Column(String, index=True)
    area = Column(String, index=True)
    city = Column(String, index=True)
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    on_time_score = Column(Float, default=0.0)
    cancellation_rate = Column(Float, default=0.0)
    experience_years = Column(Integer, default=0)
    skill_level = Column(String) # basic/intermediate/complex
    price_per_hour = Column(Integer)
    distance_km = Column(Float, default=0.0)
    available = Column(Boolean, default=True)
    phone = Column(String)
    slots = Column(Text) # JSON string of available slots e.g. ["10:00 AM", "02:00 PM"]
    created_at = Column(DateTime, default=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="provider")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_ref = Column(String, unique=True, index=True) # SVC-YYYY-XXXX
    provider_id = Column(Integer, ForeignKey("providers.id"))
    user_name = Column(String)
    user_phone = Column(String, index=True)
    service_type = Column(String)
    location = Column(String)
    slot = Column(String)
    status = Column(String, default="pending") # pending, confirmed, cancelled, completed
    quoted_price = Column(Integer)
    actual_price = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    user_rating = Column(Integer, nullable=True)
    provider_rating = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)
    
    provider = relationship("Provider", back_populates="bookings")

class Dispute(Base):
    __tablename__ = "disputes"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_ref = Column(String, index=True)
    dispute_type = Column(String) # no_show, quality_complaint, price_disagreement, overrun
    description = Column(Text)
    status = Column(String, default="open") # open, resolved, escalated
    resolution = Column(Text, nullable=True)
    compensation = Column(Integer, default=0)
    provider_flag = Column(String, default="none") # none, warning, blacklist
    created_at = Column(DateTime, default=datetime.utcnow)

class AgentTrace(Base):
    __tablename__ = "agent_traces"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_ref = Column(String, index=True)
    trace_data = Column(Text) # JSON text containing the 6-agent trace
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    booking_ref = Column(String, index=True)
    sender_name = Column(String)
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String)
    city = Column(String, default="Islamabad")
    created_at = Column(DateTime, default=datetime.utcnow)
