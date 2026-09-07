'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useConversation } from '@elevenlabs/react'

type VoiceCallProps = {
  onTranscript: (role: 'user' | 'assistant', text: string) => void
  onEnded: () => void
}

const MIC_DENIED =
  "Micro refusé. Autorisez le microphone dans votre navigateur, puis réessayez."

const UNAVAILABLE =
  "Agent vocal injoignable. Appelez le 07 53 96 92 59, nous répondons 24/7."

/**
 * Conversation vocale temps reel : l'agent ecoute en continu, repond en
 * parlant, et se laisse couper la parole. Ce composant est charge a la
 * demande — son transport WebSocket ne pese sur aucune autre page.
 */
export const VoiceCall = ({
  onTranscript,
  onEnded,
}: VoiceCallProps): JSX.Element => {
  const [error, setError] = useState<string>('')
  const hasStartedRef = useRef<boolean>(false)
  const transcriptRef = useRef(onTranscript)

  useEffect(() => {
    transcriptRef.current = onTranscript
  }, [onTranscript])

  const conversation = useConversation({
    onMessage: ({ message, source }: { message: string; source: string }) => {
      if (typeof message !== 'string' || message.trim().length === 0) return
      transcriptRef.current(source === 'user' ? 'user' : 'assistant', message)
    },
    onError: () => setError(UNAVAILABLE),
  })

  const { status, isSpeaking, startSession, endSession } = conversation

  const hangUp = useCallback((): void => {
    endSession()
    onEnded()
  }, [endSession, onEnded])

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    let cancelled = false

    const start = async (): Promise<void> => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        if (!cancelled) setError(MIC_DENIED)
        return
      }

      try {
        const response = await fetch('/api/voice/session', { method: 'POST' })
        if (!response.ok) throw new Error('session_unavailable')

        const { signedUrl } = (await response.json()) as { signedUrl?: string }
        if (!signedUrl) throw new Error('session_unavailable')
        if (cancelled) return

        await startSession({ signedUrl, connectionType: 'websocket' })
      } catch {
        if (!cancelled) setError(UNAVAILABLE)
      }
    }

    void start()

    return () => {
      cancelled = true
    }
  }, [startSession])

  useEffect(() => {
    return () => endSession()
  }, [endSession])

  const label = error
    ? error
    : status === 'connected'
      ? isSpeaking
        ? "L'assistant vous répond…"
        : 'Je vous écoute — parlez normalement.'
      : 'Connexion à l’assistant vocal…'

  const isLive = status === 'connected' && error.length === 0

  return (
    <div className="flex items-center gap-3 border-t border-neutral-200 bg-[#0B3C49] px-4 py-3 text-white">
      <span className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center">
        {isLive && (
          <span
            className={`absolute inset-0 rounded-full bg-[#18A999] ${
              isSpeaking ? 'animate-ping' : 'animate-pulse'
            }`}
          />
        )}
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#18A999] text-sm">
          {error ? '!' : '🎙'}
        </span>
      </span>

      <p className={`flex-1 text-xs leading-relaxed ${error ? 'text-red-200' : 'text-white/90'}`}>
        {label}
      </p>

      <button
        type="button"
        onClick={hangUp}
        className="flex-shrink-0 rounded-full bg-white/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-white/25"
      >
        {error ? 'Fermer' : 'Raccrocher'}
      </button>
    </div>
  )
}

export default VoiceCall
