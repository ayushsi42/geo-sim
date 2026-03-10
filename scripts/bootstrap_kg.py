import json
import logging
from pathlib import Path
from src.knowledge_graph.kg_client import KGClient
from src.knowledge_graph.schema import NodeDescriptor, EdgeDescriptor, NodeType, EdgeType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data" / "initial_kg"

def load_json(filepath: Path):
    if filepath.exists():
        with open(filepath, "r") as f:
            return json.load(f)
    return []

def run():
    client = KGClient()
    if not client.check_connection():
        logger.error("Could not connect to Neo4j. Is docker-compose running?")
        return

    logger.info("Connected to Neo4j. Bootstrapping nodes...")

    # Bootstrapping Nodes
    for filename in ["countries.json", "alliances.json", "leaders.json"]:
        nodes = load_json(DATA_DIR / filename)
        for num, n in enumerate(nodes):
            node_desc = NodeDescriptor(
                id=n["id"],
                name=n["name"],
                type=NodeType(n["type"]),
                properties=n.get("properties", {})
            )
            client.merge_node(node_desc)
        logger.info(f"Loaded {len(nodes)} from {filename}")

    # Bootstrapping Edges
    edges = load_json(DATA_DIR / "relationships.json")
    for num, e in enumerate(edges):
        edge_desc = EdgeDescriptor(
            source_id=e["source_id"],
            target_id=e["target_id"],
            type=EdgeType(e["type"]),
            properties=e.get("properties", {})
        )
        client.merge_edge(edge_desc)
    logger.info(f"Loaded {len(edges)} from relationships.json")

    logger.info("Knowledge Graph bootstrap complete.")
    client.close()

if __name__ == "__main__":
    run()
