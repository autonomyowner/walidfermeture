import { NextResponse } from 'next/server'
import {
  ASSISTANT_MAX_CHARS,
  ASSISTANT_MAX_MESSAGES,
  ASSISTANT_SYSTEM_PROMPT,
} from '@/lib/aiAssistant'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'anthropic/claude-sonnet-4.5'

type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  role: ChatRole
  content: string
}

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    (candidate.role === 'user' || candidate.role === 'assistant') &&
    typeof candidate.content === 'string' &&
    candidate.content.trim().length > 0
  )
}

const sanitize = (messages: unknown): ChatMessage[] | null => {
  if (!Array.isArray(messages)) return null
  const valid = messages.filter(isChatMessage)
  if (valid.length === 0) return null
  return valid.slice(-ASSISTANT_MAX_MESSAGES).map((message) => ({
    role: message.role,
    content: message.content.slice(0, ASSISTANT_MAX_CHARS),
  }))
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Assistant indisponible : configuration manquante.' },
      { status: 503 },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const messages = sanitize((payload as { messages?: unknown })?.messages)
  if (!messages) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.walidfermeture.fr'

  let upstream: Response
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': 'Walid Fermeture Assistant IA',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
        stream: true,
        max_tokens: 700,
        temperature: 0.4,
        messages: [
          { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    })
  } catch {
    return NextResponse.json(
      { error: 'Assistant momentanément injoignable. Appelez le 07 53 96 92 59.' },
      { status: 502 },
    )
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: 'Assistant momentanément injoignable. Appelez le 07 53 96 92 59.' },
      { status: 502 },
    )
  }

  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  const reader = upstream.body.getReader()
  let buffer = ''

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read()

      if (done) {
        controller.close()
        return
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue

        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data) as {
            choices?: { delta?: { content?: string } }[]
          }
          const text = parsed.choices?.[0]?.delta?.content
          if (text) controller.enqueue(encoder.encode(text))
        } catch {
          // Ignore les commentaires de keep-alive et les fragments partiels.
        }
      }
    },
    cancel() {
      void reader.cancel()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  })
}
