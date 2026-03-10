from typing import List
from src.simulator.models import ProposedAction
from src.state.models import GlobalState

class ActionSpace:
    """Defines the set of possible actions any actor can take."""
    def enumerate_actions(self, actor: str, state: GlobalState) -> List[ProposedAction]:
        military = [
            ProposedAction(actor=actor, action_type="MOBILIZE_FORCES", target="BORDER", scale=1.0),
            ProposedAction(actor=actor, action_type="LAUNCH_STRIKE", target="MILITARY_BASE", scale=0.5),
            ProposedAction(actor=actor, action_type="ESTABLISH_BLOCKADE", target="PORT", scale=0.8),
        ]
        diplomatic = [
            ProposedAction(actor=actor, action_type="ISSUE_ULTIMATUM", target="ADVERSARY"),
            ProposedAction(actor=actor, action_type="PROPOSE_CEASEFIRE", target="ADVERSARY"),
            ProposedAction(actor=actor, action_type="BREAK_RELATIONS", target="ADVERSARY"),
        ]
        economic = [
            ProposedAction(actor=actor, action_type="IMPOSE_TARIFFS", target="ADVERSARY", parameters={"rate": 0.25}),
            ProposedAction(actor=actor, action_type="EXPEL_FROM_SWIFT", target="ADVERSARY"),
            ProposedAction(actor=actor, action_type="EMBARGO_RESOURCES", target="ADVERSARY", parameters={"resource": "oil"}),
        ]
        # Real impl matches targets dynamically from KG Graph
        return military + diplomatic + economic
