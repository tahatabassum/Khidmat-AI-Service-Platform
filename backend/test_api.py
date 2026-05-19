import urllib.request
import urllib.error
import json

BASE_URL = "http://127.0.0.1:8000"

def fetch(url, method="GET", data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header("Content-Type", "application/json")
        req.data = json.dumps(data).encode("utf-8")
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        return 500, {"error": str(e)}

def test_api():
    print("--- Starting Backend API Tests ---")
    
    # 1. Health Check
    print("\n1. Testing GET /health...")
    status, data = fetch(f"{BASE_URL}/health")
    print(f"Status: {status}")
    print(json.dumps(data, indent=2))
    
    # 2. Stats
    print("\n2. Testing GET /stats...")
    status, data = fetch(f"{BASE_URL}/stats")
    print(f"Status: {status}")
    print(json.dumps(data, indent=2))
    
    # 3. Get Providers
    print("\n3. Testing GET /providers...")
    status, providers = fetch(f"{BASE_URL}/providers")
    print(f"Status: {status}")
    print(f"Fetched {len(providers)} providers. First provider:")
    if providers and isinstance(providers, list):
        print(json.dumps(providers[0], indent=2))
        
    # 4. Search Providers
    print("\n4. Testing GET /providers/search...")
    status, search_res = fetch(f"{BASE_URL}/providers/search?service_type=Plumber&location=G-13&available_only=true")
    print(f"Status: {status}")
    if isinstance(search_res, list):
        print(f"Found {len(search_res)} available plumbers in G-13 or Islamabad:")
        if search_res:
            print(f"Top pick: {search_res[0].get('name')} - {search_res[0].get('distance_label')} - {search_res[0].get('price_label')}")
            
    # 5. Pricing Quote
    print("\n5. Testing POST /pricing/quote...")
    if providers and isinstance(providers, list):
        provider_id = providers[0]['id']
        payload = {
            "provider_id": provider_id,
            "service_type": "Test Service",
            "location": "G-13",
            "urgency": "urgent",
            "job_complexity": "intermediate",
            "user_phone": "03001234567"
        }
        status, data = fetch(f"{BASE_URL}/pricing/quote", method="POST", data=payload)
        print(f"Status: {status}")
        print(json.dumps(data, indent=2))
        
    # 6. Create Booking
    print("\n6. Testing POST /bookings...")
    if providers and isinstance(providers, list):
        provider_id = providers[0]['id']
        slots = json.loads(providers[0]['slots']) if providers[0].get('slots') else []
        slot = slots[0] if slots else "10:00 AM"
        
        payload = {
            "provider_id": provider_id,
            "slot": slot,
            "user_name": "Test User",
            "user_phone": "03001234567",
            "location": "G-13",
            "quoted_price": 1000
        }
        status, booking = fetch(f"{BASE_URL}/bookings/", method="POST", data=payload)
        print(f"Status: {status}")
        print(json.dumps(booking, indent=2))
        
        # 7. Check Conflict
        print("\n7. Testing Booking Conflict (Double booking)...")
        status, data = fetch(f"{BASE_URL}/bookings/", method="POST", data=payload)
        print(f"Status: {status}")
        print(json.dumps(data, indent=2))
        
        # 8. Complete Booking
        if "booking_ref" in booking:
            print("\n8. Testing POST /bookings/{ref}/complete...")
            booking_ref = booking.get('booking_ref')
            status, data = fetch(f"{BASE_URL}/bookings/{booking_ref}/complete", method="POST")
            print(f"Status: {status}")
            print(json.dumps(data, indent=2))

    print("\n--- API Tests Completed ---")

if __name__ == "__main__":
    test_api()
