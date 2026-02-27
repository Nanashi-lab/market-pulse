# Index Search Tools

## `news.explore`

Search for financial news articles. Unlike ES|QL tools which use predefined queries, the index search tool lets the agent construct its own Elasticsearch queries against the `news` index for flexible discovery. Use this when the user asks about news, market sentiment, or recent headlines for specific stocks, sectors, or overall market mood.

| Property | Value |
|----------|-------|
| **Index Pattern** | `news` |
| **Row Limit** | 10 |

### Custom Instruction

Use the `tickers` field (keyword array) to filter by stock ticker. Use `sentiment` field to filter by `positive`, `negative`, or `neutral` sentiment. Use `sector` field to filter by sector. Use `published_at` field (date) for time-based filtering.

Always return: `headline`, `summary`, `source`, `published_at`, `tickers`, `sector`, and `sentiment`.

Sort by `published_at` descending to show most recent first.

The `headline` and `summary` fields support semantic search.
