# Geo-Sim — Geopolitical Intelligence Platform

A neuro-symbolic geopolitical simulation engine that ingests live global news via RSS feeds, classifies events with GPT-4o-mini, builds a knowledge graph of country relationships, and lets you run what-if scenario simulations — all surfaced through a real-time intelligence dashboard.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| **Docker & Docker Compose** | any recent | `docker --version` |
| **OpenAI API Key** | — | needed for event classification & simulation |

That's it. Everything else runs inside Docker.

## Quick Start

### 1. Clone & enter the repo

```bash
git clone <repo-url>
cd geo-sim
```

### 2. Create `.env` file

```bash
echo "OPENAI_API_KEY=sk-...your-key-here" > .env
```

### 3. Start everything

```bash
docker-compose up -d --build
```

This builds and starts **9 containers** — the full platform:

| Container | Port | What it does |
|-----------|------|-------------|
| `geosim_frontend` | **5173** | React dashboard (nginx) |
| `geosim_backend` | **8000** | FastAPI server + API docs |
| `geosim_ingestion` | — | RSS ingestion pipeline (auto-runs) |
| `geosim_neo4j` | 7474, 7687 | Knowledge graph |
| `geosim_redis` | 6379 | State store |
| `geosim_postgres` | 5432 | Time-series data |
| `geosim_qdrant` | 6333 | Vector search |
| `geosim_kafka` | 9092 | Event bus |
| `geosim_zookeeper` | 2181 | Kafka coordination |

Wait ~60 seconds for all services to initialize, then:

- **Dashboard** → http://localhost:5173
- **API Docs** → http://localhost:8000/docs
- **Neo4j Browser** → http://localhost:7474

### 4. Bootstrap data (first time only)

After the containers are up, seed the knowledge graph and state:

```bash
docker exec geosim_backend python scripts/bootstrap_kg.py
docker exec geosim_backend python scripts/bootstrap_state.py
```

Done. The ingestion pipeline is already running and pulling live events.

---

## Local Development (without Docker for app code)

If you want to run the backend/frontend locally for development while keeping infrastructure in Docker:

```bash
# Start only infrastructure
docker-compose up -d neo4j redis postgres qdrant zookeeper kafka

# Backend
pip install -e .
uvicorn src.api.main:app --reload --port 8000

# Ingestion (separate terminal)
python scripts/run_ingestion.py

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

---

## Pages

| Page | Route | What it shows |
|------|-------|---------------|
| **Dashboard** | `/` | Live metric cards, event ticker, category breakdowns, severity distribution, threat radar |
| **Event Feed** | `/events` | Searchable/filterable event list with expandable detail cards |
| **World State** | `/world` | Country profiles, tension matrix, alliances, active conflicts |
| **Simulate** | `/simulate` | Preset & custom what-if scenarios with risk matrices and cascading path analysis |
| **Analytics** | `/analytics` | Category pie charts, severity histograms, 24h timelines, actor frequencies, confidence distributions |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/events/recent?limit=50` | Latest ingested events |
| `GET` | `/api/v1/events/stats` | Event statistics (categories, severity, actors) |
| `GET` | `/api/v1/state/current` | Current global state snapshot |
| `POST` | `/api/v1/simulate/` | Run a geopolitical simulation |

## Project Structure

```
├── Dockerfile             Backend image
├── docker-compose.yml     All 9 services
├── frontend/
│   ├── Dockerfile         Frontend image (nginx)
│   ├── nginx.conf         Reverse proxy config
│   └── src/
│       ├── pages/         Dashboard, Events, WorldState, Simulate, Analytics
│       ├── components/    Layout, Sidebar
│       └── api/           API client
├── src/
│   ├── api/               FastAPI server + routers
│   ├── ingestion/         RSS/ACLED fetchers, event classifier, tension scorer
│   ├── knowledge_graph/   Neo4j schema, queries, updater
│   ├── rules/             Symbolic rule engine + rule library
│   ├── simulator/         Rollout engine, simulation tree, action space
│   ├── state/             Global state models, builder, store
│   ├── world_model/       LLM client, analog retriever, prediction models
│   └── shared/            Config, logging
├── scripts/               Bootstrap & ingestion runners
└── data/                  Initial KG seed data
```

## Stopping Everything

```bash
docker-compose down
```

To also wipe all stored data (Neo4j, Redis, Postgres, Qdrant, Kafka):

```bash
docker-compose down -v
```
