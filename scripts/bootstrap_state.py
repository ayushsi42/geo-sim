import logging
from datetime import datetime
from src.state.models import GlobalState
from src.state.state_store import StateStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def bootstrap_state():
    store = StateStore()
    
    # Check if exists
    state = store.load_current_state()
    if state:
        logger.info("State already exists in Redis.")
        return

    # Create empty state
    state = GlobalState(
        timestamp=datetime.utcnow(),
        snapshot_id="snapshot_bootstrap",
        countries={},
        dyads={},
        alliances={},
        conflicts=[],
        sanctions=[],
        macro={},
        nuclear_status={},
        resource_flows=[]
    )
    
    store.save_current_state(state)
    logger.info("Empty Default GlobalState explicitly bootstrapped to Redis.")

if __name__ == "__main__":
    bootstrap_state()
