from datetime import datetime
from src.rules.models import GeopoliticalRule, RuleCategory, Condition, Effect

NUCLEAR_DETERRENCE_RULE = GeopoliticalRule(
    id="NUC_001",
    name="Nuclear Deterrence Baseline",
    category=RuleCategory.NUCLEAR_DETERRENCE,
    description="Direct military attack on a nuclear-armed state raises nuclear escalation probability",
    preconditions=[
        Condition(expression="target.nuclear_weapons > 0"),
        Condition(expression="action.type == 'DIRECT_MILITARY_ATTACK'"),
        Condition(expression="attacker.nuclear_weapons == 0 OR attacker.first_strike_posture == False"),
    ],
    effects=[
        Effect(expression="escalation_probability += 0.35"),
        Effect(expression="nuclear_use_probability += 0.08"),
    ],
    base_probability=0.95,
    confidence=0.99,
    source="hardcoded",
    validation_events=[],
    created_at=datetime.utcnow(),
    updated_at=datetime.utcnow(),
)

MAD_STABILITY_RULE = GeopoliticalRule(
    id="NUC_002",
    name="Mutual Assured Destruction Stability",
    category=RuleCategory.NUCLEAR_DETERRENCE,
    description="When both sides have second-strike capability, full-scale war probability drops",
    preconditions=[
        Condition(expression="state_a.second_strike_capable == True"),
        Condition(expression="state_b.second_strike_capable == True"),
    ],
    effects=[
        Effect(expression="full_war_probability *= 0.05"),
        Effect(expression="proxy_conflict_probability += 0.30"),
    ],
    base_probability=0.90,
    confidence=0.95,
    source="hardcoded",
    validation_events=[],
    created_at=datetime.utcnow(),
    updated_at=datetime.utcnow(),
)

NUCLEAR_RULES = [NUCLEAR_DETERRENCE_RULE, MAD_STABILITY_RULE]
