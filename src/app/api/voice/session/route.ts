import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UNAVAILABLE = {
  error: "Agent vocal injoignable. Appelez le 07 53 96 92 59, nous repondons 24/7.",
}

// L'agent est prive : le navigateur ne recoit qu'une URL signee, valable
// quelques minutes. La cle API et l'identifiant de l'agent restent ici.
export async function POST(): Promise<Response> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const agentId = process.env.ELEVENLABS_AGENT_ID

  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: 'Agent vocal indisponible : configuration manquante.' },
      { status: 503 },
    )
  }

  let upstream: Response
  try {
    upstream = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      { headers: { 'xi-api-key': apiKey }, cache: 'no-store' },
    )
  } catch {
    return NextResponse.json(UNAVAILABLE, { status: 502 })
  }

  if (!upstream.ok) {
    return NextResponse.json(UNAVAILABLE, { status: 502 })
  }

  const result = (await upstream.json()) as { signed_url?: string }

  if (!result.signed_url) {
    return NextResponse.json(UNAVAILABLE, { status: 502 })
  }

  return NextResponse.json(
    { signedUrl: result.signed_url },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
