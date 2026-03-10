from datetime import datetime
from src.state.models import CountryState

def test_global_state_fixture_is_empty(empty_global_state):
    assert empty_global_state.snapshot_id == "test_snapshot_001"
    assert len(empty_global_state.countries) == 0

def test_country_state_creation():
    country = CountryState(
        country_id="USA",
        name="United States",
        leader="President",
        leader_stability=0.8,
        regime_type="democracy",
        gdp=25000.0,
        gdp_growth=2.1,
        military_power_index=1.0,
        nuclear_weapons=5550,
        internal_stability=0.7,
        sanction_pressure=0.0,
        alliance_memberships=["NATO"],
        active_conflicts=[],
        last_updated=datetime.utcnow()
    )
    assert country.country_id == "USA"
    assert "NATO" in country.alliance_memberships
