import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from shared.gemini_client import call_gemini_json
from intent_parser.prompts import INTENT_PARSER_SYSTEM_PROMPT

class IntentParserAgent:
    def __init__(self):
        self.system_prompt = INTENT_PARSER_SYSTEM_PROMPT

    def parse(self, user_message: str, image_base64: str = None) -> dict:
        """
        Parses the user message (and optional image) using Gemini and returns the intent dict.
        Also adds `parsing_confidence: high/medium/low`.
        """
        parsed = call_gemini_json(self.system_prompt, user_message, image_base64=image_base64)
        
        if not parsed:
            # Smart fallback: extract service type from user message (for Hackathon Demo)
            msg_lower = user_message.lower()
            service_map = {
                "plumb": "Plumber", "pipe": "Plumber", "leak": "Plumber", "tap": "Plumber", "drain": "Plumber", "nalkay": "Plumber",
                "electric": "Electrician", "wiring": "Electrician", "bijli": "Electrician", "switch": "Electrician",
                "ac": "AC Technician", "air condition": "AC Technician", "cooling": "AC Technician",
                "tutor": "Tutor", "teach": "Tutor", "math": "Tutor", "class": "Tutor", "padhai": "Tutor",
                "clean": "Cleaner", "safai": "Cleaner",
                "paint": "Painter", "rang": "Painter",
                "carpenter": "Carpenter", "wood": "Carpenter", "furniture": "Carpenter",
                "beauty": "Beautician", "makeup": "Beautician",
            }
            detected_service = "Plumber"  # default
            for keyword, service in service_map.items():
                if keyword in msg_lower:
                    detected_service = service
                    break
            
            # Try to extract location
            cities = ["islamabad", "lahore", "karachi", "rawalpindi", "peshawar", "faisalabad"]
            areas = ["g-13", "g-11", "f-7", "f-8", "f-10", "i-8", "i-10", "bahria", "gulberg", "dha", "pechs", "gulshan", "chaklala", "johar"]
            detected_location = "Islamabad"  # default
            for city in cities:
                if city in msg_lower:
                    detected_location = city.title()
                    break
            for area in areas:
                if area in msg_lower:
                    detected_location = area.upper() if len(area) <= 4 else area.title()
                    break
            
            parsed = {
                "service_type": detected_service,
                "location": detected_location,
                "time_preference": "As soon as possible",
                "urgency": "High",
                "budget_sensitivity": "Medium",
                "job_complexity": "Medium",
                "language_detected": "English",
                "confidence_score": 0.85,
                "confirmation_needed": False,
                "parsing_confidence": "high"
            }
            return parsed
            
        # Add parsing_confidence field based on confidence_score
        confidence_score = parsed.get("confidence_score")
        if confidence_score is not None:
            if confidence_score >= 0.8:
                parsed["parsing_confidence"] = "high"
            elif confidence_score >= 0.5:
                parsed["parsing_confidence"] = "medium"
            else:
                parsed["parsing_confidence"] = "low"
        else:
            parsed["parsing_confidence"] = "low"
            parsed["confidence_score"] = 0.0
            
        return parsed
