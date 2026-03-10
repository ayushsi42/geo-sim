"""Events API — serves ingested event data to the frontend."""
import json
import logging
from datetime import datetime
from typing import Any, Dict, List
from collections import Counter

from fastapi import APIRouter
from confluent_kafka import Consumer, KafkaError
from src.shared.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/events", tags=["events"])

# In-memory ring buffer of the last N events (survives across requests)
_EVENT_CACHE: List[Dict[str, Any]] = []
_MAX_CACHE = 500


def _drain_kafka():
    """Pull any new messages from Kafka into the cache (non-blocking)."""
    try:
        c = Consumer({
            "bootstrap.servers": settings.kafka_bootstrap_servers,
            "group.id": "geosim-frontend",
            "auto.offset.reset": "earliest",
            "enable.auto.commit": True,
            "session.timeout.ms": 6000,
        })
        c.subscribe(["structured_events"])
        batch = 0
        while batch < 200:
            msg = c.poll(timeout=0.5)
            if msg is None:
                break
            if msg.error():
                if msg.error().code() != KafkaError._PARTITION_EOF:
                    logger.warning(f"Kafka consumer error: {msg.error()}")
                break
            try:
                evt = json.loads(msg.value().decode())
                _EVENT_CACHE.append(evt)
                batch += 1
            except Exception:
                pass
        c.close()
        # Trim to max cache size
        if len(_EVENT_CACHE) > _MAX_CACHE:
            del _EVENT_CACHE[: len(_EVENT_CACHE) - _MAX_CACHE]
    except Exception as e:
        logger.warning(f"Kafka drain failed (non-fatal): {e}")


@router.get("/recent")
def get_recent_events(limit: int = 50):
    _drain_kafka()
    events = _EVENT_CACHE[-limit:]
    events.reverse()  # newest first
    return {"count": len(events), "events": events}


@router.get("/stats")
def get_event_stats():
    _drain_kafka()
    if not _EVENT_CACHE:
        return {
            "total": 0,
            "by_category": {},
            "by_severity": {},
            "avg_confidence": 0,
            "avg_severity": 0,
            "top_actors": [],
            "recent_24h": 0,
        }

    cats = Counter(e.get("category", "unknown") for e in _EVENT_CACHE)
    sevs = Counter(e.get("severity", 0) for e in _EVENT_CACHE)
    actors: Counter = Counter()
    for e in _EVENT_CACHE:
        for a in e.get("actors", []):
            actors[a] += 1

    confidences = [e.get("confidence", 0) for e in _EVENT_CACHE]
    severities = [e.get("severity", 0) for e in _EVENT_CACHE]

    now = datetime.utcnow()
    recent_24h = 0
    for e in _EVENT_CACHE:
        try:
            ts = datetime.fromisoformat(e["timestamp"].replace("Z", "+00:00"))
            if (now - ts.replace(tzinfo=None)).total_seconds() < 86400:
                recent_24h += 1
        except Exception:
            pass

    return {
        "total": len(_EVENT_CACHE),
        "by_category": dict(cats.most_common()),
        "by_severity": {str(k): v for k, v in sorted(sevs.items())},
        "avg_confidence": round(sum(confidences) / len(confidences), 3) if confidences else 0,
        "avg_severity": round(sum(severities) / len(severities), 1) if severities else 0,
        "top_actors": actors.most_common(10),
        "recent_24h": recent_24h,
    }
