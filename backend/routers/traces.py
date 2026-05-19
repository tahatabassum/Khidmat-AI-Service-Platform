from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
import models, schemas
from database import get_db

router = APIRouter()

@router.post("/")
def save_trace(trace: schemas.TraceCreate, db: Session = Depends(get_db)):
    new_trace = models.AgentTrace(
        booking_ref=trace.booking_ref,
        trace_data=trace.trace_data
    )
    db.add(new_trace)
    db.commit()
    return {"status": "success"}

@router.get("/{booking_ref}")
def get_trace(booking_ref: str, db: Session = Depends(get_db)):
    trace = db.query(models.AgentTrace).filter(models.AgentTrace.booking_ref == booking_ref).first()
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")
        
    try:
        data = json.loads(trace.trace_data)
    except:
        data = []
        
    return {"booking_ref": booking_ref, "steps": data}

@router.get("/latest/demo") # Added /demo to avoid clash with /{booking_ref}
def get_latest_traces(db: Session = Depends(get_db)):
    traces = db.query(models.AgentTrace).order_by(models.AgentTrace.created_at.desc()).limit(5).all()
    results = []
    for t in traces:
        try:
            data = json.loads(t.trace_data)
        except:
            data = []
        results.append({
            "booking_ref": t.booking_ref,
            "created_at": t.created_at,
            "steps": data
        })
    return results
