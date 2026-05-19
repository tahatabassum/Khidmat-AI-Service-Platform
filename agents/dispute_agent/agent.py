import sys
import os
import json
import uuid
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from shared.gemini_client import call_gemini_json
from dispute_agent.prompts import DISPUTE_SYSTEM_PROMPT

class DisputeAgent:
    def __init__(self):
        self.system_prompt = DISPUTE_SYSTEM_PROMPT

    def handle_dispute(self, booking_ref: str, dispute_type: str, description: str) -> dict:
        """
        Analyzes the dispute and generates a resolution using Gemini.
        """
        dispute_id = f"DSP-{uuid.uuid4().hex[:8].upper()}"
        
        user_message = json.dumps({
            "dispute_type": dispute_type,
            "description": description
        }, indent=2)
        
        gemini_response = call_gemini_json(self.system_prompt, user_message)
        
        return {
            "dispute_id": dispute_id,
            "booking_ref": booking_ref,
            "resolution": gemini_response.get("resolution_recommendation", "Manual review required"),
            "compensation": gemini_response.get("compensation_amount", 0),
            "provider_action": gemini_response.get("provider_flag", "none"),
            "message": gemini_response.get("message_to_user", "We are reviewing your dispute."),
            "escalation_decision": gemini_response.get("escalation_decision", "human escalation")
        }

    def escalate_to_human(self, dispute_id: str) -> dict:
        """
        Escalates a dispute to human support manually.
        """
        return {
            "dispute_id": dispute_id,
            "resolution": "Escalated to human support",
            "compensation": 0,
            "provider_action": "under investigation",
            "message": "A human agent will contact you shortly regarding this issue."
        }
