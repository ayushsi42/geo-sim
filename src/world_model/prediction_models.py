from pydantic import BaseModel
from typing import List, Dict, Any

class AlternativeOutcome(BaseModel):
    description: str
    probability: float

class PredictedEffect(BaseModel):
    description: str
    affected_entities: List[str]
    magnitude: float
    probability: float
    timeframe: str
    reversibility: str
    confidence: float
    supporting_rules: List[str]
    supporting_analogies: List[str]

class WorldModelPrediction(BaseModel):
    action: str
    timeframe: str
    primary_effects: List[PredictedEffect]
    secondary_effects: List[PredictedEffect]
    tertiary_effects: List[PredictedEffect]
    rule_citations: List[str]
    historical_analogies: List[str]
    overall_confidence: float
    uncertainty_sources: List[str]
    predicted_state_delta: Dict[str, Any]
    alternative_outcomes: List[AlternativeOutcome]
