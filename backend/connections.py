from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, booking_ref: str):
        await websocket.accept()
        if booking_ref not in self.active_connections:
            self.active_connections[booking_ref] = []
        self.active_connections[booking_ref].append(websocket)

    def disconnect(self, websocket: WebSocket, booking_ref: str):
        if booking_ref not in self.active_connections:
            return
        if websocket in self.active_connections[booking_ref]:
            self.active_connections[booking_ref].remove(websocket)
        if not self.active_connections[booking_ref]:
            del self.active_connections[booking_ref]

    async def broadcast(self, message: str, booking_ref: str):
        if booking_ref not in self.active_connections:
            return
        dead: List[WebSocket] = []
        for connection in self.active_connections[booking_ref]:
            try:
                await connection.send_text(message)
            except Exception:
                dead.append(connection)
        for ws in dead:
            self.disconnect(ws, booking_ref)


manager = ConnectionManager()
