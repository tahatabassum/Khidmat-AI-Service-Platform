import time
import json
import os
import httpx
from datetime import datetime

from intent_parser.agent import IntentParserAgent
from provider_matcher.agent import ProviderMatcherAgent
from pricing_engine.agent import PricingEngineAgent
from booking_engine.agent import BookingEngineAgent
from followup_agent.agent import FollowupAgent
from dispute_agent.agent import DisputeAgent

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
TRACES_DIR = os.path.join(os.path.dirname(__file__), 'traces')
os.makedirs(TRACES_DIR, exist_ok=True)

class ServiceOrchestrator:
    def __init__(self):
        self.intent_parser = IntentParserAgent()
        self.provider_matcher = ProviderMatcherAgent()
        self.pricing_engine = PricingEngineAgent()
        self.booking_engine = BookingEngineAgent()
        self.followup_agent = FollowupAgent()
        self.dispute_agent = DisputeAgent()
        self.client = httpx.Client(base_url=BACKEND_URL, timeout=10.0)

    def _log_trace(self, trace_list: list, agent: str, input_data, output_data, start_time: float):
        time_ms = int((time.time() - start_time) * 1000)
        trace_list.append({
            "agent": agent,
            "input": input_data,
            "output": output_data,
            "time_ms": time_ms
        })

    def process_request(self, user_message: str, user_name: str, user_phone: str, image_base64: str = None) -> dict:
        agent_trace = []
        
        # Step 1: Intent Parser
        t0 = time.time()
        intent = self.intent_parser.parse(user_message, image_base64)
        self._log_trace(agent_trace, "Intent Parser", user_message, intent, t0)

        # Step 2: Confidence Check
        if intent.get("confirmation_needed") or intent.get("confidence_score", 0) < 0.7:
            return {
                "clarification_needed": True,
                "question": "Mujhe theek se samajh nahi aaya. Kya aap exactly bata sakte hain aapko kya service chahiye aur kahan?",
                "agent_trace": agent_trace
            }

        # Step 3: Provider Discovery
        t0 = time.time()
        service_type = intent.get("service_type")
        location = intent.get("location")
        try:
            resp = self.client.get(f"/providers/search?service_type={service_type}&location={location}&available_only=true")
            resp.raise_for_status()
            providers_list = resp.json()
        except httpx.ConnectError:
            # Mock data if backend is offline
            providers_list = [
                {"id": 1, "name": "Ali", "service_type": service_type, "distance_km": 2.5, "price_per_hour": 1000, "rating": 4.8, "on_time_score": 0.95, "cancellation_rate": 0.05, "skill_level": "intermediate"},
                {"id": 2, "name": "Ahmed", "service_type": service_type, "distance_km": 1.0, "price_per_hour": 800, "rating": 4.2, "on_time_score": 0.80, "cancellation_rate": 0.1, "skill_level": "basic"}
            ]
        self._log_trace(agent_trace, "Provider Discovery", f"GET /providers?service={service_type}&location={location}", f"{len(providers_list)} found", t0)

        if not providers_list:
            return {"no_providers_found": True, "message": "Maaf kijiyega, is waqt is area mein koi provider available nahi hai. Kisi aur waqt try karein?", "agent_trace": agent_trace}

        # Step 4: Provider Matcher
        t0 = time.time()
        match_result = self.provider_matcher.match(intent, providers_list)
        self._log_trace(agent_trace, "Provider Matcher", {"intent": intent, "providers_count": len(providers_list)}, match_result, t0)

        # Step 5: Pricing Engine (quotes for top 3)
        t0 = time.time()
        ranked_providers = match_result.get("ranked_providers", [])
        top_3 = ranked_providers[:3]
        
        priced_providers = []
        for p_rank in top_3:
            p_id = p_rank.get("provider_id")
            # Find provider obj
            p_obj = next((p for p in providers_list if str(p.get("id")) == str(p_id)), None)
            if not p_obj:
                continue
                
            quote = self.pricing_engine.generate_quote(p_obj, intent)
            priced_providers.append({
                "provider": p_obj,
                "match_info": p_rank,
                "pricing": quote
            })
            
        self._log_trace(agent_trace, "Pricing Engine", [p["provider_id"] for p in top_3], priced_providers, t0)

        # Step 6: Return
        return {
            "intent": intent,
            "ranked_providers": priced_providers,
            "overall_recommendation": match_result.get("overall_recommendation"),
            "agent_trace": agent_trace
        }

    def confirm_booking(self, provider_id: int, slot: str, user_name: str, user_phone: str, service_type: str, location: str, quoted_price: int, previous_trace: list = None) -> dict:
        agent_trace = previous_trace or []
        
        # Step 7: Booking Engine
        t0 = time.time()
        booking_result = self.booking_engine.book(provider_id, slot, user_name, user_phone, service_type, location, quoted_price)
        self._log_trace(agent_trace, "Booking Engine", {"provider_id": provider_id, "slot": slot}, booking_result, t0)
        
        if booking_result.get("status") == "conflict":
            return {"status": "conflict", "error": booking_result.get("error"), "suggested_slots": booking_result.get("suggested_slots"), "agent_trace": agent_trace}

        booking_ref = booking_result.get("booking_ref", "SVC-UNKNOWN")
        
        # Step 8: Follow-up Agent
        t0 = time.time()
        followups = self.followup_agent.schedule_followups(booking_result)
        self._log_trace(agent_trace, "Follow-up Agent", {"booking_ref": booking_ref}, followups, t0)

        # Step 9: Save Trace
        t0 = time.time()
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        trace_file = os.path.join(TRACES_DIR, f"{booking_ref}_{timestamp}.json")
        with open(trace_file, "w", encoding="utf-8") as f:
            json.dump({"booking_ref": booking_ref, "steps": agent_trace}, f, indent=2)
            
        # POST /traces (Optional if backend available)
        try:
            self.client.post("/traces", json={"booking_ref": booking_ref, "trace_data": json.dumps(agent_trace)})
        except:
            pass
        self._log_trace(agent_trace, "Trace Logger", "Save to JSON + DB", {"file": trace_file}, t0)

        # Step 10: Return
        return {
            "status": "confirmed",
            "booking_receipt": booking_result.get("receipt"),
            "confirmation_message": booking_result.get("confirmation_message"),
            "followup_schedule": followups,
            "agent_trace": agent_trace
        }
