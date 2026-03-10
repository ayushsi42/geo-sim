from datetime import datetime
import requests
import logging
import time
from typing import List
from datetime import datetime
from src.ingestion.models import RawEvent

logger = logging.getLogger(__name__)

class GDELTFetcher:
    """Fetches real event articles from the GDELT 2.0 API."""
    def __init__(self):
        self.api_url = "http://api.gdeltproject.org/api/v2/doc/doc"
        self._last_call = 0.0

    def poll(self) -> List[RawEvent]:
        params = {
            "query": "escalation OR conflict OR military",
            "mode": "artlist",
            "maxrecords": 50,
            "format": "json"
        }

        headers = {
            "User-Agent": "GeoSim-Research/1.0"
        }

        # GDELT enforces 1 request per 5 seconds
        elapsed = time.time() - self._last_call
        if elapsed < 6:
            time.sleep(6 - elapsed)

        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.info(f"Polling GDELT API (attempt {attempt+1}/{max_retries})")
                self._last_call = time.time()
                response = requests.get(self.api_url, params=params, headers=headers, timeout=30)

                if response.status_code == 429 or "limit requests" in response.text.lower():
                    wait = 10 * (attempt + 1)
                    logger.warning(f"GDELT rate limited. Waiting {wait}s...")
                    time.sleep(wait)
                    continue

                response.raise_for_status()

                # GDELT sometimes returns empty or non-JSON on transient errors
                text = response.text.strip()
                if not text or not text.startswith("{"):
                    logger.warning(f"GDELT returned non-JSON response ({len(text)} bytes). Retrying...")
                    if attempt < max_retries - 1:
                        time.sleep(10 * (attempt + 1))
                        continue
                    return []

                data = response.json().get("articles", [])
                logger.info(f"GDELT returned {len(data)} articles")

                raw_events = []
                for idx, item in enumerate(data):
                    raw_events.append(RawEvent(
                        source_id=f"gdelt-{item.get('url_mobile', idx)}",
                        feed_name="GDELT",
                        timestamp=datetime.utcnow(),
                        raw_text=item.get("title", "") + ". " + item.get("seendate", ""),
                        url=item.get("url", "")
                    ))
                return raw_events
            except requests.exceptions.HTTPError as e:
                logger.error(f"GDELT HTTP error {e.response.status_code}: {e.response.text[:200]}")
                return []
            except Exception as e:
                logger.error(f"Failed to fetch GDELT data: {e}")
                if attempt < max_retries - 1:
                    time.sleep(5 * (attempt + 1))
                    continue
                return []

        logger.error("GDELT: exhausted all retries")
        return []
