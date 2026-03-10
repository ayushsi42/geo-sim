import logging
from typing import List, Dict, Any, Optional
from neo4j import GraphDatabase, Driver, Record
from src.shared.config import settings
from src.knowledge_graph.schema import NodeDescriptor, EdgeDescriptor

logger = logging.getLogger(__name__)

class KGClient:
    def __init__(self, uri: str = None, user: str = None, password: str = None):
        uri = uri or settings.neo4j_uri
        user = user or settings.neo4j_user
        password = password or settings.neo4j_password
        self.driver: Driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def check_connection(self) -> bool:
        try:
            self.driver.verify_connectivity()
            return True
        except Exception as e:
            logger.error(f"Neo4j connection failed: {e}")
            return False

    def merge_node(self, node: NodeDescriptor):
        """Creates or updates a node based on its internal ID."""
        query = f"""
            MERGE (n:{node.type.value} {{id: $id}})
            SET n.name = $name
            SET n += $props
        """
        with self.driver.session() as session:
            session.run(query, id=node.id, name=node.name, props=node.properties)

    def merge_edge(self, edge: EdgeDescriptor):
        """Creates or updates a relationship between two existing nodes."""
        query = f"""
            MATCH (source {{id: $source_id}})
            MATCH (target {{id: $target_id}})
            MERGE (source)-[r:{edge.type.value}]->(target)
            SET r += $props
        """
        with self.driver.session() as session:
            session.run(query, source_id=edge.source_id, target_id=edge.target_id, props=edge.properties)

    def execute_query(self, query: str, parameters: Dict[str, Any] = None) -> List[Record]:
        if parameters is None:
            parameters = {}
        with self.driver.session() as session:
            result = session.run(query, **parameters)
            return list(result)
