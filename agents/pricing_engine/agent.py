import sys
import os
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from shared.gemini_client import call_gemini_json
from pricing_engine.prompts import PRICING_ENGINE_SYSTEM_PROMPT

class PricingEngineAgent:
    def __init__(self):
        self.system_prompt = PRICING_ENGINE_SYSTEM_PROMPT

    def generate_quote(self, provider: dict, parsed_intent: dict) -> dict:
        """
        Generates a dynamic quote based on provider details and intent.
        """
        user_message = json.dumps({
            "provider": provider,
            "parsed_intent": parsed_intent
        }, indent=2)
        
        result = call_gemini_json(self.system_prompt, user_message)
        
        if not result:
            # Fallback mock data if API fails (for Hackathon Demo)
            base = provider.get("price_per_hour", 1000)
            result = {
                "quoted_price": base + 500,
                "price_breakdown": {
                    "base_rate": base,
                    "distance_cost": 200,
                    "urgency_surcharge": 300,
                    "complexity_surcharge": 0,
                    "demand_surcharge": 0,
                    "loyalty_discount": 0
                },
                "budget_alternative": "Wait until tomorrow for a lower rate",
                "fairness_score": 0.85
            }
            
        return result
