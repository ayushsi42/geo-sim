import time
import logging
from src.ingestion.fetchers.rss_fetcher import RSSFetcher
from src.ingestion.fetchers.acled_fetcher import ACLEDFetcher
from src.ingestion.classifiers.event_classifier import EventClassifier
from src.ingestion.classifiers.entity_extractor import EntityExtractor
from src.ingestion.scoring.tension_scorer import TensionScorer
from src.ingestion.event_log import EventLog
from src.knowledge_graph.kg_client import KGClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_ingestion_pipeline():
    # External clients
    kg_client = KGClient()
    
    # Init Pipeline Nodes
    fetchers = [RSSFetcher(), ACLEDFetcher()]
    classifier = EventClassifier()
    extractor = EntityExtractor(kg_client)
    scorer = TensionScorer()
    event_log = EventLog()
    
    logger.info("Starting ingestion pipeline cycle...")
    
    for fetcher in fetchers:
        raw_events = fetcher.poll()
        for raw in raw_events:
            structured = classifier.classify(raw)
            if not structured:
                # If LLM failed, skip
                continue
            
            structured = extractor.enrich_event(structured)
            structured = scorer.enrich_event(structured)
            
            logger.info(f"Processed event: {structured.id} - {structured.category} involving {structured.actors}")
            event_log.append(structured)

    event_log.flush()
    kg_client.close()
    logger.info("Ingestion cycle complete.")

if __name__ == "__main__":
    # In a production environment this would be scheduled by Airflow.
    run_ingestion_pipeline()
