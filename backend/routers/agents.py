from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import sys
import os

# Import orchestrator from agents folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'agents')))
from orchestrator import ServiceOrchestrator  # type: ignore

router = APIRouter()
orchestrator = ServiceOrchestrator()

from typing import Optional

class OrchestrateRequest(BaseModel):
    user_message: str
    user_name: str = "User"
    user_phone: str = "03000000000"
    image_base64: Optional[str] = None

@router.post("/orchestrate")
def orchestrate(req: OrchestrateRequest):
    try:
        result = orchestrator.process_request(req.user_message, req.user_name, req.user_phone, req.image_base64)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
