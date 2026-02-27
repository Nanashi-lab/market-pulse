# Elasticsearch Agent Builder Configuration

This folder contains the complete Elasticsearch configuration for MarketPulse — all ES|QL queries, workflow YAML definitions, index schemas, and agent configurations used by the Agent Builder.

## Contents

| File | Description |
|------|-------------|
| [indices.md](indices.md) | Index schemas for `stock_prices`, `watchlist`, and `news` |
| [agents.md](agents.md) | Agent configurations (primary + 2 sub-agents) |
| [esql-tools.md](esql-tools.md) | All 9 ES\|QL tool queries with parameters |
| [index-search-tools.md](index-search-tools.md) | Index search tool configuration |
| [workflows/](workflows/) | Complete YAML definitions for all 4 workflow tools |

## Tool Reference

| # | Tool ID | Type | File |
|---|---------|------|------|
| 1 | `stock_prices.get_recent` | ES\|QL | [esql-tools.md](esql-tools.md#1-stock_pricesget_recent) |
| 2 | `stock_prices.get_range` | ES\|QL | [esql-tools.md](esql-tools.md#2-stock_pricesget_range) |
| 3 | `stock_prices.top_movers` | ES\|QL | [esql-tools.md](esql-tools.md#3-stock_pricestop_movers) |
| 4 | `stock_prices.sector_performance` | ES\|QL | [esql-tools.md](esql-tools.md#4-stock_pricessector_performance) |
| 5 | `watchlist.get_prices` | ES\|QL | [esql-tools.md](esql-tools.md#5-watchlistget_prices) |
| 6 | `watchlist.get_tracked` | ES\|QL | [esql-tools.md](esql-tools.md#6-watchlistget_tracked) |
| 7 | `news.semantic_search` | ES\|QL | [esql-tools.md](esql-tools.md#7-newssemantic_search) |
| 8 | `news.sentiment_by_ticker` | ES\|QL | [esql-tools.md](esql-tools.md#8-newssentiment_by_ticker) |
| 9 | `news.sentiment_by_sector` | ES\|QL | [esql-tools.md](esql-tools.md#9-newssentiment_by_sector) |
| 10 | `news.explore` | Index Search | [index-search-tools.md](index-search-tools.md) |
| 11 | `watchlist.add` | Workflow | [workflows/watchlist-add.yaml](workflows/watchlist-add.yaml) |
| 12 | `watchlist.remove` | Workflow | [workflows/watchlist-remove.yaml](workflows/watchlist-remove.yaml) |
| 13 | `market.daily_briefing` | Workflow + Agent | [workflows/daily-briefing.yaml](workflows/daily-briefing.yaml) |
| 14 | `market.watchlist_risk_report` | Workflow + Agent | [workflows/watchlist-risk-report.yaml](workflows/watchlist-risk-report.yaml) |
