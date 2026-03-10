from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from src.simulator.simulation_tree import SimulationTree
from src.state.models import GlobalState
from src.simulator.models import ProposedAction

class PolicyReport(BaseModel):
    query: str
    timestamp: datetime
    executive_summary: str
    most_likely_path: List[Dict[str, Any]]
    alternative_scenarios: List[List[Dict[str, Any]]]
    risk_matrix: Dict[str, float]
    key_uncertainties: List[str]
    dominant_rules: List[str]
    analogies: List[str]
    confidence: float
    simulation_tree: SimulationTree

class SimulateRequest(BaseModel):
    action_type: str
    actor: str
    target: Optional[str] = None
    timeframe: str = "6_months"
    simulation_depth: int = 5

class ProbabilisticAnswer(BaseModel):
    question: str
    probability: float
    reasoning: str
