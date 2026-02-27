import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { fetchWatchlist, type WatchlistItem } from '@/services/watchlistService'

interface WatchlistDrawerProps {
  open: boolean
  onClose: () => void
  refreshKey: number
}

export default function WatchlistDrawer({ open, onClose, refreshKey }: WatchlistDrawerProps) {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchWatchlist()
        if (!cancelled) {
          setItems(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load watchlist')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open, refreshKey])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            className="fixed top-0 right-0 h-full w-72 bg-bg-surface border-l border-border-subtle z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0">
              <span className="text-sm font-semibold text-text-primary">Watchlist</span>
              <button
                onClick={onClose}
                className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Close watchlist"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {loading && (
                <p className="text-xs text-text-muted mt-4">Loading...</p>
              )}

              {!loading && error && (
                <p className="text-xs text-negative mt-4">{error}</p>
              )}

              {!loading && !error && items.length === 0 && (
                <p className="text-xs text-text-muted mt-4">Watchlist is empty</p>
              )}

              {!loading && !error && items.length > 0 && (
                <ul className="space-y-1 mt-1">
                  {items.map((item) => (
                    <li
                      key={item.ticker}
                      className="flex items-center justify-between py-2 border-b border-border-subtle/40 last:border-b-0"
                    >
                      <span className="text-sm font-semibold text-text-primary">{item.ticker}</span>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs text-text-secondary">
                          ${item.price.toFixed(2)}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            item.changePct >= 0 ? 'text-positive' : 'text-negative'
                          }`}
                        >
                          {item.changePct >= 0 ? '+' : ''}
                          {item.changePct.toFixed(2)}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
