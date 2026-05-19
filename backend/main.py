from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import json

import models
from database import engine, get_db, Base
from routers import providers, bookings, disputes, traces, pricing, agents, auth, chat
from connections import manager
from chat_service import save_message, message_json

# Ensure tables are created
Base.metadata.create_all(bind=engine)

# Auto-seed if empty on startup
db = next(get_db())
try:
    if db.query(models.Provider).count() == 0:
        print("Database is empty, auto-seeding mock Pakistani providers...")
        from data.seed_providers import seed_providers
        seed_providers()
finally:
    db.close()

app = FastAPI(title="Khidmat AI Backend")

# Allow CORS for mobile app and frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(providers.router, prefix="/providers", tags=["providers"])
app.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
app.include_router(disputes.router, prefix="/disputes", tags=["disputes"])
app.include_router(traces.router, prefix="/traces", tags=["traces"])
app.include_router(pricing.router, prefix="/pricing", tags=["pricing"])
app.include_router(agents.router, prefix="/agents", tags=["agents"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])


@app.websocket("/ws/chat/{booking_ref}")
async def websocket_endpoint(websocket: WebSocket, booking_ref: str):
    await manager.connect(websocket, booking_ref)
    db = next(get_db())
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
                sender_name = data.get("sender_name", "Guest")
                text = data.get("text", "")
            except json.JSONDecodeError:
                sender_name = "Guest"
                text = raw

            try:
                msg = save_message(db, booking_ref, sender_name, text)
                payload = message_json(msg)
                await manager.broadcast(payload, booking_ref)
            except ValueError:
                continue
            except LookupError:
                await websocket.close(code=4004)
                break
    except WebSocketDisconnect:
        manager.disconnect(websocket, booking_ref)
    finally:
        db.close()


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        providers_count = db.query(models.Provider).count()
        bookings_count = db.query(models.Booking).count()
        return {
            "status": "ok",
            "db": "connected",
            "providers_count": providers_count,
            "bookings_count": bookings_count
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_providers = db.query(models.Provider).count()
    available_now = db.query(models.Provider).filter(models.Provider.available == True).count()
    cities_count = db.query(models.Provider.city).distinct().count()
    
    # Calculate average rating
    from sqlalchemy.sql import func
    avg_rating = db.query(func.avg(models.Provider.rating)).scalar() or 0.0
    
    # Bookings today
    today = datetime.utcnow().date()
    bookings_today = db.query(models.Booking).filter(
        func.date(models.Booking.created_at) == today
    ).count()
    
    return {
        "total_providers": total_providers,
        "available_now": available_now,
        "cities": cities_count,
        "avg_rating": round(avg_rating, 1),
        "bookings_today": bookings_today
    }

@app.get("/demo/reset")
def reset_demo(db: Session = Depends(get_db)):
    # Clear bookings, disputes, traces, and chat. Keep providers intact.
    db.query(models.ChatMessage).delete()
    db.query(models.AgentTrace).delete()
    db.query(models.Dispute).delete()
    db.query(models.Booking).delete()
    db.commit()
    
    return {"cleared": True, "providers_intact": True}
