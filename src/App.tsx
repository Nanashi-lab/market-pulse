import { useState } from 'react'
import Header from '@/components/Header'
import MessageArea from '@/components/MessageArea'
import InputBar from '@/components/InputBar'
import ConversationSidebar from '@/components/ConversationSidebar'
import WatchlistDrawer from '@/components/WatchlistDrawer'
import { useConversationStore } from '@/store/conversationStore'

export default function App() {
  const activeConversationId = useConversationStore((s) => s.activeConversationId)
  const watchlistRefreshKey = useConversationStore((s) => s.watchlistRefreshKey)
  const [watchlistOpen, setWatchlistOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-row bg-bg-primary text-text-primary font-sans antialiased">
      <ConversationSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleWatchlist={() => setWatchlistOpen((o) => !o)} />
        <MessageArea key={activeConversationId ?? 'new'} />
        <InputBar key={`input-${activeConversationId ?? 'new'}`} />
      </div>
      <WatchlistDrawer
        open={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        refreshKey={watchlistRefreshKey}
      />
    </div>
  )
}
