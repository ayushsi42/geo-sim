import logging
import json
from typing import Optional
from src.state.models import GlobalState
from src.simulator.models import ProposedAction
from src.rules.models import RuleEvaluationResult
from src.knowledge_graph.kg_queries import KGQueries
from src.knowledge_graph.kg_client import KGClient
from src.world_model.prediction_models import WorldModelPrediction
from src.world_model.context_assembler import ContextAssembler
from src.world_model.llm_client import LLMClient
from src.world_model.analog_retriever import AnalogRetriever

logger = logging.getLogger(__name__)

class WorldModel:
    """
    The orchestrator module that queries the LLM with structured symbolic constraints
    to output a multi-faceted prediction.
    """
    def __init__(self):
        self.kg_client = KGClient()
        self.kg_queries = KGQueries(self.kg_client)
        self.retriever = AnalogRetriever()
        self.assembler = ContextAssembler()
        self.llm = LLMClient()

    def predict(self, state: GlobalState, action: ProposedAction, rule_results: RuleEvaluationResult) -> Optional[WorldModelPrediction]:
        # 1. Retrieve Historical Analogies
        analogs = self.retriever.retrieve(action, state, top_k=3)

        # 2. Retrieve Local Graph Context (nodes matching the actors)
        center_nodes = [action.actor]
        if action.target:
            center_nodes.append(action.target)
        subgraph = self.kg_queries.get_subgraph(center_nodes, max_depth=1)

        # 3. Assemble Prompt
        prompt = self.assembler.assemble(
            state=state,
            action=action,
            rule_results=rule_results,
            relevant_history=analogs,
            kg_subgraph=subgraph
        )

        # 4. Infer
        logger.info(f"Dispatching query to LLM for actor {action.actor} doing {action.action_type}")
        json_output = self.llm.complete_json(prompt)
        
        if not json_output:
            logger.error("LLM evaluation returned empty.")
            return None
            
        try:
            res_dict = json.loads(json_output)
            return WorldModelPrediction(**res_dict)
        except Exception as e:
            logger.error(f"Failed to parse LLM Response to Prediction model: {e}")
            return None
