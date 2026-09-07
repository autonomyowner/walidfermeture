import { NextResponse } from 'next/server'
import { ASSISTANT_MAX_CHARS } from '@/lib/aiAssistant'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_VOICE_ID = 'cjVigY5qzO86Huf0OWal'
const DEFAULT_MODEL_ID = 'eleven_turbo_v2_5'

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Agent vocal indisponible : configuration manquante.' },
      { status: 503 },
    )
  }

  let text: string
  try {
    const payload = (await request.json()) as { text?: unknown }
    if (typeof payload.text !== 'string') throw new Error('invalid')
    text = payload.text.trim().slice(0, ASSISTANT_MAX_CHARS)
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  if (text.length === 0) {
    return NextResponse.json({ error: 'Texte vide.' }, { status: 400 })
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID
  const modelId = process.env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL_ID

  let upstream: Response
  try {
    upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          language_code: 'fr',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.8,
            style: 0.15,
            use_speaker_boost: true,
          },
        }),
      },
    )
  } catch {
    return NextResponse.json({ error: 'Synthèse vocale injoignable.' }, { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Synthèse vocale injoignable.' }, { status: 502 })
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  })
}
