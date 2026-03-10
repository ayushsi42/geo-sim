from pydantic import BaseModel
from typing import Optional, Dict, Any

class ProposedAction(BaseModel):
    actor: str
    action_type: str
    target: Optional[str] = None
    scale: Optional[float] = None
    parameters: Dict[str, Any] = {}
