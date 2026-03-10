import requests
import logging
from datetime import datetime
from typing import List, Optional
from src.ingestion.models import RawEvent
from src.shared.config import settings

logger = logging.getLogger(__name__)

class ACLEDFetcher:
    """Fetches real events from the ACLED API using OAuth token authentication."""

    TOKEN_URL = "https://acleddata.com/oauth/token"
    API_URL = "https://acleddata.com/api/acled/read"

    def __init__(self):
        self.email = settings.acled_email
        self.password = settings.acled_api_key  # myACLED account password
        self._access_token: Optional[str] = None

    def _get_token(self) -> Optional[str]:
        """Authenticate via OAuth and return a Bearer access token."""
        if not self.email or not self.password:
            logger.warning("ACLED credentials missing (ACLED_EMAIL / ACLED_API_KEY).")
            return None

        try:
            resp = requests.post(
                self.TOKEN_URL,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data={
                    "username": self.email,
                    "password": self.password,
                    "grant_type": "password",
                    "client_id": "acled",
                },
                timeout=30,
            )
            resp.raise_for_status()
            token = resp.json().get("access_token")
            if token:
                logger.info("ACLED OAuth token obtained successfully.")
            return token
        except Exception as e:
            logger.error(f"ACLED OAuth token request failed: {e}")
            return None

    def poll(self) -> List[RawEvent]:
        if not self._access_token:
            self._access_token = self._get_token()
        if not self._access_token:
            return []

        params = {
            "_format": "json",
            "limit": 50,
        }

        headers = {
            "Authorization": f"Bearer {self._access_token}",
            "Content-Type": "application/json",
        }

        try:
            logger.info(f"Polling ACLED API: {self.API_URL}")
            response = requests.get(self.API_URL, params=params, headers=headers, timeout=30)

            # Token may have expired — try refreshing once
            if response.status_code == 401:
                logger.info("ACLED token expired, refreshing...")
                self._access_token = self._get_token()
                if not self._access_token:
                    return []
                headers["Authorization"] = f"Bearer {self._access_token}"
                response = requests.get(self.API_URL, params=params, headers=headers, timeout=30)

            response.raise_for_status()
            body = response.json()
            data = body.get("data", [])
            logger.info(f"ACLED returned {len(data)} events")

            raw_events = []
            for item in data:
                raw_events.append(RawEvent(
                    source_id=f"acled-{item.get('event_id_cnty', 'unknown')}",
                    feed_name="ACLED",
                    timestamp=datetime.utcnow(),
                    raw_text=item.get("notes", ""),
                    url=item.get("source", "https://acleddata.com"),
                    metadata={
                        "event_type": item.get("event_type", ""),
                        "country": item.get("country", ""),
                        "fatalities": item.get("fatalities", 0),
                    },
                ))
            return raw_events
        except requests.exceptions.HTTPError as e:
            logger.error(f"ACLED HTTP error {e.response.status_code}: {e.response.text[:300]}")
            if e.response.status_code == 403:
                logger.error(
                    "ACLED 403 = your account lacks API access. "
                    "Visit https://acleddata.com/reactivation/api-authentication to activate it."
                )
            return []
        except Exception as e:
            logger.error(f"Failed to fetch ACLED data: {e}")
            return []
            return []
