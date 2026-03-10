from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.shared.config import settings

app = FastAPI(
    title=settings.app_name,
    description="Geopolitical World Model API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.app_name}

from src.api.routers import simulate, state, events

app.include_router(simulate.router, prefix="/api/v1")
app.include_router(state.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
