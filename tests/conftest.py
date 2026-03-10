import pytest
from datetime import datetime
from src.state.models import GlobalState

@pytest.fixture
def empty_global_state() -> GlobalState:
    return GlobalState(
        timestamp=datetime.utcnow(),
        snapshot_id="test_snapshot_001",
        countries={},
        dyads={},
        conflicts=[],
        sanctions=[],
        alliances={},
        macro={},
        nuclear_status={},
        resource_flows=[],
    )
