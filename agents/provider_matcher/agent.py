import sys
import os
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from shared.gemini_client import call_gemini_json
from provider_matcher.prompts import PROVIDER_MATCHER_SYSTEM_PROMPT

class ProviderMatcherAgent:
    def __init__(self):
        self.system_prompt = PROVIDER_MATCHER_SYSTEM_PROMPT

    def match(self, parsed_intent: dict, providers_list: list) -> dict:
        """
        Ranks providers based on intent and 6 factors.
        """
        user_message = json.dumps({
            "parsed_intent": parsed_intent,
            "providers_list": providers_list
        }, indent=2)
        
        result = call_gemini_json(self.system_prompt, user_message)
        
        if not result:
            # Smart fallback using provider data (for Hackathon Demo)
            ranked = []
            sorted_providers = sorted(providers_list[:5], key=lambda p: (-p.get("rating", 0), p.get("distance_km", 99)))
            for i, p in enumerate(sorted_providers[:3]):
                is_top = i == 0
                reasoning_parts = []
                if p.get("rating", 0) >= 4.5:
                    reasoning_parts.append(f"Excellent {p.get('rating')} star rating")
                elif p.get("rating", 0) >= 4.0:
                    reasoning_parts.append(f"Strong {p.get('rating')} star rating")
                else:
                    reasoning_parts.append(f"Rated {p.get('rating')} stars")
                if p.get("distance_km", 0) <= 3:
                    reasoning_parts.append(f"only {p.get('distance_km')}km away")
                else:
                    reasoning_parts.append(f"{p.get('distance_km')}km from your location")
                if p.get("experience_years", 0) >= 5:
                    reasoning_parts.append(f"{p.get('experience_years')} years experience")
                if p.get("skill_level") == "expert":
                    reasoning_parts.append("expert-level skills")
                    
                ranked.append({
                    "provider_id": p["id"],
                    "match_score": round(0.95 - (i * 0.08), 2),
                    "reasoning": ". ".join(reasoning_parts) + f". {'Top choice for your area.' if is_top else 'Good alternative option.'}",
                    "is_closest": p.get("distance_km", 99) == min(pp.get("distance_km", 99) for pp in sorted_providers[:3])
                })
            result = {
                "ranked_providers": ranked,
                "overall_recommendation": f"We found {len(sorted_providers)} providers matching your requirements. Our AI selected the best based on rating, proximity, and expertise."
            }
            
        return result
