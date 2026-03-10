import logging
import uuid
from typing import List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance
from src.shared.config import settings
from src.state.models import GlobalState
from src.simulator.models import ProposedAction

logger = logging.getLogger(__name__)

class AnalogRetriever:
    """
    Finds historical events most similar to the current action + state.
    Uses Qdrant vector database.
    """
    COLLECTION_NAME = "historical_events"

    def __init__(self):
        try:
            self.client = QdrantClient(url=settings.qdrant_url)
            self._ensure_collection()
        except Exception as e:
            logger.error(f"Qdrant init failed: {e}")
            self.client = None

    def _ensure_collection(self):
        try:
            collections = self.client.get_collections().collections
            if not any(c.name == self.COLLECTION_NAME for c in collections):
                self.client.create_collection(
                    collection_name=self.COLLECTION_NAME,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
                )
        except Exception as e:
            logger.error(f"Cannot create Qdrant collection: {e}")

    def embed(self, text: str) -> List[float]:
        try:
            from src.world_model.llm_client import LLMClient
            llm = LLMClient()
            if not llm.client:
                raise ValueError("No OpenAI client available for embeddings")
                
            response = llm.client.embeddings.create(
                input=[text],
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Embedding failed: {e}")
            # Fallback for structural integrity if API fails during processing
            return [0.0] * 384

    def retrieve(self, action: ProposedAction, state: GlobalState, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.client: return []
        
        query_str = f"Action: {action.action_type} by {action.actor} against {action.target}. State Context: Tensions..."
        vector = self.embed(query_str)
        try:
            results = self.client.query_points(
                collection_name=self.COLLECTION_NAME,
                query=vector,
                limit=top_k
            ).points
            return [hit.payload for hit in results]
        except Exception as e:
            logger.warning(f"Vector search failed: {e}")
            return []

    def index_event(self, event_text: str, metadata: dict):
        if not self.client: return
        point_id = str(uuid.uuid4())
        vector = self.embed(event_text)
        self.client.upsert(
            collection_name=self.COLLECTION_NAME,
            points=[PointStruct(id=point_id, vector=vector, payload=metadata)]
        )
