import logging
from typing import List, Dict, Any
from src.state.models import GlobalState
from src.simulator.models import ProposedAction
from src.rules.models import RuleEvaluationResult
from src.state.state_serializer import StateSerializer

logger = logging.getLogger(__name__)

class ContextAssembler:
    """Assembles the full context for an LLM prediction call."""
    MAX_TOKENS = 12000

    def __init__(self):
        self.serializer = StateSerializer()

    def assemble(self,
                 state: GlobalState,
                 action: ProposedAction,
                 rule_results: RuleEvaluationResult,
                 relevant_history: List[Dict[str, Any]],
                 kg_subgraph: List[Dict[str, Any]]) -> str:
                 
        context_parts = [
            self._format_system_prompt(),
            self._format_state_summary(state),
            self._format_action(action),
            self._format_rule_results(rule_results),
            self._format_kg_context(kg_subgraph),
            self._format_historical_analogies(relevant_history),
            self._format_output_schema(),
        ]
        
        # In a real app we'd trim via tiktoken. Here we just join.
        return "\n\n".join(context_parts)[:self.MAX_TOKENS * 4]

    def _format_system_prompt(self) -> str:
        return """
You are Geo-Sim, a geopolitical world model. Your task is to predict the 
consequences of a proposed action given the current world state.
"""

    def _format_state_summary(self, state: GlobalState) -> str:
        return f"WORLD STATE:\n{self.serializer.to_natural_language(state)}"
        
    def _format_action(self, action: ProposedAction) -> str:
        return f"PROPOSED ACTION:\nActor: {action.actor}\nAction: {action.action_type}\nTarget: {action.target}"
        
    def _format_rule_results(self, rule_results: RuleEvaluationResult) -> str:
        return f"FIRED SYMBOLIC RULES:\nThe following rules fired: {rule_results.firing_rules}"
        
    def _format_kg_context(self, subgraph: List[Dict[str, Any]]) -> str:
        return f"KNOWLEDGE GRAPH CONTEXT (LOCAL SUBGRAPH):\n{subgraph}"
        
    def _format_historical_analogies(self, history: List[Dict[str, Any]]) -> str:
        return f"HISTORICAL ANALOGIES:\n{history}"
        
    def _format_output_schema(self) -> str:
        return """
OUTPUT INSTRUCTIONS:
Respond fully in JSON according to the WorldModelPrediction schema.
"""
