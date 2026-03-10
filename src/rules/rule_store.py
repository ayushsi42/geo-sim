import json
import logging
from typing import List, Optional
from pathlib import Path
from src.rules.models import GeopoliticalRule
from src.rules.rule_library.nuclear_rules import NUCLEAR_RULES
from src.rules.rule_library.economic_rules import ECONOMIC_RULES

logger = logging.getLogger(__name__)

class RuleStore:
    """
    Manages loading, saving, and querying Geopolitical Rules.
    Rules may be hardcoded or written to JSON by the learning module.
    """
    def __init__(self, directory: Path = None):
        if not directory:
            directory = Path(__file__).parent.parent.parent / "data" / "initial_rules"
        self.directory = directory
        if not self.directory.exists():
            self.directory.mkdir(parents=True, exist_ok=True)
            
        self.rules: List[GeopoliticalRule] = []
        self._load_hardcoded()

    def _load_hardcoded(self):
        """Loads rules defined in code constants."""
        self.rules.extend(NUCLEAR_RULES)
        self.rules.extend(ECONOMIC_RULES)
        logger.info(f"Loaded {len(self.rules)} hardcoded rules.")

    def get_all_rules(self) -> List[GeopoliticalRule]:
        return self.rules

    def get_rule(self, rule_id: str) -> Optional[GeopoliticalRule]:
        for rule in self.rules:
            if rule.id == rule_id:
                return rule
        return None

    def add_rule(self, rule: GeopoliticalRule):
        """Adds a rule, typically learned from the loop, to the store."""
        for i, existing in enumerate(self.rules):
            if existing.id == rule.id:
                self.rules[i] = rule
                self.save_rule(rule)
                return
                
        self.rules.append(rule)
        self.save_rule(rule)

    def save_rule(self, rule: GeopoliticalRule):
        filepath = self.directory / f"{rule.id}.json"
        with open(filepath, "w") as f:
            f.write(rule.model_dump_json(indent=2))
        logger.info(f"Saved rule {rule.id} to disk.")
