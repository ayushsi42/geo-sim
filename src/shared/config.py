import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    app_name: str = "Geo-Sim API"
    debug: bool = False

    # Neo4j Settings
    neo4j_uri: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user: str = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password: str = os.getenv("NEO4J_PASSWORD", "password")

    # Redis Settings
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Postgres Settings
    postgres_url: str = os.getenv(
        "POSTGRES_URL", "postgresql://postgres:postgres@localhost:5432/geosim"
    )

    # Qdrant Settings
    qdrant_url: str = os.getenv("QDRANT_URL", "http://localhost:6333")

    # Kafka Settings
    kafka_bootstrap_servers: str = os.getenv("KAFKA_SERVERS", "127.0.0.1:9092")

    # LLM APIs
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY", None)
    anthropic_api_key: str | None = os.getenv("ANTHROPIC_API_KEY", None)

    # Ingestion APIs
    acled_api_key: str | None = os.getenv("ACLED_API_KEY", None)
    acled_email: str | None = os.getenv("ACLED_EMAIL", None)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
