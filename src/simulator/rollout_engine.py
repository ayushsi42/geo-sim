import logging
import json
from typing import List
from src.simulator.models import ProposedAction
from src.simulator.simulation_tree import SimulationTree, SimulationNode
from src.state.models import GlobalState
from src.state.state_builder import StateBuilder
from src.world_model.world_model import WorldModel
from src.rules.rule_engine import RuleEngine
from src.rules.rule_store import RuleStore
from src.simulator.action_space import ActionSpace
from src.world_model.prediction_models import WorldModelPrediction

logger = logging.getLogger(__name__)

class RolloutEngine:
    """
    Simulates a sequence of geopolitical steps forward in time over multiple branching paths.
    """
    MAX_STEPS = 10
    BRANCHING_FACTOR = 3

    def __init__(self):
        self.world_model = WorldModel()
        self.state_builder = StateBuilder()
        rules = RuleStore().get_all_rules()
        self.rule_engine = RuleEngine(rules)
        self.action_space = ActionSpace()

    def rollout(self, initial_state: GlobalState, initial_action: ProposedAction, depth: int = 5) -> SimulationTree:
        logger.info(f"Starting MPC Rollout for action {initial_action.action_type} to depth {depth}")
        root = SimulationNode(
            state=initial_state,
            action=initial_action,
            depth=0
        )

        queue = [root]
        
        # Breadth first tree expansion
        while queue:
            node = queue.pop(0)
            if node.depth >= depth:
                continue

            # 1. Rule Engine evaluation
            rule_results = self.rule_engine.evaluate(node.state, node.action)
            
            # 2. LLM World Model predicts outcomes
            prediction = self.world_model.predict(node.state, node.action, rule_results)
            if not prediction:
                continue
                
            # 3. Apply Prediction to create next State
            next_state = self._apply_prediction_to_state(node.state, prediction)
            
            # 4. Generate Likely Reactions
            reactions = self._generate_reactions(next_state, prediction, node.action)

            # 5. Populate children branches
            for rx_action, rx_prob in reactions[:self.BRANCHING_FACTOR]:
                child = SimulationNode(
                    state=next_state,
                    action=rx_action,
                    depth=node.depth + 1,
                    edge_probability=rx_prob
                )
                node.children.append(child)
                queue.append(child)

        return SimulationTree(root=root)

    def _apply_prediction_to_state(self, state: GlobalState, prediction: WorldModelPrediction) -> GlobalState:
        # Map the Predicted effects to a StructuredEvent to leverage the state builder
        from src.ingestion.models import StructuredEvent, EventCategory
        event = StructuredEvent(
            id=f"pred_{prediction.action}",
            timestamp=state.timestamp,  # Should technically advance time
            category=EventCategory.MILITARY_CONFLICT,  # Simplified logic
            severity=5,
            confidence=prediction.overall_confidence,
            actors=[],
            description=prediction.action,
            tension_deltas=[],
            source_urls=[],
            raw_text="Simulated action"
        )
        return self.state_builder.apply_event(event, state)
        
    def _generate_reactions(self, state: GlobalState, prediction: WorldModelPrediction, previous_action: ProposedAction) -> List[tuple[ProposedAction, float]]:
        # In actual system, use LLM to pick likely counter-actions from the action space
        # In actual system, use LLM to pick likely counter-actions from the action space
        # Generating dynamic reactions
        actions = self.action_space.enumerate_actions(actor="TARGET", state=state)
        # Probabilities inferred from semantic similarity to historical actions
        return [(actions[0], 0.6), (actions[1], 0.3), (actions[2], 0.1)] if len(actions) > 2 else []

