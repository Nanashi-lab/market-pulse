# ES|QL Tools

All 9 ES|QL query tools used by the MarketPulse agent.

---

## 1. `stock_prices.get_recent`

Retrieve the most recent daily price data for a specific stock ticker, including open, close, high, low, volume, and daily change percentage.

**Parameters:**
- `ticker` — The stock ticker symbol to look up (e.g. AAPL, TSLA, MSFT)

```sql
FROM stock_prices
| WHERE ticker == ?ticker
| KEEP ticker, date, open, close, high, low, volume, change_pct
| SORT date DESC
| LIMIT 10
```

---

## 2. `stock_prices.get_range`

Retrieve daily stock price data for a specific ticker within a date range. Use this when the user asks about price history over a specific period.

**Parameters:**
- `ticker` — Stock ticker symbol (e.g. AAPL, TSLA, MSFT)
- `start_date` — Start date in `yyyy-MM-dd` format. Default: 10 days before today.
- `end_date` — End date in `yyyy-MM-dd` format. Default: today's date.

```sql
FROM stock_prices
| WHERE ticker == ?ticker
  AND TO_STRING(date) >= CONCAT(?start_date, "T00:00:00.000Z")
  AND TO_STRING(date) <= CONCAT(?end_date, "T00:00:00.000Z")
| KEEP ticker, date, open, close, high, low, volume, change_pct
| SORT date DESC
```

---

## 3. `stock_prices.top_movers`

Find the biggest stock gainers and losers by daily percentage change. Can be filtered by sector.

**Parameters:**
- `date` — Date in `yyyy-MM-dd` format. Default: most recent trading day.
- `sector` — Sector to filter by (e.g. Technology, Healthcare)

```sql
FROM stock_prices
| WHERE TO_STRING(date) == CONCAT(?date, "T00:00:00.000Z")
  AND sector == ?sector
| KEEP ticker, date, close, change_pct, volume, sector
| SORT change_pct DESC
| LIMIT 10
```

---

## 4. `stock_prices.sector_performance`

Get aggregated performance summary per sector including average price change, total volume, and number of stocks.

**Parameters:**
- `date` — Date in `yyyy-MM-dd` format. Default: most recent trading day.

```sql
FROM stock_prices
| WHERE TO_STRING(date) == CONCAT(?date, "T00:00:00.000Z")
| STATS avg_change = AVG(change_pct),
        total_volume = SUM(volume),
        stock_count = COUNT(ticker) BY sector
| SORT avg_change DESC
```

---

## 5. `watchlist.get_prices`

Get the latest stock prices for all actively tracked stocks on the user's watchlist.

**Parameters:** None

```sql
FROM stock_prices
| LOOKUP JOIN lookup_watchlist ON ticker
| WHERE status == "tracked"
| SORT date DESC
| STATS latest_date = MAX(date) BY ticker, close, change_pct
| KEEP ticker, close, change_pct, latest_date
| SORT change_pct DESC
```

---

## 6. `watchlist.get_tracked`

Retrieve all actively tracked stocks from the user's watchlist.

**Parameters:** None

```sql
FROM watchlist
| WHERE status == "tracked"
| KEEP ticker, status
| SORT ticker ASC
```

---

## 7. `news.semantic_search`

Search for news articles using natural language. Performs semantic search on headlines and summaries to find contextually relevant articles.

**Parameters:**
- `query` — Natural language search query (e.g. "tech layoffs", "positive earnings surprises", "oil price concerns")

```sql
FROM news
| WHERE MATCH(headline, ?query) OR MATCH(summary, ?query)
| KEEP headline, summary, source, published_at, tickers, sector, sentiment
| SORT published_at DESC
| LIMIT 10
```

---

## 8. `news.sentiment_by_ticker`

Get a breakdown of news sentiment (positive, negative, neutral) for a specific stock ticker.

**Parameters:**
- `ticker` — Stock ticker symbol to analyze sentiment for (e.g. AAPL, TSLA, MSFT)

```sql
FROM news
| WHERE tickers == ?ticker
| STATS count = COUNT(*) BY sentiment
| SORT count DESC
```

---

## 9. `news.sentiment_by_sector`

Get a breakdown of news sentiment (positive, negative, neutral) for a specific sector.

**Parameters:**
- `sector` — Sector to analyze sentiment for (e.g. Technology, Healthcare, Energy)

```sql
FROM news
| WHERE sector == ?sector
| STATS count = COUNT(*) BY sentiment
| SORT count DESC
```
