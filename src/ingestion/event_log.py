import json
import logging
import os
from confluent_kafka import Producer
from src.ingestion.models import StructuredEvent
from src.shared.config import settings

logger = logging.getLogger(__name__)

FALLBACK_LOG = "data/event_log_fallback.jsonl"

class EventLog:
    """
    Writes structured events to Kafka (the state pipeline queue).
    Falls back to a local JSONL file when Kafka is unavailable.
    """
    def __init__(self):
        try:
            self.producer = Producer({
                'bootstrap.servers': settings.kafka_bootstrap_servers,
                'socket.timeout.ms': 5000,
                'message.timeout.ms': 5000,
            })
            self.topic = "structured_events"
            self.connected = True
            logger.info("Kafka Producer initialized successfully.")
        except Exception as e:
            logger.warning(f"Kafka Producer failed to initialize: {e}. Using file fallback.")
            self.connected = False

        self._fallback_buffer: list[str] = []

    def delivery_report(self, err, msg):
        if err is not None:
            logger.error(f"Message delivery failed: {err}")
        else:
            logger.debug(f"Message delivered to {msg.topic()} [{msg.partition()}]")

    def append(self, event: StructuredEvent):
        payload = event.model_dump_json()

        if self.connected:
            try:
                self.producer.produce(
                    self.topic,
                    payload.encode('utf-8'),
                    callback=self.delivery_report
                )
                self.producer.poll(0)
                return
            except Exception as e:
                logger.warning(f"Kafka produce failed, falling back to file: {e}")

        # Fallback: buffer to write to disk on flush
        self._fallback_buffer.append(payload)

    def flush(self):
        if self.connected:
            try:
                self.producer.flush(timeout=5)
            except Exception as e:
                logger.warning(f"Kafka flush failed: {e}")

        if self._fallback_buffer:
            os.makedirs(os.path.dirname(FALLBACK_LOG), exist_ok=True)
            with open(FALLBACK_LOG, "a") as f:
                for line in self._fallback_buffer:
                    f.write(line + "\n")
            logger.info(f"Wrote {len(self._fallback_buffer)} events to fallback log: {FALLBACK_LOG}")
            self._fallback_buffer.clear()
