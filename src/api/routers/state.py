from fastapi import APIRouter, HTTPException
from src.state.state_store import StateStore
from src.state.models import GlobalState
from src.state.state_serializer import StateSerializer
from typing import Dict, Any

router = APIRouter(prefix="/state", tags=["state"])
store = StateStore()

@router.get("/current", response_model=Dict[str, Any])
def get_current_state():
    state = store.load_current_state()
    if not state:
        raise HTTPException(status_code=404, detail="No current state found")
        
    serializer = StateSerializer()
    summary = serializer.to_natural_language(state)
    
    return {
        "summary": summary,
        "structured": state.model_dump()
    }
