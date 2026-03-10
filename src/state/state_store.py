import logging
import redis
import json
import psycopg2
from src.state.models import GlobalState
from src.shared.config import settings

logger = logging.getLogger(__name__)

class StateStore:
    """
    Handles persisting and retrieving GlobalState.
    Uses Redis for 'Current' state, PostgreSQL for history.
    """
    def __init__(self):
        self.redis_client = redis.from_url(settings.redis_url)
        self.pg_conn = None
        self._init_pg()

    def _init_pg(self):
        try:
            self.pg_conn = psycopg2.connect(settings.postgres_url)
            self.pg_conn.autocommit = True
            with self.pg_conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS state_snapshots (
                        id VARCHAR(255) PRIMARY KEY,
                        data JSONB,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
        except Exception as e:
            logger.error(f"Failed to connect to Postgres: {e}")

    def save_current_state(self, state: GlobalState):
        try:
            state_json = state.model_dump_json()
            self.redis_client.set("global_state:current", state_json)
        except Exception as e:
            logger.error(f"Failed to save current state to Redis: {e}")

    def load_current_state(self) -> GlobalState | None:
        try:
            data = self.redis_client.get("global_state:current")
            if data:
                return GlobalState.model_validate_json(data)
            return None
        except Exception as e:
            logger.error(f"Failed to load current state from Redis: {e}")
            return None

    def snapshot(self, state: GlobalState) -> str:
        """Persist a snapshot to Postgres."""
        snapshot_id = f"snapshot_{state.timestamp.isoformat()}"
        state.snapshot_id = snapshot_id
        
        if self.pg_conn:
            try:
                with self.pg_conn.cursor() as cur:
                    cur.execute(
                        "INSERT INTO state_snapshots (id, data) VALUES (%s, %s)",
                        (snapshot_id, state.model_dump_json())
                    )
            except Exception as e:
                logger.error(f"Postgres snapshot failed: {e}")
                
        return snapshot_id
