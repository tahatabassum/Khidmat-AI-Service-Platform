from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import hashlib
import models
from database import get_db

router = APIRouter()

class SignupRequest(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    password: str
    city: str = "Islamabad"

class LoginRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    password: str

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if not req.phone and not req.email:
        raise HTTPException(status_code=400, detail="Phone or email is required")
    
    # Check if phone or email already exists
    if req.phone:
        existing = db.query(models.User).filter(models.User.phone == req.phone).first()
        if existing:
            raise HTTPException(status_code=400, detail="Phone number already registered")
    if req.email:
        existing = db.query(models.User).filter(models.User.email == req.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    user = models.User(
        name=req.name,
        phone=req.phone,
        email=req.email,
        password_hash=hash_password(req.password),
        city=req.city
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone or "",
        "email": user.email or "",
        "city": user.city,
        "message": "Account created successfully"
    }

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    if not req.phone and not req.email:
        raise HTTPException(status_code=400, detail="Phone or email is required")
    
    user = None
    if req.phone:
        user = db.query(models.User).filter(models.User.phone == req.phone).first()
    elif req.email:
        user = db.query(models.User).filter(models.User.email == req.email).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Account not found")
    
    if user.password_hash != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone or "",
        "email": user.email or "",
        "city": user.city,
        "message": "Login successful"
    }
