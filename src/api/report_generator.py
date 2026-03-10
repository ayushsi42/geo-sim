from datetime import datetime
from typing import List
from src.api.schemas import PolicyReport
from src.simulator.simulation_tree import SimulationTree, SimulationNode
from src.simulator.models import ProposedAction
from src.state.models import GlobalState

class ReportGenerator:
    """Translates simulation trees into structured, human-readable policy reports."""

    def generate(self, query: str, action: ProposedAction, tree: SimulationTree, state: GlobalState) -> PolicyReport:
        most_likely = self._extract_most_likely_path(tree)
        
        return PolicyReport(
            query=query,
            timestamp=datetime.utcnow(),
            executive_summary="Simulation implies high risk of escalation assuming target retaliation.",
            most_likely_path=most_likely,
            alternative_scenarios=[],
            risk_matrix={"escalation_risk": 0.85, "economic_fallout": 0.60},
            key_uncertainties=["Target's willingness to absorb economic pain."],
            dominant_rules=["NUC_001", "ALL_001"],
            analogies=["EVT_1991_GULF_WAR"],
            confidence=0.78,
            simulation_tree=tree
        )

    def _extract_most_likely_path(self, tree: SimulationTree) -> List[dict]:
        path = []
        node = tree.root
        while node:
            path.append({
                "depth": node.depth,
                "action": node.action.model_dump(),
                "prob": node.edge_probability
            })
            if not node.children:
                break
            # greedy select most probable child
            node = max(node.children, key=lambda c: c.edge_probability)
        return path
