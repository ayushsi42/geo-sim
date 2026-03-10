from pydantic import BaseModel
from typing import List
from src.state.models import GlobalState
from src.simulator.simulation_tree import SimulationNode
import numpy as np

class PathScore(BaseModel):
    path_probability: float
    stability_score: float
    conflict_intensity: float
    economic_damage: float
    humanitarian_cost: float
    reversal_difficulty: float

class PathScorer:
    """Scores terminal paths through a simulation tree to quantify macro risks."""
    
    def score_path(self, path: List[SimulationNode], terminal_state: GlobalState) -> PathScore:
        probs = [n.edge_probability for n in path]
        agg_prob = float(np.prod(probs)) if probs else 1.0
        
        return PathScore(
            path_probability=agg_prob,
            stability_score=self._score_stability(terminal_state),
            conflict_intensity=self._score_conflict_intensity(terminal_state),
            economic_damage=0.0,
            humanitarian_cost=0.0,
            reversal_difficulty=0.8
        )
        
    def _score_stability(self, state: GlobalState) -> float:
        # Example metric: inverse of high tensions
        high_tension_count = sum(1 for d in state.dyads.values() if d.tension_score > 70)
        return max(0.0, 1.0 - (high_tension_count * 0.1))

    def _score_conflict_intensity(self, state: GlobalState) -> float:
        # Example metric: average intensity of all active conflicts
        intensities = [c.intensity for c in state.conflicts]
        return float(np.mean(intensities)) if intensities else 0.0
