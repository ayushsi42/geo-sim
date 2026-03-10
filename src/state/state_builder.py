import logging
from typing import Dict, Any, List
from copy import deepcopy
from datetime import datetime
from src.state.models import GlobalState, TensionDelta
from src.ingestion.models import StructuredEvent, EventCategory

logger = logging.getLogger(__name__)

class StateBuilder:
    """
    Maintains the current GlobalState by applying event deltas.
    """
    def apply_event(self, event: StructuredEvent, current_state: GlobalState) -> GlobalState:
        # Create a deep copy to ensure immutability paradigms if needed
        # Since we use pydantic, we will copy dict representation
        state_dict = current_state.model_dump()
        new_state = GlobalState(**state_dict)

        # 1. Apply tension deltas
        for delta in event.tension_deltas:
            # We use a combined key "A-B" for dyad dictionary lookups.
            # In a real app we'd sort A and B to maintain canonical keys.
            key = f"{delta.country_a}-{delta.country_b}"
            if key in new_state.dyads:
                dyad = new_state.dyads[key]
                # Bound tension between 0 and 100
                dyad.tension_score = max(0.0, min(100.0, dyad.tension_score + delta.delta))
                dyad.last_incident = event.id
                dyad.last_updated = event.timestamp
            else:
                # Optionally dynamically create dyad
                pass

        # 2. Structural state updates based on Event Category
        if event.category == EventCategory.LEADERSHIP_CHANGE:
            target_country = event.actors[0] if event.actors else None
            if target_country and target_country in new_state.countries:
                c_state = new_state.countries[target_country]
                c_state.leader_stability -= 0.2
                c_state.last_updated = event.timestamp

        elif event.category == EventCategory.SANCTIONS:
            # Assumes actors[0]=initiatior, actors[1]=target
            if len(event.actors) >= 2:
                target_country = event.actors[1]
                if target_country in new_state.countries:
                    new_state.countries[target_country].sanction_pressure += 0.1

        # More structural logic here...

        new_state.timestamp = event.timestamp
        return new_state

    def decay_all_tensions(self, current_state: GlobalState, decay_rate: float = 0.02) -> GlobalState:
        """
        Periodically reduces tension linearly for all dyads.
        """
        for key, dyad in current_state.dyads.items():
            dyad.tension_score = max(0.0, dyad.tension_score - decay_rate)
        return current_state
