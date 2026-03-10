from src.state.models import GlobalState

class StateSerializer:
    """
    Turns structured GlobalState into Natural Language specifically designed for Context Windows.
    """
    def to_natural_language(self, state: GlobalState) -> str:
        lines = []
        lines.append(f"Current world state as of {state.timestamp.isoformat()}:")
        
        for dyad_key, dyad in state.dyads.items():
            if dyad.tension_score > 60:
                lines.append(f" - {dyad.country_a}-{dyad.country_b} tensions are HIGH (score: {dyad.tension_score}/100). Status: {dyad.diplomatic_status}.")
        
        for conflict in state.conflicts:
            lines.append(f" - Active conflict: {conflict.conflict_id} involving {conflict.participants}. Intensity: {conflict.intensity}.")
            
        return "\n".join(lines)
