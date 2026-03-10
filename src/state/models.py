from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

class TensionDelta(BaseModel):
    country_a: str
    country_b: str
    delta: float

class ResourceFlow(BaseModel):
    source: str
    destination: str
    resource_type: str
    volume: float

class NuclearStatus(BaseModel):
    warhead_count: int
    second_strike_capable: bool
    first_strike_posture: bool

class MacroIndicator(BaseModel):
    country_id: str
    gdp_growth: float
    inflation: float
    unemployment: float

class AllianceState(BaseModel):
    alliance_id: str
    name: str
    members: List[str]
    treaties: List[str]

class SanctionRegime(BaseModel):
    sanction_id: str
    initiator: str
    target: str
    sanction_type: str
    severity: float

class ActiveConflict(BaseModel):
    conflict_id: str
    participants: List[str]
    intensity: float
    start_date: datetime

class CountryState(BaseModel):
    country_id: str
    name: str
    leader: str
    leader_stability: float
    regime_type: str
    gdp: float
    gdp_growth: float
    military_power_index: float
    nuclear_weapons: int
    internal_stability: float
    sanction_pressure: float
    alliance_memberships: List[str]
    active_conflicts: List[str]
    last_updated: datetime

class DyadState(BaseModel):
    country_a: str
    country_b: str
    tension_score: float
    trade_volume: float
    trade_dependency: float
    diplomatic_status: str
    treaties: List[str]
    shared_alliances: List[str]
    last_incident: Optional[str]
    last_updated: datetime

class GlobalState(BaseModel):
    timestamp: datetime
    snapshot_id: str
    countries: Dict[str, CountryState]
    # We use string keys instead of Tuple[str,str] in dict for Pydantic/JSON compat.
    dyads: Dict[str, DyadState] 
    conflicts: List[ActiveConflict]
    sanctions: List[SanctionRegime]
    alliances: Dict[str, AllianceState]
    macro: Dict[str, MacroIndicator]
    nuclear_status: Dict[str, NuclearStatus]
    # We omit numpy arrays from pure Pydantic models for JSON serialization, 
    # instead we can construct tension_matrix dynamically when needed.
    resource_flows: List[ResourceFlow]
