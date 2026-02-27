export interface ConverseStep {
  type: string
  reasoning?: string
  tool_id?: string
  tool_call_id?: string
  params?: Record<string, unknown>
  results?: Array<{ type: string; data: unknown }>
}

export interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
  error?: boolean  // true if this is an error message for display
  steps?: ConverseStep[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  esConversationId: string | null
  createdAt: Date
  updatedAt: Date
}
