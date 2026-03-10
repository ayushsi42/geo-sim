from datetime import datetime
from src.rules.models import GeopoliticalRule, RuleCategory, Condition, Effect

SANCTIONS_RESOURCE_EXPORTER_RULE = GeopoliticalRule(
    id="ECO_001",
    name="Resource Exporter Sanctions Resilience",
    category=RuleCategory.SANCTIONS_EFFECT,
    description="Countries with significant resource exports resist financial sanctions better",
    preconditions=[
        Condition(expression="target.resource_export_gdp_ratio > 0.30"),
        Condition(expression="action.type == 'FINANCIAL_SANCTIONS'"),
    ],
    effects=[
        Effect(expression="sanctions_effectiveness *= 0.55"),
        Effect(expression="target.currency_devaluation_risk += 0.15"),
        Effect(expression="target.alternative_trading_partners_sought = True"),
    ],
    base_probability=0.80,
    confidence=0.85,
    source="learned_from_trajectory",
    validation_events=["EVT_RUSSIA_SANCTIONS_2022"],
    created_at=datetime.utcnow(),
    updated_at=datetime.utcnow(),
)

SWIFT_EXCLUSION_RULE = GeopoliticalRule(
    id="ECO_002",
    name="SWIFT Exclusion Economic Shock",
    category=RuleCategory.ECONOMIC_RETALIATION,
    description="Exclusion from SWIFT causes immediate financial system stress",
    preconditions=[
        Condition(expression="action.type == 'SWIFT_EXCLUSION'"),
        Condition(expression="target.domestic_payment_alternative == False"),
    ],
    effects=[
        Effect(expression="target.financial_system_stress += 0.60"),
        Effect(expression="target.forex_reserve_burn_rate *= 3.0"),
        Effect(expression="target.gdp_growth -= 0.04"),
    ],
    base_probability=0.88,
    confidence=0.90,
    source="hardcoded",
    validation_events=[],
    created_at=datetime.utcnow(),
    updated_at=datetime.utcnow(),
)

ECONOMIC_RULES = [SANCTIONS_RESOURCE_EXPORTER_RULE, SWIFT_EXCLUSION_RULE]
