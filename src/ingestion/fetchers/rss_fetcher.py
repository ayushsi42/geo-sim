import feedparser
import hashlib
import logging
import requests
from datetime import datetime
from typing import List
from src.ingestion.models import RawEvent

logger = logging.getLogger(__name__)

# Geopolitics / world-news RSS feeds — no auth, no rate limits
RSS_FEEDS = {
    "BBC World": "http://feeds.bbci.co.uk/news/world/rss.xml",
    "Al Jazeera": "https://www.aljazeera.com/xml/rss/all.xml",
    "NPR World": "https://feeds.npr.org/1004/rss.xml",
    "Guardian World": "https://www.theguardian.com/world/rss",
}

# Words that signal geopolitical relevance
GEO_KEYWORDS = {
    "military", "conflict", "war", "sanctions", "nuclear", "missile",
    "treaty", "alliance", "nato", "invasion", "ceasefire", "troops",
    "escalation", "protest", "coup", "election", "diplomacy", "summit",
    "attack", "strike", "rebel", "humanitarian", "refugee", "embargo",
    "territorial", "sovereignty", "occupation", "annexation", "drone",
    "weapons", "soldier", "army", "navy", "combat", "bomb", "siege",
    "hostage", "terrorism", "militant", "militia", "insurgent",
}


class RSSFetcher:
    """Fetches geopolitical news articles from curated RSS feeds."""

    def __init__(self):
        self.feeds = RSS_FEEDS
        self._session = requests.Session()
        self._session.headers.update({
            "User-Agent": "GeoSim-Research/1.0",
        })

    def _fetch_feed(self, url: str) -> feedparser.FeedParserDict:
        """Fetch feed content via requests (uses its own CA bundle) then parse."""
        resp = self._session.get(url, timeout=15)
        resp.raise_for_status()
        return feedparser.parse(resp.content)

    def _is_geopolitical(self, text: str) -> bool:
        words = set(text.lower().split())
        return bool(words & GEO_KEYWORDS)

    def poll(self) -> List[RawEvent]:
        all_events: List[RawEvent] = []

        for feed_name, url in self.feeds.items():
            try:
                feed = self._fetch_feed(url)
                if feed.bozo and not feed.entries:
                    logger.warning(f"RSS feed {feed_name} parse issue: {feed.bozo_exception}")
                    continue

                count = 0
                for entry in feed.entries[:30]:
                    title = entry.get("title", "")
                    summary = entry.get("summary", "")
                    text = f"{title}. {summary}"

                    if not self._is_geopolitical(text):
                        continue

                    published = entry.get("published_parsed") or entry.get("updated_parsed")
                    ts = datetime(*published[:6]) if published else datetime.utcnow()

                    link = entry.get("link", "")
                    sid = hashlib.sha256(link.encode()).hexdigest()[:16]

                    all_events.append(RawEvent(
                        source_id=f"rss-{sid}",
                        feed_name=feed_name,
                        timestamp=ts,
                        raw_text=text,
                        url=link,
                        metadata={"feed": feed_name},
                    ))
                    count += 1

                logger.info(f"RSS [{feed_name}]: {count} geo-relevant articles from {len(feed.entries)} total")

            except Exception as e:
                logger.error(f"RSS feed {feed_name} error: {e}")

        logger.info(f"RSS fetcher total: {len(all_events)} geopolitical events")
        return all_events
