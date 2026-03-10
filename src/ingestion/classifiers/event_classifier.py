import json
import logging
from typing import Optional
from openai import OpenAI
from src.shared.config import settings
from src.ingestion.models import StructuredEvent, RawEvent, EventCategory

logger = logging.getLogger(__name__)

class EventClassifier:
    """
    Uses LLM to classify RawEvent into a StructuredEvent skeleton.
    """
    def __init__(self):
        self.api_key = settings.openai_api_key
        # For an offline or local setup, we could use a local HF pipeline instead.
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def classify(self, raw: RawEvent) -> Optional[StructuredEvent]:
        if not self.client:
            logger.warning("No LLM API key; skipping classification.")
            return None
        
        prompt = f"""
        Classify this geopolitical event text into one of our predefined categories.
        Text: '{raw.raw_text}'
        
        Categories: {[c.value for c in EventCategory]}
        
        Respond with JSON:
        {{
            "category": "...",
            "severity": 1-10,
            "confidence": 0.0-1.0,
            "description": "Short normalized description"
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
            
            return StructuredEvent(
                id=raw.source_id,
                timestamp=raw.timestamp,
                category=EventCategory(result.get("category")),
                severity=result.get("severity", 5),
                confidence=result.get("confidence", 0.5),
                actors=[],  # filled by entity extractor
                description=result.get("description", raw.raw_text),
                tension_deltas=[], # filled by tension scorer
                source_urls=[raw.url] if raw.url else [],
                raw_text=raw.raw_text
            )
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            return None
