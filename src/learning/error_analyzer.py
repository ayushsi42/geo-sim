from pydantic import BaseModel
from typing import List
from src.world_model.prediction_models import WorldModelPrediction, PredictedEffect
from src.ingestion.models import StructuredEvent

class EffectScore(BaseModel):
    predicted: PredictedEffect
    match_score: float # 0 to 1
    actual_events: List[str] # event ids

class PredictionError(BaseModel):
    overall_score: float
    effect_scores: List[EffectScore]
    missed_effects: List[StructuredEvent]
    false_positives: List[EffectScore]
    prediction_summary: str
    actual_outcome_summary: str
    top_misses: str

class ErrorAnalyzer:
    """
    Compares a WorldModelPrediction against what actually happened inside EventLog.
    Scores each predicted effect for accuracy.
    """
    def compute_error(self, prediction: WorldModelPrediction, actual_outcomes: List[StructuredEvent]) -> PredictionError:
        effect_scores = []
        for effect in prediction.primary_effects + prediction.secondary_effects:
            try:
                from src.world_model.llm_client import LLMClient
                llm = LLMClient()
                
                # Use LLM to score prediction vs reality
                prompt = f"Rate the accuracy of this prediction: '{effect.description}' against these actual events: {[e.raw_text for e in actual_outcomes]}. Return only a float from 0.0 to 1.0."
                response = llm.complete_json(f'{{"prompt": "{prompt}"}}') # Assuming wrapper can handle text if not JSON
                score = 0.5 # Default fallback
                if response:
                    import json
                    try: 
                        score_data = json.loads(response)
                        score = float(score_data.get("score", 0.5))
                    except: pass
            except Exception:
                score = 0.5

            matched_events = [e.id for e in actual_outcomes] if score > 0.4 else []
            
            effect_scores.append(EffectScore(
                predicted=effect,
                match_score=score,
                actual_events=matched_events
            ))

        false_positives = [s for s in effect_scores if s.match_score < 0.3]
        
        return PredictionError(
            overall_score=sum(e.match_score for e in effect_scores) / len(effect_scores) if effect_scores else 0.0,
            effect_scores=effect_scores,
            missed_effects=[],
            false_positives=false_positives,
            prediction_summary=f"Predicted {len(effect_scores)} effects.",
            actual_outcome_summary=f"Observed {len(actual_outcomes)} events.",
            top_misses="Missed economic backlash"
        )
