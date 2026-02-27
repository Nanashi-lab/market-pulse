export interface WatchlistItem {
  ticker: string
  price: number
  changePct: number
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  // Step 1: Fetch tickers from watchlist index
  const watchlistRes = await fetch('/api/es/watchlist/_search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: { term: { status: 'tracked' } },
      sort: [{ status: { order: 'asc' } }],
      size: 50,
      _source: ['ticker', 'status'],
    }),
  })

  if (!watchlistRes.ok) {
    const errorBody = await watchlistRes.text()
    console.error('Watchlist ES error:', watchlistRes.status, errorBody)
    throw new Error(`Failed to fetch watchlist: ${watchlistRes.status} ${watchlistRes.statusText}`)
  }

  const watchlistData = await watchlistRes.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tickers: string[] = (watchlistData.hits?.hits ?? []).map((hit: any) => hit._source?.ticker).filter(Boolean)

  // Step 2: If no tickers, return empty
  if (tickers.length === 0) {
    return []
  }

  // Step 3: Fetch latest prices for each ticker from stock_prices index
  let pricesRes: Response
  try {
    pricesRes = await fetch('/api/es/stock_prices/_search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: { terms: { ticker: tickers } },
        sort: [{ date: { order: 'desc' } }],
        collapse: { field: 'ticker' },
        size: 50,
        _source: ['ticker', 'close', 'change_pct'],
      }),
    })
  } catch (err) {
    // Network error fetching prices
    throw new Error(`Failed to fetch stock prices: ${err instanceof Error ? err.message : String(err)}`)
  }

  // Gracefully handle 404 — stock_prices index may not exist yet (Phase 4 not run)
  if (pricesRes.status === 404) {
    return tickers.map((ticker) => ({ ticker, price: 0, changePct: 0 }))
  }

  if (!pricesRes.ok) {
    throw new Error(`Failed to fetch stock prices: ${pricesRes.status} ${pricesRes.statusText}`)
  }

  const pricesData = await pricesRes.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: WatchlistItem[] = (pricesData.hits?.hits ?? []).map((hit: any) => ({
    ticker: hit._source?.ticker ?? '',
    price: hit._source?.close ?? 0,
    changePct: hit._source?.change_pct ?? 0,
  }))

  return items
}
