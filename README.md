# MarketPulse

AI-powered financial intelligence platform built with **Elasticsearch Agent Builder**.

MarketPulse is a conversational AI agent that queries stock data, manages watchlists, analyzes news sentiment, and generates market briefings — all through natural language chat.

## The Problem

Financial professionals juggle multiple tools to track stocks, read news, and assess risk. MarketPulse consolidates this into a single conversational interface powered by Elasticsearch, where an AI agent reasons across structured market data and unstructured news in real time.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         React Frontend                           │
│          Chat UI  ·  Watchlist Drawer  ·  Tool Traces            │
└───────────────────────────┬──────────────────────────────────────┘
                            │  /api/agent_builder/converse
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                  MarketPulse Agent (Primary)                      │
│                   Elasticsearch Agent Builder                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                      14 Agent Tools                        │  │
│  │                                                            │  │
│  │  ES|QL Query Tools (9)          Index Search Tools (1)     │  │
│  │  ┌─────────────────────┐        ┌───────────────────┐     │  │
│  │  │ get_recent          │        │ news.explore      │     │  │
│  │  │ get_range           │        │ (semantic search) │     │  │
│  │  │ top_movers          │        └───────────────────┘     │  │
│  │  │ sector_performance  │                                  │  │
│  │  │ watchlist prices    │        Workflow Tools (4)         │  │
│  │  │ watchlist tracked   │        ┌───────────────────┐     │  │
│  │  │ semantic_search     │        │ watchlist.add     │     │  │
│  │  │ sentiment_by_ticker │        │ watchlist.remove  │     │  │
│  │  │ sentiment_by_sector │        │ daily_briefing  ──┼──┐  │  │
│  │  └─────────────────────┘        │ risk_report    ──┼──┤  │  │
│  │                                 └───────────────────┘  │  │  │
│  └────────────────────────────────────────────────────────┘  │  │
│                                                       │      │  │
│  ┌────────────────────────────────────────────────────┘      │  │
│  │  Sub-Agent Workflows                                      │  │
│  │  ┌──────────────────────┐  ┌────────────────────────┐     │  │
│  │  │ Market Briefing      │  │ Watchlist Risk         │     │  │
│  │  │ Agent                │  │ Analyst                │     │  │
│  │  │                      │  │                        │     │  │
│  │  │ ES|QL: top movers    │  │ ES|QL: tracked stocks  │     │  │
│  │  │ ES|QL: recent news   │  │ ES|QL: negative news   │     │  │
│  │  │   ↓                  │  │   ↓                    │     │  │
│  │  │ LLM: synthesize      │  │ LLM: rank risk         │     │  │
│  │  │ morning briefing     │  │ per stock              │     │  │
│  │  └──────────────────────┘  └────────────────────────┘     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  Elasticsearch Indices                      │  │
│  │                                                            │  │
│  │  stock_prices (1,850)  │  watchlist (50)  │  news (510)    │  │
│  │  OHLCV + sector        │  ticker + status │  semantic_text │  │
│  │                        │                  │  + sentiment   │  │
│  │                        │  lookup_watchlist │                │  │
│  │                        │  (LOOKUP JOIN)    │                │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**3 Elasticsearch Indices:**
- `stock_prices` — 1,850 daily OHLCV records with sector classification
- `watchlist` — User-tracked tickers with add/remove status
- `news` — 510 financial articles with semantic search on headlines/summaries and sentiment labels

**14 Agent Tools across 4 categories:**

| Category | Tools | Examples |
|----------|-------|---------|
| ES\|QL Query | 9 | Latest prices, date range lookup, top movers, sector performance, sentiment breakdown |
| Index Search | 1 | Flexible news discovery with semantic search |
| Workflow (Write) | 2 | Add/remove tickers from watchlist |
| Workflow + Sub-Agent | 2 | Daily market briefing, watchlist risk report |

**2 Sub-Agents:**
- **Market Briefing Analyst** — Synthesizes top movers + news into a morning briefing
- **Watchlist Risk Analyst** — Cross-references tracked stocks with negative news to rank risk exposure

## Key Design Decisions

- **Agent-calling workflows**: Complex tools (briefing, risk report) gather data deterministically via ES|QL, then pass results to a specialized sub-agent for LLM-powered synthesis. This combines query reliability with reasoning capability.
- **Semantic search on news**: `headline` and `summary` fields use `semantic_text` mapping, enabling natural language queries like "any bad news about tech companies."
- **Lookup index for joins**: A `lookup_watchlist` index (with `index.mode: lookup`) enables `LOOKUP JOIN` in ES|QL to get prices for tracked stocks in a single query.

## Tech Stack

**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS · Zustand · shadcn/ui · Motion

**Backend:** Elasticsearch Agent Builder (hosted on Elastic Cloud)

## Getting Started

### Prerequisites

- Node.js 18+
- An Elastic Cloud deployment with Agent Builder enabled

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Nanashi-lab/marketpulse.git
   cd marketpulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with your Elastic Cloud credentials:
   ```env
   ELASTIC_KIBANA_URL=https://your-deployment.kb.region.gcp.elastic.cloud:443
   ELASTIC_ES_URL=https://your-deployment.es.region.gcp.elastic.cloud:443
   ELASTIC_API_KEY=your-api-key
   VITE_ELASTIC_AGENT_ID=your-agent-id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The Vite dev server proxies API requests to your Elastic Cloud deployment, keeping the API key server-side.

## Features

- **Conversational stock queries** — Ask about any ticker's price, history, or performance
- **Watchlist management** — Add/remove stocks via natural language ("add TSLA to my watchlist")
- **News sentiment analysis** — Semantic search across 510 financial articles with sentiment filtering
- **Morning market briefing** — AI-generated summary of top movers and key news
- **Watchlist risk report** — Automated risk analysis cross-referencing your stocks with negative news
- **Sector performance** — Aggregated views of market sectors
- **Tool execution traces** — Expandable view showing which tools the agent used and why
- **Persistent conversations** — Chat history saved locally with multi-conversation support

## Elasticsearch Agent Builder Documentation

Full technical documentation for the Elasticsearch backend — index schemas, agent configurations, all 9 ES|QL queries, and complete YAML workflow definitions — is available in [`docs/elasticsearch/`](docs/elasticsearch/).

## License

MIT
