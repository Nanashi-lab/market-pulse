# Index Schemas

MarketPulse uses 3 Elasticsearch indices.

## 1. `stock_prices`

**Records:** 1,850

Daily OHLCV stock price data with percentage change and sector classification.

| Field | Type | Notes |
|-------|------|-------|
| `ticker` | keyword | Stock ticker symbol (e.g. AAPL, TSLA) |
| `date` | date | Trading date (ISO 8601) |
| `open` | float | Opening price |
| `high` | float | Daily high price |
| `low` | float | Daily low price |
| `close` | float | Closing price |
| `volume` | long | Trading volume |
| `change_pct` | float | Daily percentage change |
| `sector` | keyword | Market sector (e.g. Technology) |

## 2. `watchlist`

**Records:** 50

User watchlist tracking stock tickers. A separate lookup index (`lookup_watchlist`) with `index.mode: lookup` exists to enable `LOOKUP JOIN` in ES|QL. The regular `watchlist` index remains writable for add/remove workflows. These two indices must be kept in sync.

| Field | Type | Notes |
|-------|------|-------|
| `ticker` | keyword | Stock ticker symbol |
| `status` | keyword | `"tracked"` or `"removed"` |

## 3. `news`

**Records:** 510

Financial news articles with sentiment analysis. The `headline` and `summary` fields are mapped as `semantic_text` to enable semantic search.

| Field | Type | Notes |
|-------|------|-------|
| `headline` | semantic_text | Article headline (semantic search enabled) |
| `summary` | semantic_text | Article summary (semantic search enabled) |
| `source` | keyword | News source |
| `published_at` | date | Publication date |
| `tickers` | keyword (array) | Associated stock tickers |
| `sector` | keyword | Related sector |
| `sentiment` | keyword | `positive`, `negative`, or `neutral` |

## Design Notes

### Date Handling
Elasticsearch stores dates in ISO 8601 format (e.g. `2026-02-25T00:00:00.000Z`), but the agent sends dates in `yyyy-MM-dd` format. Date-filtered queries bridge this with:
```
TO_STRING(date) == CONCAT(?date, "T00:00:00.000Z")
```

### Semantic Search
The `news` index uses `semantic_text` mapping on `headline` and `summary`, enabling natural language queries like "any bad news about tech companies" alongside traditional keyword search.
