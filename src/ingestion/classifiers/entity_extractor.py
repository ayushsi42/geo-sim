import spacy
from typing import List
from src.ingestion.models import StructuredEvent, LinkedEntity
from src.knowledge_graph.kg_client import KGClient

class EntityExtractor:
    """
    Extracts relevant geopolitical entities from text and links them to the KG.
    """
    def __init__(self, kg_client: KGClient):
        self.kg_client = kg_client
        # We try to load a blank/small model just for structure, 
        # normally we'd dynamically download en_core_web_sm if missing.
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            import spacy.cli
            spacy.cli.download("en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")

    def extract_actors(self, text: str) -> List[str]:
        """
        Extract entities using spaCy and match with our basic KG strings.
        Returns a list of node IDs.
        """
        doc = self.nlp(text)
        found_ids = []
        
        # Extract entities and map to established node acronyms
        text_lower = text.lower()
        if "usa" in text_lower or "united states" in text_lower:
            found_ids.append("USA")
        if "china" in text_lower or "beijing" in text_lower:
            found_ids.append("CHN")
        if "taiwan" in text_lower or "taipei" in text_lower:
            found_ids.append("TWN")
        if "nato" in text_lower:
            found_ids.append("NATO")
            
        # Next step: implement dense vector retrieval against Neo4j to map fuzzy 
        # entity strings to exact Node names.
        return list(set(found_ids))

    def enrich_event(self, event: StructuredEvent) -> StructuredEvent:
        event.actors = self.extract_actors(event.raw_text)
        return event
