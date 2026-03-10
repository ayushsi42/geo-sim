# Geo-Sim: Geopolitical Intelligence Platform — Complete System Design & Implementation Plan

> **Project Codename:** Geo-Sim  
> **Core Thesis:** Extend the WALL-E 2.0 neuro-symbolic world model framework from game environments (Minecraft/ALFWorld) to the global geopolitical system — producing an LLM + symbolic knowledge engine capable of causal reasoning, scenario simulation, and strategic foresight at planetary scale.

---

## Table of Contents

1. [Project Overview & Motivation](#1-project-overview--motivation)
2. [Architecture Overview](#2-architecture-overview)
3. [Module 1 — Data Ingestion & Event Feed Pipeline](#3-module-1--data-ingestion--event-feed-pipeline)
4. [Module 2 — Global State Builder](#4-module-2--global-state-builder)
5. [Module 3 — Geopolitical Knowledge Graph (GKG)](#5-module-3--geopolitical-knowledge-graph-gkg)
6. [Module 4 — Symbolic Rule Engine](#6-module-4--symbolic-rule-engine)
7. [Module 5 — LLM World Model Core](#7-module-5--llm-world-model-core)
8. [Module 6 — Neuro-Symbolic Learning Loop](#8-module-6--neuro-symbolic-learning-loop)
9. [Module 7 — Scenario Simulator (MPC Layer)](#9-module-7--scenario-simulator-mpc-layer)
10. [Module 8 — Policy Analysis & Output Interface](#10-module-8--policy-analysis--output-interface)
11. [Data Schema Definitions](#11-data-schema-definitions)
12. [Technology Stack](#12-technology-stack)
13. [Directory Structure](#13-directory-structure)
14. [Implementation Phases & Timeline](#14-implementation-phases--timeline)
15. [Evaluation Metrics](#15-evaluation-metrics)
16. [Known Hard Problems & Mitigations](#16-known-hard-problems--mitigations)
17. [Research Extensions](#17-research-extensions)

---

## 1. Project Overview & Motivation

### 1.1 What WALL-E 2.0 Proved

The WALL-E 2.0 paper demonstrated that combining an LLM with a **symbolic knowledge base** (rules + scene graph) produces a world model that:

- Outperforms pure LLM agents at long-horizon planning
- Generalizes better because rules are explicit and inspectable
- Can be updated with new symbolic rules extracted from experience

The paper's environment was Minecraft/ALFWorld. The agent's "world" was a finite set of objects with known physical rules.

### 1.2 The Geopolitical Extension

We replace:

| WALL-E 2.0 Concept | Geo-Sim Equivalent |
|---|---|
| Game world | Global political system |
| Observation text | Real-time geopolitical state snapshot |
| Actions (craft/mine) | Policy moves, diplomatic actions, sanctions |
| Scene graph | Global State Graph (countries, leaders, tensions) |
| Symbolic rules | Geopolitical causal rules (alliance logic, escalation, sanctions effects) |
| Trajectories | Historical event sequences (1900–present) |
| Neuro-symbolic learning | Rule extraction from historical prediction errors |
| MPC rollout | Multi-step scenario simulation |

### 1.3 System Goal

The finished system must be able to:

1. **Ingest** real-world geopolitical data continuously
2. **Maintain** a live Global State Graph
3. **Reason** causally about "what happens if X does Y"
4. **Learn** new symbolic rules from historical trajectory mismatches
5. **Simulate** multi-step policy futures (MPC-style rollouts)
6. **Output** structured analysis with confidence scores and rule citations

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ News Feed    │  │ Treaty/Policy│  │ Economic Indicators    │ │
│  │ APIs (RSS,   │  │ Databases    │  │ (IMF, World Bank, UN)  │ │
│  │ GDELT, etc.) │  │ (UN, NATO)   │  │                        │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬─────────────┘ │
│         └─────────────────┴──────────────────────┘              │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                  MODULE 1: EVENT INGESTION PIPELINE               │
│   EventClassifier → EntityExtractor → TensionScorer → EventLog   │
└───────────────────────────┬───────────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                  MODULE 2: GLOBAL STATE BUILDER                   │
│   StateSnapshot → DeltaComputer → StateValidator → StateStore     │
└─────────┬──────────────────────────────────────────┬─────────────┘
          ▼                                          ▼
┌──────────────────────┐              ┌──────────────────────────────┐
│  MODULE 3:           │              │  MODULE 4:                   │
│  KNOWLEDGE GRAPH     │◄────────────►│  SYMBOLIC RULE ENGINE        │
│  (Neo4j / NetworkX)  │              │  (Python rule objects)       │
│  Countries, Leaders, │              │  Military / Alliance /       │
│  Alliances, Resources│              │  Economic / Proxy rules      │
└──────────┬───────────┘              └──────────────┬───────────────┘
           └──────────────────┬───────────────────────┘
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                  MODULE 5: LLM WORLD MODEL CORE                   │
│   ContextAssembler → LLM Prompt → ResponseParser → Prediction     │
└───────────────────────────┬───────────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                  MODULE 6: NEURO-SYMBOLIC LEARNING                │
│   PredictionLog → HistoricalMatcher → ErrorAnalyzer → RuleWriter  │
└───────────────────────────┬───────────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                  MODULE 7: SCENARIO SIMULATOR                     │
│   ActionSpace → RolloutEngine → TreeExpander → PathScorer         │
└───────────────────────────┬───────────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                  MODULE 8: OUTPUT INTERFACE                       │
│   ReportGenerator → ConfidenceScorer → ExplanationLinker → API    │
└───────────────────────────────────────────────────────────────────┘
```

---

## 3. Module 1 — Data Ingestion & Event Feed Pipeline

### 3.1 Purpose

Continuously ingest raw geopolitical data from diverse sources, extract structured events, classify them, and push to the event log.

### 3.2 Data Sources

| Source | Type | Refresh Rate | Priority |
|---|---|---|---|
| GDELT Project API | News events, conflict data | 15 min | HIGH |
| ACLED (Armed Conflict Location & Event Data) | Conflict events | Daily | HIGH |
| UN Security Council resolutions | Policy decisions | As published | HIGH |
| Reuters / AP RSS feeds | News events | 5 min | HIGH |
| World Bank API | Economic indicators | Monthly | MEDIUM |
| IMF World Economic Outlook | Macro indicators | Quarterly | MEDIUM |
| SIPRI Arms Trade Database | Military transfers | Quarterly | MEDIUM |
| IAEA Statements | Nuclear activity | As published | HIGH |
| Wikileaks / declassified docs | Historical intel | Static | LOW |
| Twitter/X geopolitical hashtags | Social signals | Real-time | LOW |

### 3.3 Ingestion Components

#### 3.3.1 `EventFetcher`

```python
class EventFetcher:
    """
    Polls each data source on its schedule.
    Deduplicates events by content hash.
    Pushes raw events to EventQueue.
    """
    sources: List[DataSource]
    dedup_cache: BloomFilter          # Fast deduplication
    output_queue: Queue[RawEvent]

    def poll_source(self, source: DataSource) -> List[RawEvent]:
        # HTTP GET / API call
        # Parse JSON/XML/RSS
        # Hash content → check dedup_cache
        # Return new events only
        pass
```

#### 3.3.2 `EventClassifier`

Classify each raw event into one of these categories using the LLM + a lightweight classifier:

```
EventCategory (enum):
  MILITARY_CONFLICT
  DIPLOMATIC_ACTION
  ECONOMIC_POLICY
  ALLIANCE_CHANGE
  LEADERSHIP_CHANGE
  SANCTIONS
  TREATY_SIGNED
  TREATY_VIOLATED
  ELECTION
  NATURAL_RESOURCE
  TECHNOLOGY_TRANSFER
  NUCLEAR_ACTIVITY
  PROTEST_UNREST
  CYBER_ATTACK
  HUMANITARIAN
```

Each event gets:
- `category: EventCategory`
- `confidence: float` (0–1)
- `severity: int` (1–10)
- `timestamp: datetime`
- `source_url: str`

#### 3.3.3 `EntityExtractor`

Extract and link geopolitical entities from each event.

```python
class EntityExtractor:
    """
    NER + entity linking against the Knowledge Graph.
    Extracts: countries, leaders, organizations, resources, locations.
    Links extracted entities to KG node IDs.
    """
    def extract(self, raw_text: str) -> List[LinkedEntity]:
        # Step 1: Named Entity Recognition (spaCy + flair)
        # Step 2: Entity disambiguation (link to KG)
        # Step 3: Relation extraction (which entities interact?)
        # Step 4: Return LinkedEntity objects with KG node refs
        pass
```

#### 3.3.4 `TensionScorer`

Score the tension/stress implied by each event on relevant dyads (country-country relationships).

```python
class TensionScorer:
    """
    Given an event, compute delta tension scores for affected dyads.
    Example: Russia fires missile at Ukraine → Russia-Ukraine tension += 15
    Scores decay over time using exponential decay.
    """
    TENSION_WEIGHTS = {
        EventCategory.MILITARY_CONFLICT: +20,
        EventCategory.SANCTIONS: +10,
        EventCategory.DIPLOMATIC_ACTION: -5,  # can reduce tension
        EventCategory.TREATY_SIGNED: -15,
        EventCategory.NUCLEAR_ACTIVITY: +25,
        # ...
    }
    decay_rate: float = 0.02  # per day

    def score_event(self, event: StructuredEvent) -> List[TensionDelta]:
        pass

    def decay_all(self, current_state: GlobalState) -> GlobalState:
        pass
```

#### 3.3.5 `EventLog`

Append-only log of all structured events. This is the **ground truth trajectory store**.

```python
@dataclass
class StructuredEvent:
    id: str
    timestamp: datetime
    category: EventCategory
    severity: int
    confidence: float
    actors: List[str]           # KG node IDs
    description: str            # Natural language
    tension_deltas: List[TensionDelta]
    source_urls: List[str]
    raw_text: str
```

### 3.4 Pipeline Flow

```
Poll sources (every N minutes)
    → Dedup check
    → EventClassifier
    → EntityExtractor
    → TensionScorer
    → Append to EventLog
    → Trigger StateBuilder update
```

---

## 4. Module 2 — Global State Builder

### 4.1 Purpose

Maintain a live, structured snapshot of the global geopolitical state. This is the equivalent of the **scene graph** in the original WALL-E paper.

### 4.2 `GlobalState` Data Model

```python
@dataclass
class GlobalState:
    timestamp: datetime
    snapshot_id: str

    # Country-level state
    countries: Dict[str, CountryState]

    # Dyadic relationships
    dyads: Dict[Tuple[str, str], DyadState]

    # Active conflicts
    conflicts: List[ActiveConflict]

    # Active sanctions regimes
    sanctions: List[SanctionRegime]

    # Alliance memberships
    alliances: Dict[str, AllianceState]

    # Economic indicators
    macro: Dict[str, MacroIndicator]

    # Nuclear states status
    nuclear_status: Dict[str, NuclearStatus]

    # Tension matrix (country x country)
    tension_matrix: np.ndarray   # N×N float, indexed by country_id

    # Resource flows
    resource_flows: List[ResourceFlow]
```

```python
@dataclass
class CountryState:
    country_id: str
    name: str
    leader: str
    leader_stability: float     # 0–1
    regime_type: str            # democracy / autocracy / hybrid
    gdp: float                  # USD billions
    gdp_growth: float           # %
    military_power_index: float # composite
    nuclear_weapons: int        # warhead count (estimate)
    internal_stability: float   # 0–1
    sanction_pressure: float    # 0–1
    alliance_memberships: List[str]
    active_conflicts: List[str]
    last_updated: datetime

@dataclass
class DyadState:
    country_a: str
    country_b: str
    tension_score: float        # 0–100
    trade_volume: float         # USD billions
    trade_dependency: float     # 0–1 (how dependent A is on B)
    diplomatic_status: str      # normal / strained / hostile / war
    treaties: List[str]
    shared_alliances: List[str]
    last_incident: Optional[str]
    last_updated: datetime
```

### 4.3 `StateBuilder` Logic

```python
class StateBuilder:
    """
    Maintains the current GlobalState.
    Applies event deltas incrementally.
    Persists historical snapshots.
    """

    def apply_event(self, event: StructuredEvent, state: GlobalState) -> GlobalState:
        """
        Given a new event, compute state delta and return updated state.
        This is the 'state transition function'.
        """
        new_state = state.copy_deep()

        # Apply tension deltas
        for delta in event.tension_deltas:
            new_state.update_tension(delta)

        # Apply structural changes
        match event.category:
            case EventCategory.LEADERSHIP_CHANGE:
                new_state.countries[...].leader = ...
            case EventCategory.SANCTIONS:
                new_state.sanctions.append(...)
            case EventCategory.TREATY_SIGNED:
                new_state.alliances[...].treaties.append(...)
            # ... etc

        new_state.timestamp = event.timestamp
        return new_state

    def snapshot(self, state: GlobalState) -> str:
        """Persist snapshot to StateStore, return snapshot_id."""
        pass

    def to_natural_language(self, state: GlobalState) -> str:
        """
        Convert GlobalState → natural language summary for LLM prompt.
        This is the critical interface between symbolic state and LLM.
        """
        # E.g.:
        # "Current world state as of 2024-01-15:
        #  USA-China tensions are HIGH (score: 78/100). Trade volume: $680B.
        #  Active conflicts: Ukraine war (ongoing, day 680), Sudan civil war...
        #  Russia energy exports to Europe: 1.2M barrels/day (reduced from 3.8M)
        #  ..."
        pass
```

### 4.4 State Storage

- **Current state:** In-memory + Redis for fast access
- **Historical snapshots:** PostgreSQL with JSONB columns, indexed by timestamp
- **Tension matrix history:** TimescaleDB (time-series extension) for efficient temporal queries

---

## 5. Module 3 — Geopolitical Knowledge Graph (GKG)

### 5.1 Purpose

Encode **structural facts** about the world — entities and their durable relationships. This is the long-term memory that doesn't change with individual events.

### 5.2 Node Types

```
NodeType (enum):
  COUNTRY
  LEADER
  ALLIANCE
  INTERNATIONAL_ORG
  COMPANY (strategic)
  MILITARY_BASE
  RESOURCE_DEPOSIT
  TRADE_ROUTE
  TREATY
  IDEOLOGY
  CONFLICT_ZONE
  ETHNIC_GROUP
  RELIGION
```

### 5.3 Edge Types (Relations)

```
EdgeType (enum):
  # Political
  LEADS          (leader → country)
  MEMBER_OF      (country → alliance)
  HOSTILE_TO     (country → country)
  ALLY_OF        (country → country)
  PROXY_OF       (group → country)
  SUPPORTS       (country → group)

  # Economic
  TRADE_WITH      (country → country, weight=volume)
  EXPORTS_TO      (country → country, resource=type)
  IMPORTS_FROM    (country → country, resource=type)
  SANCTIONS       (country → country)
  DEBT_HOLDS      (country → country, amount)

  # Military
  MILITARY_PRESENCE_IN   (country → country/region)
  ARMS_SUPPLIER_OF       (country → country)
  NUCLEAR_DETERRENCE     (country → country)
  TREATY_OBLIGATION_TO   (country → country)

  # Technology
  TECH_DEPENDENT_ON      (country → company/country)
  SUPPLIES_TECH_TO       (company → country)

  # Resource
  CONTROLS_RESOURCE      (country → resource_deposit)
  TRANSIT_ROUTE_THROUGH  (resource_flow → country)
```

### 5.4 Example Graph Entries

```python
# Nodes
usa     = Node("USA",     type=COUNTRY, attrs={gdp: 25000, nuclear: 5550})
china   = Node("CHN",     type=COUNTRY, attrs={gdp: 17700, nuclear: 350})
taiwan  = Node("TWN",     type=COUNTRY, attrs={gdp: 750, nuclear: 0})
tsmc    = Node("TSMC",    type=COMPANY, attrs={sector: "semiconductors"})
nato    = Node("NATO",    type=ALLIANCE)
xi      = Node("Xi Jinping", type=LEADER)

# Edges
Edge(china, xi,     type=LEADS)
Edge(usa,   nato,   type=MEMBER_OF)
Edge(china, taiwan, type=HOSTILE_TO,          attrs={tension: 85})
Edge(taiwan, tsmc,  type=CONTROLS_RESOURCE,   attrs={resource: "advanced chips"})
Edge(usa,   taiwan, type=SUPPORTS,            attrs={arms_sales: True})
Edge(china, taiwan, type=TECH_DEPENDENT_ON,   attrs={dependency: 0.92})
```

### 5.5 Graph Database Implementation

**Primary Store:** Neo4j (Cypher query language, excellent for graph traversal)

**Example Cypher queries:**

```cypher
// Find all countries that would be affected by a Taiwan conflict
MATCH (taiwan:Country {id: "TWN"})-[r:TRADES_WITH|TECH_DEPENDENT_ON*1..2]-(affected)
RETURN affected.name, type(r), r.volume

// Find proxy chains from Iran
MATCH path = (iran:Country {id: "IRN"})-[:SUPPORTS*1..3]->(target)
RETURN path

// Find NATO trigger conditions
MATCH (attacked:Country)-[:MEMBER_OF]->(nato:Alliance {id: "NATO"})
MATCH (nato)-[:MEMBER_OF]-(members:Country)
RETURN members.name AS "obligated_responders"
```

### 5.6 KG Maintenance

The KG is updated by:

1. **Structural changes** from events (new alliance, new leader, new sanction)
2. **Manual curation** for durable facts
3. **LLM-assisted updates** where the LLM proposes graph edits and a human (or rule) validates

---

## 6. Module 4 — Symbolic Rule Engine

### 6.1 Purpose

Encode the **causal logic** of geopolitics as explicit, inspectable rules. This is the direct equivalent of the game mechanics rules in WALL-E 2.0.

### 6.2 Rule Data Model

```python
@dataclass
class GeopoliticalRule:
    id: str
    name: str
    category: RuleCategory
    description: str

    # Preconditions: must all be true for rule to fire
    preconditions: List[Condition]

    # Effects: what changes in the world state
    effects: List[Effect]

    # Probability modifier (historical reliability)
    base_probability: float   # 0–1

    # Confidence in rule (increases as it's validated)
    confidence: float         # 0–1

    # Where this rule came from
    source: str               # "hardcoded" | "learned_from_trajectory" | "expert"

    # Which historical events validate this rule
    validation_events: List[str]   # event IDs

    # Rule creation/update timestamp
    created_at: datetime
    updated_at: datetime
```

### 6.3 Rule Categories

```
RuleCategory (enum):
  NUCLEAR_DETERRENCE
  ALLIANCE_OBLIGATION
  ECONOMIC_RETALIATION
  SANCTIONS_EFFECT
  PROXY_ESCALATION
  RESOURCE_DISRUPTION
  DOMESTIC_INSTABILITY
  LEADERSHIP_RATIONALITY
  DEMOCRATIC_CONSTRAINT
  HUMANITARIAN_THRESHOLD
  INFORMATION_WARFARE
  HISTORICAL_ANALOGY
```

### 6.4 Core Rule Library (Initial Hardcoded Rules)

#### Military / Nuclear Rules

```python
NUCLEAR_DETERRENCE_RULE = GeopoliticalRule(
    id="NUC_001",
    name="Nuclear Deterrence Baseline",
    description="Direct military attack on a nuclear-armed state raises nuclear escalation probability",
    preconditions=[
        Condition("target.nuclear_weapons > 0"),
        Condition("action.type == DIRECT_MILITARY_ATTACK"),
        Condition("attacker.nuclear_weapons == 0 OR attacker.first_strike_posture == False"),
    ],
    effects=[
        Effect("escalation_probability += 0.35"),
        Effect("nuclear_use_probability += 0.08"),
    ],
    base_probability=0.95,
    confidence=0.99,
    source="hardcoded",
)

MAD_STABILITY_RULE = GeopoliticalRule(
    id="NUC_002",
    name="Mutual Assured Destruction Stability",
    description="When both sides have second-strike capability, full-scale war probability drops dramatically",
    preconditions=[
        Condition("state_a.second_strike_capable == True"),
        Condition("state_b.second_strike_capable == True"),
    ],
    effects=[
        Effect("full_war_probability *= 0.05"),
        Effect("proxy_conflict_probability += 0.30"),
    ],
    base_probability=0.90,
    confidence=0.95,
    source="hardcoded",
)
```

#### Alliance Obligation Rules

```python
NATO_ARTICLE5_RULE = GeopoliticalRule(
    id="ALL_001",
    name="NATO Article 5 Trigger",
    description="Armed attack on NATO member triggers Article 5 consultation",
    preconditions=[
        Condition("target.alliance_memberships.contains('NATO')"),
        Condition("action.type == ARMED_ATTACK"),
        Condition("attacker NOT IN NATO"),
    ],
    effects=[
        Effect("nato_consultation_triggered = True"),
        Effect("collective_defense_probability = 0.75"),
        Effect("attacker.international_isolation += 0.40"),
    ],
    base_probability=0.85,
    confidence=0.88,
    source="hardcoded",
)
```

#### Economic / Sanctions Rules

```python
SANCTIONS_RESOURCE_EXPORTER_RULE = GeopoliticalRule(
    id="ECO_001",
    name="Resource Exporter Sanctions Resilience",
    description="Countries with significant resource exports resist financial sanctions better",
    preconditions=[
        Condition("target.resource_export_gdp_ratio > 0.30"),
        Condition("action.type == FINANCIAL_SANCTIONS"),
    ],
    effects=[
        Effect("sanctions_effectiveness *= 0.55"),   # reduced effect
        Effect("target.currency_devaluation_risk += 0.15"),  # still some effect
        Effect("target.alternative_trading_partners_sought = True"),
    ],
    base_probability=0.80,
    confidence=0.85,
    source="learned_from_trajectory",  # learned from Russia 2022
    validation_events=["EVT_RUSSIA_SANCTIONS_2022"],
)

SWIFT_EXCLUSION_RULE = GeopoliticalRule(
    id="ECO_002",
    name="SWIFT Exclusion Economic Shock",
    description="Exclusion from SWIFT causes immediate financial system stress",
    preconditions=[
        Condition("action.type == SWIFT_EXCLUSION"),
        Condition("target.domestic_payment_alternative == False"),
    ],
    effects=[
        Effect("target.financial_system_stress += 0.60"),
        Effect("target.forex_reserve_burn_rate *= 3.0"),
        Effect("target.gdp_growth -= 0.04"),
    ],
    base_probability=0.88,
    confidence=0.90,
    source="hardcoded",
)
```

#### Supply Chain Rules

```python
TAIWAN_CHIP_DISRUPTION_RULE = GeopoliticalRule(
    id="SUP_001",
    name="Taiwan Semiconductor Disruption",
    description="Taiwan strait conflict disrupts global advanced semiconductor supply",
    preconditions=[
        Condition("conflict_zone.contains('Taiwan Strait')"),
        Condition("TSMC.operational_status != NORMAL"),
    ],
    effects=[
        Effect("global_chip_supply -= 0.65"),  # TSMC = ~65% of advanced chips
        Effect("consumer_electronics_price_index += 0.35"),
        Effect("cloud_infrastructure_expansion_rate -= 0.45"),
        Effect("AI_training_compute_cost *= 2.1"),
    ],
    base_probability=0.92,
    confidence=0.85,
    source="hardcoded",
)
```

#### Proxy / Escalation Rules

```python
PROXY_ESCALATION_RULE = GeopoliticalRule(
    id="PRX_001",
    name="Proxy Conflict Escalation Risk",
    description="Proxy conflicts risk direct confrontation when proxy suffers decisive losses",
    preconditions=[
        Condition("proxy.losses > proxy.replacement_rate * 1.5"),
        Condition("sponsor.direct_involvement_cost < proxy_loss_cost"),
    ],
    effects=[
        Effect("direct_confrontation_probability += 0.20"),
        Effect("sponsor.prestige_loss += 0.15"),
        Effect("escalation_ladder_position += 1"),
    ],
    base_probability=0.65,
    confidence=0.70,
    source="hardcoded",
)
```

### 6.5 Rule Evaluation Engine

```python
class RuleEngine:
    """
    Given a GlobalState + proposed Action, evaluate which rules fire
    and compute the resulting state effects.
    """
    rules: List[GeopoliticalRule]

    def evaluate(self,
                 state: GlobalState,
                 action: ProposedAction,
                 context: Dict) -> RuleEvaluationResult:

        firing_rules = []
        total_effects = []

        for rule in self.rules:
            if self._check_preconditions(rule, state, action, context):
                probability = rule.base_probability * rule.confidence
                firing_rules.append((rule, probability))

                weighted_effects = [
                    Effect(e.expression, weight=probability)
                    for e in rule.effects
                ]
                total_effects.extend(weighted_effects)

        return RuleEvaluationResult(
            firing_rules=firing_rules,
            effects=total_effects,
            confidence=self._compute_aggregate_confidence(firing_rules),
            rule_citations=[r.id for r, _ in firing_rules],
        )

    def _check_preconditions(self, rule, state, action, context) -> bool:
        """
        Evaluate all preconditions against current state + action.
        Uses a simple expression evaluator over state fields.
        """
        pass
```

---

## 7. Module 5 — LLM World Model Core

### 7.1 Purpose

Use the LLM as the **soft, fuzzy reasoning layer** that handles the long tail of geopolitical dynamics that rules can't capture — leadership psychology, historical analogies, cultural factors, ambiguous signals.

### 7.2 Context Assembly

Before each LLM call, we assemble a structured context:

```python
class ContextAssembler:
    """
    Assembles the full context for an LLM prediction call.
    Manages token budget carefully.
    """
    MAX_TOKENS = 12000  # leave room for response

    def assemble(self,
                 state: GlobalState,
                 action: ProposedAction,
                 rule_results: RuleEvaluationResult,
                 relevant_history: List[HistoricalTrajectory],
                 kg_subgraph: KGSubgraph) -> str:

        context_parts = [
            self._format_system_prompt(),
            self._format_state_summary(state),          # ~800 tokens
            self._format_action(action),                 # ~100 tokens
            self._format_rule_results(rule_results),     # ~400 tokens
            self._format_kg_context(kg_subgraph),        # ~600 tokens
            self._format_historical_analogies(relevant_history),  # ~800 tokens
            self._format_output_schema(),               # ~200 tokens
        ]

        # Trim to fit token budget
        return self._trim_to_budget(context_parts, self.MAX_TOKENS)
```

### 7.3 System Prompt

```
You are Geo-Sim, a geopolitical world model. Your task is to predict the 
consequences of a proposed action given the current world state.

You have access to:
1. A snapshot of the current global state (tensions, conflicts, economies)
2. A set of geopolitical rules that have already fired for this scenario
3. Relevant subgraph from the geopolitical knowledge graph
4. Historical analogies to similar past events

Your job is to:
1. Accept the rule-derived effects as structural constraints
2. Add nuanced, probabilistic reasoning about second and third-order effects
3. Identify factors the rules may have missed
4. Assign confidence scores to each predicted effect
5. Output your prediction in the specified JSON schema

CRITICAL: You must cite which rules you relied on, which historical analogies 
you used, and flag any predictions where your confidence is below 0.5.
```

### 7.4 Prediction Output Schema

```python
@dataclass
class WorldModelPrediction:
    action: str
    timeframe: str          # "immediate" / "3-6 months" / "1-3 years"

    primary_effects: List[PredictedEffect]
    secondary_effects: List[PredictedEffect]
    tertiary_effects: List[PredictedEffect]

    rule_citations: List[str]     # rule IDs that fired
    historical_analogies: List[str]  # event IDs used

    overall_confidence: float
    uncertainty_sources: List[str]

    # State after this action
    predicted_state_delta: Dict[str, Any]

    # Alternative scenarios
    alternative_outcomes: List[AlternativeOutcome]

@dataclass
class PredictedEffect:
    description: str
    affected_entities: List[str]   # KG node IDs
    magnitude: float               # -1 to +1
    probability: float             # 0–1
    timeframe: str
    reversibility: str             # "reversible" / "irreversible" / "path_dependent"
    confidence: float
    supporting_rules: List[str]
    supporting_analogies: List[str]
```

### 7.5 Historical Analogy Retrieval

Before each LLM call, retrieve the **most similar historical trajectories**:

```python
class AnalogRetriever:
    """
    Finds historical events most similar to the current action + state.
    Uses embedding similarity over structured event descriptions.
    """
    embedding_store: VectorDB  # Qdrant / Pinecone / Weaviate

    def retrieve(self,
                 action: ProposedAction,
                 state: GlobalState,
                 top_k: int = 5) -> List[HistoricalTrajectory]:
        query_embedding = self.embed(action, state)
        similar_events = self.embedding_store.search(query_embedding, top_k)
        return [self.fetch_trajectory(e) for e in similar_events]
```

---

## 8. Module 6 — Neuro-Symbolic Learning Loop

### 8.1 Purpose

This is the **most novel module** — it implements the neuro-symbolic learning from the original paper, adapted for geopolitics. The system **automatically extracts new symbolic rules** from cases where its predictions were wrong.

### 8.2 The Learning Loop

```
1. System makes prediction P for action A at time T
2. World unfolds → actual outcome O is observed at time T+Δ
3. Compare P vs O → compute prediction error E
4. If E > threshold → analyze the failure
5. LLM generates hypothesis for new rule that would have corrected E
6. Rule is validated against similar historical events
7. If validated → new rule added to RuleEngine
```

### 8.3 Prediction Error Computation

```python
class PredictionErrorAnalyzer:
    """
    Compares a WorldModelPrediction against what actually happened.
    Scores each predicted effect for accuracy.
    """
    def compute_error(self,
                      prediction: WorldModelPrediction,
                      actual_outcome: List[StructuredEvent]) -> PredictionError:

        effect_scores = []
        for predicted_effect in prediction.primary_effects + prediction.secondary_effects:
            match_score = self._find_matching_actual_event(
                predicted_effect, actual_outcome
            )
            effect_scores.append(EffectScore(
                predicted=predicted_effect,
                match_score=match_score,   # 0=completely wrong, 1=exactly right
                actual_events=[...]
            ))

        missed_effects = self._find_unpredicted_events(
            prediction, actual_outcome
        )

        return PredictionError(
            overall_score=np.mean([s.match_score for s in effect_scores]),
            effect_scores=effect_scores,
            missed_effects=missed_effects,
            false_positives=[s for s in effect_scores if s.match_score < 0.3],
        )
```

### 8.4 Rule Extraction from Errors

```python
class RuleExtractor:
    """
    Given a prediction error, asks the LLM to hypothesize new rules
    that would have corrected the error.
    """
    def extract_rule_hypotheses(self,
                                error: PredictionError,
                                state: GlobalState,
                                action: ProposedAction,
                                actual_outcome: List[StructuredEvent],
                                existing_rules: List[GeopoliticalRule]
                                ) -> List[RuleHypothesis]:

        prompt = f"""
        A geopolitical world model made the following prediction:
        {error.prediction_summary}

        The actual outcome was:
        {error.actual_outcome_summary}

        The largest errors were:
        {error.top_misses}

        Existing rules that fired: {existing_rules}

        What symbolic rule(s), if added to the rule engine, would have
        improved the prediction? For each rule, specify:
        1. Preconditions (what state + action conditions must hold)
        2. Effects (what the rule predicts)
        3. Confidence (how sure are you this is a general principle)
        4. Historical evidence (what other events support this rule)

        Output as JSON matching RuleHypothesis schema.
        """

        response = self.llm.complete(prompt)
        hypotheses = self._parse_hypotheses(response)
        return hypotheses
```

### 8.5 Rule Validation

Before a new rule is added to the engine, it must be validated:

```python
class RuleValidator:
    """
    Validates a rule hypothesis against historical data.
    A rule is accepted if it:
    1. Correctly predicted outcomes in >= 3 historical cases
    2. Did not produce false positives in >= 70% of cases where preconditions held
    """
    def validate(self,
                 hypothesis: RuleHypothesis,
                 event_log: EventLog,
                 state_history: StateHistory) -> ValidationResult:

        # Find all historical cases where preconditions held
        candidate_cases = self._find_precondition_matches(
            hypothesis.preconditions, state_history, event_log
        )

        if len(candidate_cases) < 3:
            return ValidationResult(accepted=False, reason="insufficient_history")

        # Check if rule effects materialized in those cases
        hit_rate = self._compute_hit_rate(
            hypothesis.effects, candidate_cases, event_log
        )

        if hit_rate >= 0.65:
            return ValidationResult(
                accepted=True,
                hit_rate=hit_rate,
                validating_cases=candidate_cases,
                confidence=hit_rate * 0.9,  # slight discount
            )
        else:
            return ValidationResult(accepted=False, reason="low_hit_rate", hit_rate=hit_rate)
```

---

## 9. Module 7 — Scenario Simulator (MPC Layer)

### 9.1 Purpose

Given a proposed action (or sequence of actions), simulate **multiple future steps** and evaluate the space of possible outcomes. This is **Model Predictive Control** adapted for geopolitics.

### 9.2 Action Space

```python
class ActionSpace:
    """
    Defines the set of possible actions any actor can take.
    Actions are parameterized by actor, type, target, and magnitude.
    """
    def enumerate_actions(self, actor: str, state: GlobalState) -> List[ProposedAction]:
        # Military actions
        military = [
            ProposedAction(actor, MOBILIZE_FORCES, target=..., scale=...),
            ProposedAction(actor, LAUNCH_STRIKE, target=..., precision=...),
            ProposedAction(actor, ESTABLISH_BLOCKADE, target=..., scope=...),
        ]
        # Diplomatic actions
        diplomatic = [
            ProposedAction(actor, ISSUE_ULTIMATUM, target=..., demands=...),
            ProposedAction(actor, PROPOSE_CEASEFIRE, target=..., terms=...),
            ProposedAction(actor, BREAK_RELATIONS, target=...),
            ProposedAction(actor, INVOKE_ALLIANCE, target=...),
        ]
        # Economic actions
        economic = [
            ProposedAction(actor, IMPOSE_TARIFFS, target=..., rate=...),
            ProposedAction(actor, EXPEL_FROM_SWIFT, target=...),
            ProposedAction(actor, EMBARGO_RESOURCES, target=..., resource=...),
        ]
        return military + diplomatic + economic
```

### 9.3 Rollout Engine

```python
class RolloutEngine:
    """
    Simulates a sequence of geopolitical steps forward in time.
    At each step:
    1. Evaluate applicable rules
    2. Call LLM world model
    3. Update state
    4. Determine next likely actions by affected actors (using LLM)
    5. Repeat for N steps
    """
    MAX_STEPS = 10
    BRANCHING_FACTOR = 3   # top-K reactions to simulate per step

    def rollout(self,
                initial_state: GlobalState,
                initial_action: ProposedAction,
                depth: int = 5) -> SimulationTree:

        root = SimulationNode(
            state=initial_state,
            action=initial_action,
            depth=0,
        )

        # Breadth-first simulation
        queue = [root]
        while queue:
            node = queue.pop(0)
            if node.depth >= depth:
                continue

            # World model predicts effects of this node's action
            prediction = self.world_model.predict(node.state, node.action)
            next_state = self.state_builder.apply_prediction(node.state, prediction)

            # LLM generates likely reactions from affected actors
            reactions = self._generate_reactions(next_state, prediction, node.action)

            # Add top-K reactions as child nodes
            for reaction in reactions[:self.BRANCHING_FACTOR]:
                child = SimulationNode(
                    state=next_state,
                    action=reaction,
                    depth=node.depth + 1,
                    parent=node,
                    edge_probability=reaction.probability,
                )
                node.children.append(child)
                queue.append(child)

        return SimulationTree(root=root)
```

### 9.4 Path Scoring

```python
class PathScorer:
    """
    Scores each leaf node (terminal state) in the simulation tree
    on multiple dimensions.
    """
    def score_path(self,
                   path: List[SimulationNode],
                   terminal_state: GlobalState,
                   scoring_actor: str = "global_stability") -> PathScore:
        return PathScore(
            path_probability=np.prod([n.edge_probability for n in path]),
            stability_score=self._score_stability(terminal_state),
            conflict_intensity=self._score_conflict_intensity(terminal_state),
            economic_damage=self._score_economic_damage(terminal_state),
            humanitarian_cost=self._score_humanitarian_cost(terminal_state),
            reversal_difficulty=self._score_reversal_difficulty(path),
        )
```

---

## 10. Module 8 — Policy Analysis & Output Interface

### 10.1 Purpose

Translate simulation results into structured, human-readable analysis with proper uncertainty quantification.

### 10.2 Report Generator

```python
class ReportGenerator:
    """
    Given a simulation tree, generate a structured policy analysis report.
    """
    def generate(self,
                 query: str,
                 action: ProposedAction,
                 tree: SimulationTree,
                 state: GlobalState) -> PolicyReport:
        return PolicyReport(
            query=query,
            timestamp=datetime.now(),

            # Executive summary (1 paragraph)
            executive_summary=self._generate_summary(tree),

            # Most likely scenario chain
            most_likely_path=self._extract_most_likely_path(tree),

            # Top 3 alternative scenarios
            alternative_scenarios=self._extract_top_alternatives(tree, n=3),

            # Risk matrix
            risk_matrix=self._build_risk_matrix(tree),

            # Key uncertainties
            key_uncertainties=self._identify_uncertainties(tree),

            # Rules that dominated the analysis
            dominant_rules=self._extract_dominant_rules(tree),

            # Historical analogies used
            analogies=self._extract_analogies(tree),

            # Confidence summary
            confidence=self._summarize_confidence(tree),

            # Raw simulation tree (for deep inspection)
            simulation_tree=tree,
        )
```

### 10.3 REST API Interface

```python
# FastAPI endpoints

POST /api/v1/simulate
    body: {
        "action": "China blockades Taiwan",
        "actor": "CHN",
        "timeframe": "6_months",
        "simulation_depth": 5
    }
    response: PolicyReport

GET /api/v1/state/current
    response: GlobalState (natural language summary + structured)

GET /api/v1/state/tension_matrix
    response: NxN tension matrix with country labels

POST /api/v1/query
    body: {
        "question": "What is the probability of Taiwan invasion in 2025?"
    }
    response: ProbabilisticAnswer

GET /api/v1/rules
    response: List[GeopoliticalRule] with metadata

POST /api/v1/rules/propose
    body: RuleHypothesis
    response: ValidationResult

GET /api/v1/knowledge_graph/subgraph
    params: entities=[...], depth=2
    response: KGSubgraph (nodes + edges)
```

---

## 11. Data Schema Definitions

### 11.1 Core Enums

```python
from enum import Enum

class EventCategory(Enum):
    MILITARY_CONFLICT = "military_conflict"
    DIPLOMATIC_ACTION = "diplomatic_action"
    ECONOMIC_POLICY = "economic_policy"
    ALLIANCE_CHANGE = "alliance_change"
    LEADERSHIP_CHANGE = "leadership_change"
    SANCTIONS = "sanctions"
    TREATY_SIGNED = "treaty_signed"
    TREATY_VIOLATED = "treaty_violated"
    ELECTION = "election"
    NUCLEAR_ACTIVITY = "nuclear_activity"
    CYBER_ATTACK = "cyber_attack"
    PROXY_CONFLICT = "proxy_conflict"
    RESOURCE_DISRUPTION = "resource_disruption"

class DiplomaticStatus(Enum):
    COOPERATIVE = "cooperative"
    NORMAL = "normal"
    STRAINED = "strained"
    HOSTILE = "hostile"
    WAR = "war"
    PROXY_WAR = "proxy_war"

class RuleCategory(Enum):
    NUCLEAR_DETERRENCE = "nuclear_deterrence"
    ALLIANCE_OBLIGATION = "alliance_obligation"
    ECONOMIC_RETALIATION = "economic_retaliation"
    SANCTIONS_EFFECT = "sanctions_effect"
    PROXY_ESCALATION = "proxy_escalation"
    RESOURCE_DISRUPTION = "resource_disruption"
    DOMESTIC_INSTABILITY = "domestic_instability"
    HISTORICAL_ANALOGY = "historical_analogy"
```

---

## 12. Technology Stack

### 12.1 Core Stack

| Component | Technology | Justification |
|---|---|---|
| LLM | GPT-4o / Claude 3.5 Sonnet / Llama 3 70B | Long context, strong reasoning |
| Knowledge Graph | Neo4j 5.x | Native graph DB, Cypher queries |
| State Store (current) | Redis | Fast in-memory access |
| State Store (history) | PostgreSQL + TimescaleDB | Time-series queries |
| Vector Store (embeddings) | Qdrant | Fast similarity search for analog retrieval |
| Event Queue | Apache Kafka | High-throughput event streaming |
| API Framework | FastAPI | Async Python, OpenAPI auto-docs |
| ML / NLP | spaCy, Flair, HuggingFace | NER, entity linking |
| Orchestration | Apache Airflow | Data pipeline scheduling |
| Monitoring | Prometheus + Grafana | System and prediction accuracy metrics |
| Deployment | Docker + Kubernetes | Containerized microservices |
| Language | Python 3.11 | Primary; TypeScript for frontend |

### 12.2 External APIs

| API | Purpose | Cost Tier |
|---|---|---|
| GDELT API | News events | Free |
| ACLED API | Conflict data | Free (academic) |
| World Bank API | Economic indicators | Free |
| OpenAI API / Anthropic API | LLM inference | Pay-per-token |
| Qdrant Cloud | Vector similarity | Managed |
| Neo4j Aura | Graph DB | Managed |

---

## 13. Directory Structure

```
geo-sim/
├── README.md
├── plan.md                         ← this file
├── docker-compose.yml
├── pyproject.toml
│
├── src/
│   ├── ingestion/                  # Module 1
│   │   ├── fetchers/
│   │   │   ├── gdelt_fetcher.py
│   │   │   ├── acled_fetcher.py
│   │   │   ├── rss_fetcher.py
│   │   │   └── worldbank_fetcher.py
│   │   ├── classifiers/
│   │   │   ├── event_classifier.py
│   │   │   └── entity_extractor.py
│   │   ├── scoring/
│   │   │   └── tension_scorer.py
│   │   └── event_log.py
│   │
│   ├── state/                      # Module 2
│   │   ├── models.py               # GlobalState, CountryState, DyadState
│   │   ├── state_builder.py
│   │   ├── state_store.py
│   │   └── state_serializer.py
│   │
│   ├── knowledge_graph/            # Module 3
│   │   ├── schema.py               # Node/Edge type definitions
│   │   ├── kg_client.py            # Neo4j client wrapper
│   │   ├── kg_builder.py           # Initial KG construction
│   │   ├── kg_updater.py           # Event-driven updates
│   │   └── kg_queries.py           # Cypher query library
│   │
│   ├── rules/                      # Module 4
│   │   ├── models.py               # GeopoliticalRule, Condition, Effect
│   │   ├── rule_engine.py
│   │   ├── rule_library/
│   │   │   ├── nuclear_rules.py
│   │   │   ├── alliance_rules.py
│   │   │   ├── economic_rules.py
│   │   │   ├── proxy_rules.py
│   │   │   └── supply_chain_rules.py
│   │   └── rule_store.py
│   │
│   ├── world_model/                # Module 5
│   │   ├── context_assembler.py
│   │   ├── llm_client.py
│   │   ├── prediction_models.py
│   │   ├── analog_retriever.py
│   │   └── world_model.py
│   │
│   ├── learning/                   # Module 6
│   │   ├── prediction_logger.py
│   │   ├── error_analyzer.py
│   │   ├── rule_extractor.py
│   │   └── rule_validator.py
│   │
│   ├── simulator/                  # Module 7
│   │   ├── action_space.py
│   │   ├── rollout_engine.py
│   │   ├── simulation_tree.py
│   │   └── path_scorer.py
│   │
│   ├── api/                        # Module 8
│   │   ├── main.py                 # FastAPI app
│   │   ├── routers/
│   │   │   ├── simulate.py
│   │   │   ├── state.py
│   │   │   ├── query.py
│   │   │   └── rules.py
│   │   ├── report_generator.py
│   │   └── schemas.py
│   │
│   └── shared/
│       ├── config.py
│       ├── logging.py
│       └── utils.py
│
├── data/
│   ├── initial_kg/                 # Bootstrap KG data (JSON)
│   │   ├── countries.json
│   │   ├── alliances.json
│   │   ├── leaders.json
│   │   └── relationships.json
│   ├── historical_events/          # Curated historical trajectory data
│   │   └── events_1990_2024.jsonl
│   └── initial_rules/              # Hardcoded rule definitions
│       └── rules_v1.json
│
├── tests/
│   ├── test_ingestion/
│   ├── test_state/
│   ├── test_rules/
│   ├── test_world_model/
│   ├── test_learning/
│   └── test_simulator/
│
├── notebooks/
│   ├── 01_kg_exploration.ipynb
│   ├── 02_rule_backtesting.ipynb
│   ├── 03_prediction_analysis.ipynb
│   └── 04_scenario_simulation.ipynb
│
├── scripts/
│   ├── bootstrap_kg.py             # Load initial KG from data/
│   ├── backfill_events.py          # Load historical events
│   ├── evaluate_rules.py           # Backtest rule accuracy
│   └── run_scenario.py             # CLI for scenario simulation
│
└── docs/
    ├── architecture.md
    ├── rule_library.md
    ├── api_reference.md
    └── evaluation_methodology.md
```

---

## 14. Implementation Phases & Timeline

### Phase 0 — Foundation (Weeks 1–2)

**Goal:** Project skeleton, infrastructure, data pipelines.

```
[ ] Set up repository structure per directory layout above
[ ] Docker Compose: Neo4j, Redis, PostgreSQL, Kafka, Qdrant
[ ] Configure CI/CD pipeline (GitHub Actions)
[ ] Write shared config + logging infrastructure
[ ] Define all Pydantic data models (GlobalState, StructuredEvent, etc.)
[ ] Set up API skeleton (FastAPI, all routes returning 501)
[ ] Write unit test harness
```

**Deliverable:** Running infrastructure with all services healthy.

---

### Phase 1 — Knowledge Graph Bootstrap (Weeks 3–4)

**Goal:** Build the initial geopolitical knowledge graph with major entities.

```
[ ] Define Node and Edge schemas (all types)
[ ] Write KG client wrapper (Neo4j Python driver)
[ ] Create bootstrap data files:
    [ ] countries.json — 195 UN member states + key attrs
    [ ] alliances.json — NATO, EU, SCO, ASEAN, AU, OPEC, etc.
    [ ] leaders.json — current heads of state
    [ ] relationships.json — ~500 key dyadic relationships
[ ] Write bootstrap_kg.py script
[ ] Run bootstrap, verify graph in Neo4j Browser
[ ] Write KG query library (subgraph extraction, path finding)
[ ] Write tests for KG queries
[ ] Write KGUpdater — applies structural event changes to graph
```

**Deliverable:** Populated KG with 195 countries, 50+ alliances/orgs, 500+ relationships. Queryable via Cypher.

---

### Phase 2 — Data Ingestion Pipeline (Weeks 5–6)

**Goal:** Automated event ingestion from live sources.

```
[ ] Implement GDELTFetcher
[ ] Implement ACLEDFetcher
[ ] Implement RSSFetcher (Reuters, AP, BBC)
[ ] Implement WorldBankFetcher (economic indicators, monthly)
[ ] Implement EventClassifier (LLM + fine-tuned classifier)
[ ] Implement EntityExtractor (spaCy NER + KG entity linking)
[ ] Implement TensionScorer
[ ] Set up Kafka topics: raw_events, structured_events, state_updates
[ ] Wire full ingestion pipeline
[ ] Set up Airflow DAGs for scheduled polling
[ ] Write EventLog append + query interface
[ ] Backfill historical events (1990–2024) from curated dataset
```

**Deliverable:** Live event ingestion running. Historical backfill complete. ~50,000+ historical events in EventLog.

---

### Phase 3 — Global State Builder (Week 7)

**Goal:** Live GlobalState maintained and updated from events.

```
[ ] Implement StateBuilder.apply_event()
[ ] Implement natural language serializer (state → text for LLM)
[ ] Implement state persistence (Redis current + PostgreSQL history)
[ ] Implement tension matrix update logic (with time decay)
[ ] Wire StateBuilder to Kafka consumer
[ ] Write state snapshot API endpoint
[ ] Backfill state history from historical events (replay EventLog)
[ ] Validate state accuracy against known historical states
```

**Deliverable:** Current GlobalState maintained live. Historical state replay working.

---

### Phase 4 — Symbolic Rule Engine (Week 8)

**Goal:** Full rule library implemented and evaluable.

```
[ ] Define GeopoliticalRule data model + Condition/Effect types
[ ] Implement Rule precondition evaluator (expression engine)
[ ] Implement RuleEvaluationResult aggregation
[ ] Implement all rule categories:
    [ ] Nuclear rules (NUC_001 through NUC_010)
    [ ] Alliance rules (ALL_001 through ALL_015)
    [ ] Economic/sanctions rules (ECO_001 through ECO_020)
    [ ] Supply chain rules (SUP_001 through SUP_010)
    [ ] Proxy/escalation rules (PRX_001 through PRX_010)
    [ ] Leadership/domestic rules (DOM_001 through DOM_010)
[ ] Backtest rules against historical data
[ ] Compute per-rule hit rates, false positive rates
[ ] Document all rules in docs/rule_library.md
[ ] Write RuleStore (persistence + versioning)
```

**Deliverable:** ~75 rules implemented, backtested, with hit rate > 65% on historical data.

---

### Phase 5 — LLM World Model Core (Weeks 9–10)

**Goal:** LLM-based prediction engine operational.

```
[ ] Implement ContextAssembler (token budget management)
[ ] Implement LLMClient (OpenAI/Anthropic API wrapper with retry)
[ ] Design and refine system prompt
[ ] Implement response parser → WorldModelPrediction
[ ] Implement AnalogRetriever (embedding store + similarity search)
[ ] Embed all historical events into Qdrant
[ ] Wire: state + rule_results + analogs → LLM → prediction
[ ] Test on 20 historical scenarios (ground truth known)
[ ] Compute prediction accuracy metrics
[ ] Tune prompt, context assembly, token budget
```

**Deliverable:** World model making predictions on historical scenarios with measurable accuracy. Baseline metrics established.

---

### Phase 6 — Neuro-Symbolic Learning (Weeks 11–12)

**Goal:** System can learn new rules from prediction errors.

```
[ ] Implement PredictionLogger (log all predictions with timestamps)
[ ] Implement PredictionErrorAnalyzer (compare predictions vs actuals)
[ ] Implement RuleExtractor (LLM generates rule hypotheses from errors)
[ ] Implement RuleValidator (backtest hypothesis against history)
[ ] Run learning loop on 50 historical error cases
[ ] Measure: how many new rules extracted? Do they improve accuracy?
[ ] Implement rule quality scoring + confidence updating
[ ] Wire learning loop into production pipeline (runs weekly)
```

**Deliverable:** Learning loop running. Evidence that auto-extracted rules improve prediction accuracy vs baseline.

---

### Phase 7 — Scenario Simulator (Week 13)

**Goal:** Multi-step scenario simulation (MPC-style rollouts).

```
[ ] Implement ActionSpace (enumerate actions per actor)
[ ] Implement RolloutEngine (multi-step tree expansion)
[ ] Implement reaction generation (LLM generates actor responses)
[ ] Implement SimulationTree data structure
[ ] Implement PathScorer (stability, conflict, economic, humanitarian)
[ ] Test: "China blockades Taiwan" — 5-step rollout
[ ] Test: "Russia uses tactical nuclear weapon" — 5-step rollout
[ ] Test: "US bans all Chinese semiconductors" — 5-step rollout
[ ] Optimize performance (parallelism, caching)
```

**Deliverable:** Simulation engine producing credible 5-step rollout trees for any proposed action.

---

### Phase 8 — API & Output Layer (Week 14)

**Goal:** Full API operational. Clean reports generated.

```
[ ] Implement all API endpoints (FastAPI)
[ ] Implement ReportGenerator
[ ] Implement confidence scoring and uncertainty quantification
[ ] Add authentication (API keys)
[ ] Add rate limiting
[ ] Write API documentation (auto-generated + manual)
[ ] Frontend: minimal React dashboard (optional)
    [ ] World tension heatmap (country x country)
    [ ] Scenario simulator input form
    [ ] Simulation tree visualization
    [ ] Rule library browser
[ ] Deploy to cloud (AWS/GCP/Azure)
[ ] Set up monitoring (Prometheus metrics + Grafana dashboards)
```

**Deliverable:** Full system deployed and accessible via API. Demonstration on 5 key scenarios.

---

### Phase 9 — Evaluation & Research Paper (Weeks 15–16)

**Goal:** Rigorous evaluation. Research paper draft.

```
[ ] Evaluation dataset: 100 historical "what happened next" cases (2010–2023)
[ ] Ablation studies:
    [ ] LLM only (no rules, no KG)
    [ ] Rules only (no LLM)
    [ ] LLM + KG (no rules)
    [ ] LLM + Rules (no KG)
    [ ] Full system (LLM + Rules + KG)
    [ ] Full system + learned rules
[ ] Compute: prediction accuracy, calibration, false positive rate
[ ] Write research paper draft:
    [ ] Introduction + motivation
    [ ] Related work (WALL-E 2.0, geopolitical AI, causal reasoning)
    [ ] System architecture
    [ ] Experiments
    [ ] Results
    [ ] Limitations + future work
[ ] Internal review + revision
```

---

## 15. Evaluation Metrics

### 15.1 Prediction Accuracy

| Metric | Description | Target |
|---|---|---|
| Primary Effect Accuracy | % of primary predicted effects that occurred | > 65% |
| Secondary Effect Accuracy | % of secondary effects that occurred | > 45% |
| Missed Event Rate | % of actual events that were not predicted | < 35% |
| False Positive Rate | % of predicted effects that did not occur | < 40% |
| Direction Accuracy | For quantitative effects, correct direction (+ / -) | > 75% |

### 15.2 Rule Performance

| Metric | Description | Target |
|---|---|---|
| Rule Hit Rate | Per rule: % of cases where rule fired and effect materialized | > 65% |
| Rule False Positive Rate | Per rule: % of firings with no actual effect | < 30% |
| Rule Coverage | % of historical events explained by at least one rule | > 70% |
| Learned Rule Quality | Hit rate of auto-extracted rules vs hardcoded rules | Within 15% |

### 15.3 System Performance

| Metric | Description | Target |
|---|---|---|
| Ingestion Latency | Time from event publication to EventLog entry | < 15 min |
| Prediction Latency | Time to produce a WorldModelPrediction | < 30 sec |
| Simulation Latency | Time for 5-step, BF=3 rollout | < 3 min |
| API Uptime | System availability | > 99.5% |

### 15.4 Calibration

Predictions come with confidence scores. Good calibration means:
- When confidence = 0.8, outcome occurs ~80% of the time
- Measured via reliability diagrams and Expected Calibration Error (ECE)
- **Target ECE < 0.10**

---

## 16. Known Hard Problems & Mitigations

### 16.1 Hidden Information

**Problem:** Much geopolitical intelligence is secret. We don't know true military readiness, secret agreements, intelligence assessments.

**Mitigation:**
- Model uncertainty explicitly — hidden info flags on state variables
- Use ranges not point estimates for sensitive quantities
- Include "hidden information discount" in confidence scoring
- Treat disclosed info as potentially misleading (strategic deception)

### 16.2 Strategic Deception

**Problem:** Countries signal false intentions. Public statements contradict private plans.

**Mitigation:**
- Track historical deception patterns per actor in KG
- Weight public signals by actor's deception history score
- Create "stated" vs "inferred" state fields in CountryState
- Rules can encode: "actor X's stated positions discount by 0.4"

### 16.3 Leader Irrationality

**Problem:** Individual leaders can behave in ways that violate structural rules (Hitler's Operation Barbarossa, Saddam's Kuwait invasion).

**Mitigation:**
- Leader-specific irrationality index in KG (based on historical behavior)
- Rule: high-irrationality leaders have elevated variance on outcomes
- "Black swan" probability term added to all predictions for irrational actors
- Larger simulation tree branching factor for irrational actors

### 16.4 Feedback Loops (Prediction → Reality)

**Problem:** If the system's predictions become public knowledge, they may be self-fulfilling or self-defeating.

**Mitigation:**
- Acknowledge this limitation explicitly in all reports
- This is a research issue inherent to any public forecasting system
- Out of scope for v1; acknowledged as future work

### 16.5 Training Data / Historical Bias

**Problem:** Historical trajectories reflect a particular era. Post-Cold War dynamics differ from pre-Cold War. AI changes everything after ~2020.

**Mitigation:**
- Weight recent trajectories more heavily (exponential time decay)
- Explicitly flag rules as "pre-AI era" vs "post-AI era"
- Allow rules to be tagged with time-validity windows

### 16.6 LLM Hallucination

**Problem:** LLM may confidently predict things with no basis in the rules or knowledge graph.

**Mitigation:**
- Require every LLM prediction to cite a supporting rule OR historical analog
- Post-processing: auto-flag predictions with no citations as "ungrounded"
- Rule engine effects are applied FIRST, LLM only adds soft effects
- Regular human review of high-confidence predictions

---

## 17. Research Extensions

### 17.1 Short-Term Extensions (6 months post-v1)

- **Multi-actor simulation:** Multiple AI-controlled actors simultaneously optimizing their own objectives
- **Probabilistic rule weights:** Full Bayesian treatment of rule probabilities
- **Economic model integration:** Couple a macro-economic model (stock/flow) with the geopolitical engine
- **Sub-national resolution:** Add civil wars, regional separatism, non-state actors at finer geographic granularity

### 17.2 Medium-Term Extensions (1–2 years)

- **Fine-tuned geopolitical LLM:** Fine-tune an open-source model on geopolitical texts + our annotated trajectory data
- **Adversarial testing:** Red team the system with adversarial scenarios to find rule gaps
- **Policy recommendation mode:** Given an actor's goals, search the action space for optimal policy sequences
- **Live calibration dashboard:** Public-facing probability estimates on key scenarios (Taiwan, Iran, etc.)

### 17.3 Long-Term Research Questions

1. **Can neuro-symbolic world models outperform expert human forecasters?** (Compare against Superforecasters, Metaculus)
2. **Do learned symbolic rules converge toward known IR theory?** (Realism, liberalism, constructivism)
3. **What is the minimum rule set for adequate geopolitical prediction?**
4. **Can the system discover novel causal relationships not in IR literature?**
5. **Is explicit symbolic grounding necessary, or can a pure LLM approach match it?** (Core ablation)

---

## Appendix A — Historical Trajectory Format

```jsonl
{
  "trajectory_id": "TRAJ_USSR_DISSOLUTION",
  "name": "Soviet Union Dissolution",
  "period": {"start": "1989-11-09", "end": "1991-12-25"},
  "events": [
    {
      "date": "1989-11-09",
      "description": "Berlin Wall falls",
      "category": "DIPLOMATIC_ACTION",
      "actors": ["DDR", "BRD", "USSR"],
      "severity": 9,
      "effects": ["German reunification process begins", "Soviet bloc cohesion weakens"]
    },
    {
      "date": "1991-08-19",
      "description": "Failed coup attempt against Gorbachev",
      "category": "LEADERSHIP_CHANGE",
      "actors": ["USSR"],
      "severity": 10,
      "effects": ["Soviet Communist Party power collapses", "Yeltsin empowered"]
    }
  ],
  "lessons": [
    "Economic stagnation + military overextension → regime collapse",
    "Failed coups often accelerate the outcomes they seek to prevent"
  ],
  "applicable_rules": ["ECO_015", "DOM_003", "ALL_008"]
}
```

---

## Appendix B — Initial Rule Count Targets

| Category | Hardcoded (v1) | Learned Target (after 6 months) |
|---|---|---|
| Nuclear Deterrence | 10 | +5 |
| Alliance Obligations | 15 | +8 |
| Economic / Sanctions | 20 | +12 |
| Supply Chain | 10 | +6 |
| Proxy / Escalation | 10 | +8 |
| Leadership / Domestic | 10 | +10 |
| **Total** | **75** | **~124** |

---

*Document Version: 1.0*
*Last Updated: Phase 0 — Foundation*
*Authors: Geo-Sim Project*