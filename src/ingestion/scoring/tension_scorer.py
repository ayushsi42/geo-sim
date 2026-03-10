from typing import List
from src.ingestion.models import StructuredEvent
from src.state.models import TensionDelta

class TensionScorer:
    """
    Translates an event into tension value modifiers for participating dyads.
    """
    
    TENSION_WEIGHTS = {
        "military_conflict": 20.0,
        "sanctions": 10.0,
        "diplomatic_action": -5.0,
        "treaty_signed": -15.0,
        "nuclear_activity": 25.0,
    }

    def score_event(self, event: StructuredEvent) -> List[TensionDelta]:
        deltas = []
        base_weight = self.TENSION_WEIGHTS.get(event.category.value, 0.0)
        
        # If there are 2 actors, we assume a dyadic interaction.
        if len(event.actors) >= 2:
            a1 = event.actors[0]
            a2 = event.actors[1]
            deltas.append(TensionDelta(
                country_a=a1,
                country_b=a2,
                delta=base_weight * (event.severity / 5.0)  # normalized to some degree
            ))
            
        # Normally this would be far more sophisticated: determining who is aggressor,
        # who is target, and cross-applying with alliances.
        return deltas

    def enrich_event(self, event: StructuredEvent) -> StructuredEvent:
        event.tension_deltas = self.score_event(event)
        return event
