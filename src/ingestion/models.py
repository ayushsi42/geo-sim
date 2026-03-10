from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel
from src.state.models import TensionDelta

class EventCategory(str, Enum):
    MILITARY_CONFLICT = "military_conflict"
    DIPLOMATIC_ACTION = "diplomatic_action"
    ECONOMIC_POLICY = "economic_policy"
    ALLIANCE_CHANGE = "alliance_change"
    LEADERSHIP_CHANGE = "leadership_change"
    SANCTIONS = "sanctions"
    TREATY_SIGNED = "treaty_signed"
    TREATY_VIOLATED = "treaty_violated"
    ELECTION = "election"
    NATURAL_RESOURCE = "natural_resource"
    TECHNOLOGY_TRANSFER = "technology_transfer"
    NUCLEAR_ACTIVITY = "nuclear_activity"
    PROTEST_UNREST = "protest_unrest"
    CYBER_ATTACK = "cyber_attack"
    HUMANITARIAN = "humanitarian"
    PROXY_CONFLICT = "proxy_conflict"
    RESOURCE_DISRUPTION = "resource_disruption"

class RawEvent(BaseModel):
    source_id: str
    feed_name: str
    timestamp: datetime
    raw_text: str
    url: Optional[str] = None
    metadata: dict = {}

class LinkedEntity(BaseModel):
    entity_name: str
    kg_node_id: Optional[str]
    entity_type: str

class StructuredEvent(BaseModel):
    id: str
    timestamp: datetime
    category: EventCategory
    severity: int
    confidence: float
    actors: List[str]  # KG node IDs
    description: str
    tension_deltas: List[TensionDelta]
    source_urls: List[str]
    raw_text: str
