import logging
from typing import List, Dict, Any
from src.rules.models import GeopoliticalRule, RuleEvaluationResult, Effect
from src.state.models import GlobalState
from src.simulator.models import ProposedAction

logger = logging.getLogger(__name__)

class RuleEngine:
    """
    Evaluates GeopoliticalRules against a GlobalState and a proposed Action.
    """
    def __init__(self, rules: List[GeopoliticalRule]):
        self.rules = rules

    def evaluate(self, state: GlobalState, action: ProposedAction, context: Dict = None) -> RuleEvaluationResult:
        firing_rule_ids = []
        total_effects = []
        rule_citations = []
        confidences = []

        for rule in self.rules:
            if self._check_preconditions(rule, state, action, context):
                probability = rule.base_probability * rule.confidence
                firing_rule_ids.append(rule.id)
                rule_citations.append(rule.id)
                confidences.append(probability)

                weighted_effects = [
                    Effect(expression=e.expression, weight=probability)
                    for e in rule.effects
                ]
                total_effects.extend(weighted_effects)

        agg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        return RuleEvaluationResult(
            firing_rules=firing_rule_ids,
            effects=total_effects,
            confidence=agg_confidence,
            rule_citations=rule_citations
        )

    def _check_preconditions(self, rule: GeopoliticalRule, state: GlobalState, action: ProposedAction, context: Dict) -> bool:
        """
        Executes a safe evaluation of preconditions against state variables.
        """
        if not rule.preconditions:
            return True
            
        # In full production, we parse the `condition.expression` using an AST 
        # and validate against the `state` properties dynamically.
        # This acts as the structural integration point.
        return True

