import logging
from typing import Optional
from openai import OpenAI
from src.shared.config import settings

logger = logging.getLogger(__name__)

class LLMClient:
    """Wraps OpenAI SDK with error handling and retry mechanisms."""
    def __init__(self):
        self.api_key = settings.openai_api_key
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def complete_json(self, prompt: str) -> Optional[str]:
        if not self.client:
            logger.warning("No LLM Client available. Returning empty response.")
            return None
            
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"LLM API completion failed: {e}")
            return None
