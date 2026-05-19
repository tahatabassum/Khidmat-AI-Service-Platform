import sys
import os
import json
import httpx
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

LOGS_DIR = os.path.join(os.path.dirname(__file__), '..', 'followup_logs')
os.makedirs(LOGS_DIR, exist_ok=True)

class FollowupAgent:
    def __init__(self):
        pass

    def schedule_followups(self, booking: dict) -> dict:
        """
        Creates 5 simulated notifications for a booking.
        """
        booking_ref = booking.get("booking_ref", "SVC-UNKNOWN")
        provider_name = booking.get("receipt", {}).get("provider", {}).get("name", "Provider")
        
        # In a real system, these would be scheduled jobs. We simulate the timeline here.
        notifications = [
            {
                "type": "Confirmation",
                "timing": "immediate",
                "message": booking.get("confirmation_message", f"Aapka booking confirm ho gaya hai {provider_name} ke sath.")
            },
            {
                "type": "Reminder",
                "timing": "1 hour before",
                "message": "Ghar par rahiyega! Aapka service provider 1 ghante mein pahonch raha hai."
            },
            {
                "type": "En-route",
                "timing": "15 min before",
                "message": f"{provider_name} is on the way!"
            },
            {
                "type": "Completion",
                "timing": "after service",
                "message": "Kaam kaisa laga? Please apna feedback share karein."
            },
            {
                "type": "Reputation update",
                "timing": "after feedback",
                "message": "System will update provider score based on your feedback."
            }
        ]
        
        log_file = os.path.join(LOGS_DIR, f"{booking_ref}.json")
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump({"booking_ref": booking_ref, "notifications": notifications}, f, indent=2)
            
        return {"scheduled": True, "notifications": notifications}

    def collect_feedback(self, booking_ref: str, rating: float, comment: str) -> dict:
        """
        Simulates collecting feedback and updating provider reputation.
        """
        # Usually we would call the backend to update the score
        # e.g., POST /providers/{id}/feedback
        return {
            "booking_ref": booking_ref,
            "rating_received": rating,
            "feedback": comment,
            "status": "Provider reputation updated (Simulated)"
        }
