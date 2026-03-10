from datetime import datetime
from enum import Enum
from typing import List
from pydantic import BaseModel

class RuleCategory(str, Enum):
    NUCLEAR_DETERRENCE = "nuclear_deterrence"
    ALLIANCE_OBLIGATION = "alliance_obligation"
    ECONOMIC_RETALIATION = "economic_retaliation"
    SANCTIONS_EFFECT = "sanctions_effect"
    PROXY_ESCALATION = "proxy_escalation"
    RESOURCE_DISRUPTION = "resource_disruption"
    DOMESTIC_INSTABILITY = "domestic_instability"
    LEADERSHIP_RATIONALITY = "leadership_rationality"
    DEMOCRATIC_CONSTRAINT = "democratic_constraint"
    HUMANITARIAN_THRESHOLD = "humanitarian_threshold"
    INFORMATION_WARFARE = "information_warfare"
    HISTORICAL_ANALOGY = "historical_analogy"

class Condition(BaseModel):
    expression: str

class Effect(BaseModel):
    expression: str
    weight: float = 1.0

class GeopoliticalRule(BaseModel):
    id: str
    name: str
    category: RuleCategory
    description: str
    preconditions: List[Condition]
    effects: List[Effect]
    base_probability: float
    confidence: float
    source: str
    validation_events: List[str]
    created_at: datetime
    updated_at: datetime

class RuleEvaluationResult(BaseModel):
    # stores citations like rule ids, and combined effects
    firing_rules: List[str]
    effects: List[Effect]
    confidence: float
    rule_citations: List[str]
