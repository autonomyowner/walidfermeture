import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STT_URL = 'https://api.elevenlabs.io/v1/speech-to-text'
const MAX_AUDIO_BYTES = 10 * 1024 * 1024

const UNAVAILABLE = {
  error: "Transcription indisponible. Écrivez-nous ou appelez le 07 53 96 92 59.",
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Agent vocal indisponible : configuration manquante.' },
      { status: 503 },
    )
  }

  let audio: File | null = null
  try {
    const form = await request.formData()
    const value = form.get('audio')
    if (value instanceof File) audio = value
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  if (!audio || audio.size === 0) {
    return NextResponse.json({ error: 'Aucun audio reçu.' }, { status: 400 })
  }

  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json(
      { error: 'Message vocal trop long. Réessayez plus court.' },
      { status: 413 },
    )
  }

  const upstreamForm = new FormData()
  upstreamForm.append('file', audio, 'message.webm')
  upstreamForm.append('model_id', 'scribe_v1')
  upstreamForm.append('language_code', 'fra')

  let upstream: Response
  try {
    upstream = await fetch(STT_URL, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey },
      body: upstreamForm,
    })
  } catch {
    return NextResponse.json(UNAVAILABLE, { status: 502 })
  }

  if (!upstream.ok) {
    return NextResponse.json(UNAVAILABLE, { status: 502 })
  }

  const result = (await upstream.json()) as { text?: string }
  const text = (result.text ?? '').trim()

  if (text.length === 0) {
    return NextResponse.json(
      { error: "Je n'ai rien entendu. Réessayez en parlant plus près du micro." },
      { status: 422 },
    )
  }

  return NextResponse.json({ text })
}
