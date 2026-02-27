import type { ConverseStep } from '@/types'

const AGENT_ID = import.meta.env.VITE_ELASTIC_AGENT_ID

export interface ConverseResponse {
  steps?: ConverseStep[]
  response: {
    message: string
  }
  conversation_id: string
}

export async function sendMessage(
  input: string,
  conversationId: string | null
): Promise<{ message: string; conversationId: string; steps?: ConverseStep[] }> {
  const body: Record<string, string> = { input, agent_id: AGENT_ID }
  if (conversationId) body.conversation_id = conversationId

  const res = await fetch('/api/agent_builder/converse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Agent API error (${res.status}): ${text}`)
  }

  const data: ConverseResponse = await res.json()

  if (import.meta.env.DEV) {
    console.log('[ES Agent] Raw steps:', data.steps)
  }

  return { message: data.response.message, conversationId: data.conversation_id, steps: data.steps }
}
