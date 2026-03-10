# Geo-Sim — Geopolitical Intelligence Platform

A neuro-symbolic geopolitical simulation engine that ingests live global news via RSS feeds, classifies events with GPT-4o-mini, builds a knowledge graph of country relationships, and lets you run what-if scenario simulations — all surfaced through a real-time intelligence dashboard.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| **Docker & Docker Compose** | any recent | `docker --version` |
| **Node.js** | ≥ 20 | `node -v` |
| **npm** | ≥ 9 | `npm -v` |
| **OpenAI API Key** | — | needed for event classification & simulation |

## Quick Start

### 1. Clone & enter the repo

```bash
git clone <repo-url>
cd geo-sim
```

### 2. Start infrastructure (Docker)

This boots Neo4j, Redis, TimescaleDB, Qdrant, Kafka + Zookeeper — all pre-configured.

```bash
docker-compose up -d
```

Wait ~30 seconds for all containers to become healthy. Verify with:

```bash
docker ps          # all 6 containers should be "Up"
```

| Service | Port | Purpose |
|---------|------|---------|
| Neo4j | 7474 (browser), 7687 (bolt) | Knowledge graph |
| Redis | 6379 | State store |
| TimescaleDB | 5432 | Time-series data |
| Qdrant | 6333 | Vector search |
| Kafka | 9092 | Event bus |
| Zookeeper | 2181 | Kafka coordination |

### 3. Create `.env` file

Create a `.env` file in the project root:

```bash
OPENAI_API_KEY=sk-...your-key-here
```

All other settings (Neo4j, Redis, Kafka, etc.) use localhost defaults and work out of the box with the Docker setup. See `src/shared/config.py` for the full list of overridable vars.

### 4. Install backend

```bash
pip install -e .
```

### 5. Bootstrap the knowledge graph

Populates Neo4j with initial countries, leaders, alliances, and relationships:

```bash
python scripts/bootstrap_kg.py
```

### 6. Bootstrap global state

Loads the initial `GlobalState` into Redis:

```bash
python scripts/bootstrap_state.py
```

### 7. Start the API server

```bash
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

API docs are available at **http://localhost:8000/docs**.

### 8. Start live event ingestion

In a **separate terminal**, start the RSS ingestion pipeline. This continuously pulls from BBC, Al Jazeera, NPR, and The Guardian, classifies events, and publishes to Kafka:

```bash
python scripts/run_ingestion.py
```

### 9. Start the frontend

In another **separate terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the Geo-Sim dashboard.

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
├── frontend/              React + Vite + Tailwind dashboard
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
├── data/                  Initial KG data, historical events
└── docker-compose.yml     All infrastructure services
```

## Stopping Everything

```bash
# Frontend: Ctrl+C in the terminal running npm run dev
# Ingestion: Ctrl+C in the terminal running run_ingestion.py
# API server: Ctrl+C in the terminal running uvicorn
# Infrastructure:
docker-compose down
```

To also wipe all stored data (Neo4j, Redis, Postgres, Qdrant, Kafka):

```bash
docker-compose down -v
```
