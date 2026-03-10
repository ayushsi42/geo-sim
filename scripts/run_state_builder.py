import logging
import json
from confluent_kafka import Consumer, KafkaError, KafkaException
from src.shared.config import settings
from src.state.state_store import StateStore
from src.state.state_builder import StateBuilder
from src.ingestion.models import StructuredEvent

logger = logging.getLogger(__name__)

def consume_and_build():
    conf = {
        'bootstrap.servers': settings.kafka_bootstrap_servers,
        'group.id': "state_builder_group",
        'auto.offset.reset': 'earliest'
    }

    try:
        consumer = Consumer(conf)
        consumer.subscribe(['structured_events'])
    except Exception as e:
        logger.error(f"Kafka consumer initialization failed: {e}")
        return

    store = StateStore()
    builder = StateBuilder()

    logger.info("Starting StateBuilder consumer loop...")
    
    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None: continue
            
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    raise KafkaException(msg.error())

            # Deserialize structured event
            payload = msg.value().decode('utf-8')
            event_data = json.loads(payload)
            event = StructuredEvent(**event_data)
            
            logger.info(f"Applying event {event.id} to GlobalState")
            
            current_state = store.load_current_state()
            if not current_state:
                logger.warning("No current state found in Redis. A bootstrap may be required. Skipping event application.")
                continue

            new_state = builder.apply_event(event, current_state)
            store.save_current_state(new_state)

    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()

if __name__ == "__main__":
    consume_and_build()
