import logging
import json
from typing import List, Optional
from pydantic import BaseModel
from src.learning.error_analyzer import PredictionError
from src.world_model.llm_client import LLMClient
from src.rules.models import RuleCategory

logger = logging.getLogger(__name__)

class RuleHypothesis(BaseModel):
    name: str
    description: str
    category: RuleCategory
    preconditions: List[dict]
    effects: List[dict]
    confidence: float

class RuleExtractor:
    """Uses LLM to generate rule hypotheses based on prediction errors."""
    def __init__(self):
        self.llm = LLMClient()

    def extract_hypotheses(self, error: PredictionError) -> List[RuleHypothesis]:
        prompt = f"""
        A geopolitical world model made a prediction that did not fully match reality.
        Prediction Summary: {error.prediction_summary}
        Actual Outcome: {error.actual_outcome_summary}
        Top Misses: {error.top_misses}
        
        What symbolic rule(s), if added to the rule engine, would have improved the prediction?
        
        Output as a JSON object containing a list called 'hypotheses' matching this structure:
        {{
            "name": "name of rule",
            "description": "...",
            "category": "economic_retaliation",
            "preconditions": [{{"expression": "..."}}],
            "effects": [{{"expression": "..."}}],
            "confidence": 0.8
        }}
        """
        response = self.llm.complete_json(prompt)
        if not response:
            return []
            
        try:
            data = json.loads(response)
            return [RuleHypothesis(**h) for h in data.get("hypotheses", [])]
        except Exception as e:
            logger.error(f"Failed to parse rule hypotheses: {e}")
            return []
