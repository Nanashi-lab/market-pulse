import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { sendMessage } from '@/services/esAgentService'
import type { Message, Conversation } from '@/types'

// ISO date string regex for reviver
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

function dateReviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
    return new Date(value)
  }
  return value
}

interface ConversationState {
  conversations: Conversation[]
  activeConversationId: string | null
  sidebarOpen: boolean
  searchQuery: string
  isThinking: boolean
  error: string | null
  watchlistRefreshKey: number
}

interface ConversationActions {
  activeConversation: () => Conversation | undefined
  newConversation: () => void
  switchConversation: (id: string) => void
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  send: (text: string) => Promise<void>
  retry: () => void
  clearError: () => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (q: string) => void
}

type ConversationStore = ConversationState & ConversationActions

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      sidebarOpen: true,
      searchQuery: '',
      isThinking: false,
      error: null,
      watchlistRefreshKey: 0,

      activeConversation: () => {
        const { conversations, activeConversationId } = get()
        return conversations.find((c) => c.id === activeConversationId)
      },

      newConversation: () => {
        const { conversations, activeConversationId } = get()

        // If current active conversation has no user messages, remove it
        if (activeConversationId) {
          const current = conversations.find((c) => c.id === activeConversationId)
          if (current && !current.messages.some((m) => m.role === 'user')) {
            set((state) => ({
              conversations: state.conversations.filter((c) => c.id !== activeConversationId),
            }))
          }
        }

        // Set a new activeConversationId — conversation added on first send
        set({ activeConversationId: crypto.randomUUID() })
      },

      switchConversation: (id: string) => {
        const { isThinking, activeConversationId, conversations } = get()

        // Guard: no switching during send
        if (isThinking) return

        // If current active conversation has no user messages, remove it
        if (activeConversationId && activeConversationId !== id) {
          const current = conversations.find((c) => c.id === activeConversationId)
          if (current && !current.messages.some((m) => m.role === 'user')) {
            set((state) => ({
              conversations: state.conversations.filter((c) => c.id !== activeConversationId),
            }))
          }
        }

        set({ activeConversationId: id })
      },

      deleteConversation: (id: string) => {
        const { conversations, activeConversationId } = get()
        const remaining = conversations.filter((c) => c.id !== id)

        let newActiveId: string | null = activeConversationId

        if (activeConversationId === id) {
          // Switch to most recent remaining conversation, or null
          newActiveId = remaining.length > 0 ? remaining[0].id : null
        }

        set({ conversations: remaining, activeConversationId: newActiveId })
      },

      renameConversation: (id: string, title: string) => {
        const trimmed = title.trim()
        if (!trimmed) return // Keep old title if empty/whitespace

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title: trimmed } : c
          ),
        }))
      },

      send: async (text: string) => {
        const { isThinking, activeConversation } = get()
        let { activeConversationId } = get()

        // Guard: empty text or concurrent send
        if (!text.trim() || isThinking) return

        // Auto-create an activeConversationId if none exists
        if (!activeConversationId) {
          activeConversationId = crypto.randomUUID()
          set({ activeConversationId })
        }

        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          content: text,
          timestamp: new Date(),
        }

        // If active conversation doesn't exist in conversations[] yet, create it now
        const existing = activeConversation()
        if (!existing) {
          const autoTitle =
            text.trim().length > 40
              ? text.trim().slice(0, 40).trimEnd() + '\u2026'
              : text.trim()

          const newConversation: Conversation = {
            id: activeConversationId,
            title: autoTitle,
            messages: [userMessage],
            esConversationId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          set((state) => ({
            conversations: [newConversation, ...state.conversations],
            isThinking: true,
            error: null,
          }))
        } else {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === activeConversationId
                ? { ...c, messages: [...c.messages, userMessage], updatedAt: new Date() }
                : c
            ),
            isThinking: true,
            error: null,
          }))
        }

        // Get the esConversationId for the API call
        const conv = get().conversations.find((c) => c.id === activeConversationId)
        const esConversationId = conv?.esConversationId ?? null

        try {
          const result = await sendMessage(text, esConversationId)

          const agentMessage: Message = {
            id: crypto.randomUUID(),
            role: 'agent',
            content: result.message,
            timestamp: new Date(),
            steps: result.steps,
          }

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === activeConversationId
                ? {
                    ...c,
                    messages: [...c.messages, agentMessage],
                    esConversationId: result.conversationId,
                    updatedAt: new Date(),
                  }
                : c
            ),
            isThinking: false,
            watchlistRefreshKey: state.watchlistRefreshKey + 1,
          }))
        } catch (err) {
          const errorText = err instanceof Error ? err.message : 'An unexpected error occurred'

          const errorMessage: Message = {
            id: crypto.randomUUID(),
            role: 'agent',
            content: errorText,
            timestamp: new Date(),
            error: true,
          }

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === activeConversationId
                ? { ...c, messages: [...c.messages, errorMessage], updatedAt: new Date() }
                : c
            ),
            isThinking: false,
            error: errorText,
          }))
        }
      },

      retry: () => {
        const { activeConversationId, conversations, send } = get()
        if (!activeConversationId) return

        const conv = conversations.find((c) => c.id === activeConversationId)
        if (!conv) return

        const messages = conv.messages

        // Find last user message
        const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
        if (!lastUserMessage) return

        // Remove trailing error message if present
        const lastMessage = messages[messages.length - 1]
        if (lastMessage?.error) {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === activeConversationId
                ? { ...c, messages: c.messages.slice(0, -1) }
                : c
            ),
            error: null,
          }))
        }

        void send(lastUserMessage.content)
      },

      clearError: () => {
        set({ error: null })
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },

      setSearchQuery: (q: string) => {
        set({ searchQuery: q })
      },
    }),
    {
      name: 'marketpulse-conversations',
      version: 1,
      storage: createJSONStorage(() => localStorage, {
        reviver: dateReviver,
      }),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
)

export type { Conversation }
