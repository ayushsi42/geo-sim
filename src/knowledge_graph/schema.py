from enum import Enum
from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional

class NodeType(str, Enum):
    COUNTRY = "COUNTRY"
    LEADER = "LEADER"
    ALLIANCE = "ALLIANCE"
    INTERNATIONAL_ORG = "INTERNATIONAL_ORG"
    COMPANY = "COMPANY"
    MILITARY_BASE = "MILITARY_BASE"
    RESOURCE_DEPOSIT = "RESOURCE_DEPOSIT"
    TRADE_ROUTE = "TRADE_ROUTE"
    TREATY = "TREATY"
    IDEOLOGY = "IDEOLOGY"
    CONFLICT_ZONE = "CONFLICT_ZONE"
    ETHNIC_GROUP = "ETHNIC_GROUP"
    RELIGION = "RELIGION"

class EdgeType(str, Enum):
    # Political
    LEADS = "LEADS"
    MEMBER_OF = "MEMBER_OF"
    HOSTILE_TO = "HOSTILE_TO"
    ALLY_OF = "ALLY_OF"
    PROXY_OF = "PROXY_OF"
    SUPPORTS = "SUPPORTS"

    # Economic
    TRADES_WITH = "TRADES_WITH"
    EXPORTS_TO = "EXPORTS_TO"
    IMPORTS_FROM = "IMPORTS_FROM"
    SANCTIONS = "SANCTIONS"
    DEBT_HOLDS = "DEBT_HOLDS"

    # Military
    MILITARY_PRESENCE_IN = "MILITARY_PRESENCE_IN"
    ARMS_SUPPLIER_OF = "ARMS_SUPPLIER_OF"
    NUCLEAR_DETERRENCE = "NUCLEAR_DETERRENCE"
    TREATY_OBLIGATION_TO = "TREATY_OBLIGATION_TO"

    # Technology
    TECH_DEPENDENT_ON = "TECH_DEPENDENT_ON"
    SUPPLIES_TECH_TO = "SUPPLIES_TECH_TO"

    # Resource
    CONTROLS_RESOURCE = "CONTROLS_RESOURCE"
    TRANSIT_ROUTE_THROUGH = "TRANSIT_ROUTE_THROUGH"

class NodeDescriptor(BaseModel):
    model_config = ConfigDict(extra='allow')
    
    id: str
    name: str
    type: NodeType
    properties: Dict[str, Any] = {}

class EdgeDescriptor(BaseModel):
    model_config = ConfigDict(extra='allow')

    source_id: str
    target_id: str
    type: EdgeType
    properties: Dict[str, Any] = {}
