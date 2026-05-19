import sys
import os
import json
import random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base
import models

# Create all tables
Base.metadata.create_all(bind=engine)

def seed_providers():
    db = SessionLocal()
    
    # Check if already seeded and clear it
    if db.query(models.Provider).count() > 0:
        print("Clearing existing providers to reseed...")
        db.query(models.Provider).delete()
        db.commit()

    cities = {
        "Islamabad": ["G-13", "F-10", "I-8", "G-9", "F-7", "F-8", "E-11", "Bahria Town", "DHA Phase 2"],
        "Karachi": ["DHA", "Gulshan", "Defence", "Clifton", "PECHS", "Nazimabad", "Korangi", "Tariq Road", "Malir"],
        "Lahore": ["DHA", "Gulberg", "Model Town", "Johar Town", "Bahria", "Wapda Town", "Iqbal Town", "Cantt"],
        "Rawalpindi": ["Saddar", "Bahria", "PWD", "Chaklala", "Westridge", "Satellite Town", "Commercial Market"]
    }
    
    services_distribution = {
        "AC Technician": 50,
        "Plumber": 50,
        "Electrician": 50,
        "Tutor": 40,
        "Beautician": 40,
        "Carpenter": 30,
        "Painter": 30,
        "Mechanic": 30,
        "Maid": 40,
        "Tailor": 20,
        "Pest Control": 15
    }
    
    names = ["Ali", "Ahmad", "Usman", "Tariq", "Imran", "Kamran", "Faisal", "Noman", "Salman", "Bilal", 
             "Farhan", "Rizwan", "Adil", "Waqas", "Yasir", "Nadeem", "Sajid", "Hamza", "Zain", "Omar",
             "Saad", "Ayesha", "Fatima", "Sana", "Mariam", "Hina", "Sadia", "Rabia", "Nida", "Kiran"]
    
    all_providers = []
    
    for service, count in services_distribution.items():
        for _ in range(count):
            city = random.choice(list(cities.keys()))
            area = random.choice(cities[city])
            name = f"{random.choice(names)} {service.split()[0]}"
            owner_name = random.choice(names)
            
            rating = round(random.uniform(3.8, 4.9), 1)
            total_reviews = random.randint(10, 150)
            on_time_score = round(random.uniform(0.7, 1.0), 2)
            cancellation_rate = round(random.uniform(0.0, 0.3), 2)
            experience_years = random.randint(2, 15)
            
            skill_rand = random.random()
            if skill_rand < 0.4:
                skill_level = "basic"
            elif skill_rand < 0.8:
                skill_level = "intermediate"
            else:
                skill_level = "complex"
                
            if service == "AC Technician":
                price_per_hour = random.randint(8, 15) * 100
            elif service == "Plumber":
                price_per_hour = random.randint(5, 12) * 100
            elif service == "Electrician":
                price_per_hour = random.randint(6, 13) * 100
            else:
                price_per_hour = random.randint(5, 15) * 100
                
            distance_km = round(random.uniform(0.5, 15.0), 1)
            available = random.random() < 0.8
            
            # Generate phone
            phone = f"03{random.randint(0, 4)}{random.randint(1000000, 9999999)}"
            
            # Slots
            available_slots = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"]
            slots = random.sample(available_slots, random.randint(3, 4))
            
            provider = models.Provider(
                name=name,
                owner_name=owner_name,
                service_type=service,
                area=area,
                city=city,
                rating=rating,
                total_reviews=total_reviews,
                on_time_score=on_time_score,
                cancellation_rate=cancellation_rate,
                experience_years=experience_years,
                skill_level=skill_level,
                price_per_hour=price_per_hour,
                distance_km=distance_km,
                available=available,
                phone=phone,
                slots=json.dumps(slots)
            )
            all_providers.append(provider)
            
    db.add_all(all_providers)
    db.commit()
    print(f"Successfully seeded {len(all_providers)} providers.")
    db.close()

if __name__ == "__main__":
    seed_providers()
