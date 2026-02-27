# MarketPulse — Hackathon Writeup

## The Problem

Tracking financial markets means constantly switching between tools — one for stock prices, another for news, another for watchlists, and yet another for analysis. There is no single place where you can ask plain questions like "how is my watchlist doing?" or "any risks I should worry about?" and get an answer grounded in real data. MarketPulse solves this by putting a conversational AI agent in front of Elasticsearch, letting users query stock prices, manage watchlists, search news by sentiment, and generate full market briefings — all through natural language.

## What We Built

MarketPulse is a financial intelligence chat application powered by Elasticsearch Agent Builder. The agent has access to 14 custom tools across four categories:

- **9 ES|QL query tools** for structured data retrieval — stock prices, date ranges, top movers, sector aggregations, watchlist lookups, and sentiment breakdowns.
- **1 index search tool** using semantic search on news articles, so users can ask broad questions like "any bad news about tech?" and get contextually relevant results.
- **2 write workflow tools** for adding and removing tickers from a watchlist, with conditional logic (find-then-update pattern for removals).
- **2 agent-calling workflow tools** — the most interesting part. These workflows first gather data deterministically via ES|QL, then pass the structured results to a specialized sub-agent for LLM-powered synthesis. The daily briefing workflow fetches top movers and recent news, then hands them to a Market Briefing Agent. The risk report workflow pulls tracked stocks and negative news, then passes them to a Watchlist Risk Analyst that ranks exposure.

The data layer consists of three Elasticsearch indices: `stock_prices` (1,850 daily OHLCV records across sectors), `watchlist` (user-tracked tickers), and `news` (510 articles with `semantic_text` mapping and sentiment labels). A separate `lookup_watchlist` index with `index.mode: lookup` enables `LOOKUP JOIN` in ES|QL to fetch prices for all tracked stocks in a single query.

The frontend is a React chat interface with conversation history, a live watchlist drawer, and expandable tool execution traces that show exactly which tools the agent chose and why.

## Agent Builder Features We Liked

**ES|QL tools were the standout.** Writing piped queries as agent tools felt natural and powerful — the agent picks the right query, fills in parameters, and the user gets structured results. Semantic search via `MATCH()` on `semantic_text` fields was especially impressive for the news tools.

**Workflows connecting to sub-agents** unlocked a compelling pattern: deterministic data gathering followed by LLM reasoning. This separation means the agent always works with accurate query results rather than hallucinating data. Workflows also support external API calls and data ingestion — features we would have explored further given more time.

**LOOKUP JOIN** was a pleasant discovery. Being able to join the watchlist with price data in a single ES|QL query eliminated what would have been a multi-step lookup.

## Challenges

The biggest challenge was **time** — we discovered the hackathon with only 3 days remaining out of the 30-day window, so we had to be very deliberate about scope. We focused on breadth of tool types (ES|QL, search, workflows, sub-agents) rather than depth in any single area.

**Keeping the watchlist and lookup index in sync** required understanding the distinction between writable indices and lookup-mode indices. The regular `watchlist` index handles writes from the add/remove workflows, while `lookup_watchlist` powers the `LOOKUP JOIN` queries. Getting this right took some iteration.

**Workflow-to-sub-agent chaining** via `kibana.request` was powerful but not immediately obvious — figuring out the correct request shape to call `/api/agent_builder/converse` from within a workflow step was the trickiest integration point.

There is more we wanted to explore — looping within workflows, data ingestion pipelines, and external API integrations — but the 3-day constraint kept us focused on what we could ship end-to-end.
