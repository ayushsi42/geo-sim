from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from src.state.models import GlobalState
from src.simulator.models import ProposedAction

class SimulationNode(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    state: GlobalState
    action: ProposedAction
    depth: int
    edge_probability: float = 1.0
    children: List['SimulationNode'] = []
    # Using weakref or ignoring explicit parent pointers in pydantic avoids circular serialization issues.
    
class SimulationTree(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    root: SimulationNode
