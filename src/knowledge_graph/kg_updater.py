import logging
from src.knowledge_graph.kg_client import KGClient
from src.ingestion.models import StructuredEvent, EventCategory
from src.knowledge_graph.schema import EdgeType, EdgeDescriptor

logger = logging.getLogger(__name__)

class KGUpdater:
    """
    Applies structural changes to the Knowledge Graph based on Event semantics.
    """
    def __init__(self, client: KGClient):
        self.client = client

    def apply_event(self, event: StructuredEvent):
        """
        Updates the graph based on the event category.
        """
        if event.category == EventCategory.TREATY_SIGNED:
            # Simple assumption: pairs of actors sign a treaty
            if len(event.actors) >= 2:
                for a in event.actors[1:]:
                    edge = EdgeDescriptor(
                        source_id=event.actors[0],
                        target_id=a,
                        type=EdgeType.ALLY_OF,
                        properties={"event_id": event.id, "date": event.timestamp.isoformat()}
                    )
                    self.client.merge_edge(edge)
                    
        elif event.category == EventCategory.LEADERSHIP_CHANGE:
            logger.info(f"Leadership change for {event.actors} implies node updates.")
            # Typically requires modifying a node property or removing/adding LEADS edges.

        # Add more event category handlers as the platform evolves.
