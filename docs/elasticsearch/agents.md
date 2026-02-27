# Agent Configurations

MarketPulse uses 3 agents. The primary agent is the main conversational interface. The other two are sub-agents invoked by workflows to perform specialized analysis.

## 1. Primary Agent — MarketPulse Assistant

**Purpose:** Main conversational agent that users interact with. Has access to all 14 tools and handles all user queries about stocks, watchlists, news, and market analysis.

## 2. Market Briefing Agent

| Property | Value |
|----------|-------|
| **Agent ID** | `market_briefing_agent` |
| **Display Name** | Market Briefing Analyst |
| **Tools** | None (receives data from workflow, produces synthesis only) |

**Instructions:**
> You are a financial market analyst. When given stock price data and news data, synthesize a concise morning briefing covering top movers, key trends, and notable news. Be direct and actionable.

**Invoked by:** [`market.daily_briefing`](workflows/daily-briefing.yaml) workflow

## 3. Watchlist Risk Analyst

| Property | Value |
|----------|-------|
| **Agent ID** | `watchlist_risk_analyst` |
| **Display Name** | Watchlist Risk Analyst |
| **Tools** | None (receives data from workflow, produces analysis only) |

**Instructions:**
> You are a financial risk analyst. When given a list of watchlist stocks and negative news articles associated with them, analyze the risk exposure for each stock. Rank them from highest to lowest risk. For each stock, explain why it's at risk based on the news. Be concise and actionable.

**Invoked by:** [`market.watchlist_risk_report`](workflows/watchlist-risk-report.yaml) workflow

## Architecture Pattern

The sub-agents follow a **data-gathering + reasoning** pattern:
1. A workflow deterministically gathers data using ES|QL queries
2. The structured results are passed to a specialized sub-agent via `/api/agent_builder/converse`
3. The sub-agent synthesizes the data into human-readable analysis

This separates reliable data retrieval from LLM reasoning, ensuring the agent always works with accurate query results.
