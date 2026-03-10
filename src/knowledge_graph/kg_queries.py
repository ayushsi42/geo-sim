import logging
from typing import Dict, Any, List
from src.knowledge_graph.kg_client import KGClient

logger = logging.getLogger(__name__)

class KGQueries:
    def __init__(self, client: KGClient):
        self.client = client

    def get_node_by_id(self, node_id: str) -> Dict[str, Any]:
        query = "MATCH (n {id: $id}) RETURN n"
        results = self.client.execute_query(query, {"id": node_id})
        if not results:
            return None
        return dict(results[0]["n"])

    def get_subgraph(self, center_node_ids: List[str], max_depth: int = 1) -> List[Dict[str, Any]]:
        """
        Retrieves a subgraph centered around the given node IDs up to max_depth hops.
        Useful for building the context for LLM predictions.
        """
        query = f"""
        MATCH path = (start)-[*0..{max_depth}]-(end)
        WHERE start.id IN $node_ids
        RETURN path
        """
        results = self.client.execute_query(query, {"node_ids": center_node_ids})
        paths = []
        for r in results:
            # We would typically parse this into a NetworkX graph or JSON dict
            # Simplifying for the current scope.
            paths.append(r["path"])
        return paths

    def find_allied_countries(self, country_id: str) -> List[str]:
        """Finds all countries in the same alliances as the given country."""
        query = """
        MATCH (c:COUNTRY {id: $country_id})-[:MEMBER_OF]->(a:ALLIANCE)<-[:MEMBER_OF]-(ally:COUNTRY)
        WHERE c.id <> ally.id
        RETURN DISTINCT ally.id AS ally_id
        """
        results = self.client.execute_query(query, {"country_id": country_id})
        return [r["ally_id"] for r in results]
