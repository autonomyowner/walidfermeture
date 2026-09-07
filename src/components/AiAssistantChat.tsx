'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ASSISTANT_GREETING,
  ASSISTANT_MAX_CHARS,
  ASSISTANT_SUGGESTIONS,
} from '@/lib/aiAssistant'
import { trackMetaEvent } from '@/lib/metaPixel'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type VoiceState = 'idle' | 'recording' | 'transcribing'

const PHONE_NUMBER = '+33753969259'
const DISPLAY_PHONE = '07 53 96 92 59'

const ERROR_MESSAGE =
  "Désolé, je n'arrive pas à répondre pour le moment. Appelez-nous au 07 53 96 92 59, nous répondons 24/7."

const MIC_DENIED_MESSAGE =
  "Micro inaccessible. Autorisez le microphone dans votre navigateur, ou écrivez-moi votre demande."

// Le modele glisse parfois du markdown : on l'aplatit, la bulle affiche du texte brut.
const toPlainText = (content: string): string =>
  content
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[*+]\s+/gm, '- ')

const pickMimeType = (): string | undefined => {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  return candidates.find((type) => MediaRecorder.isTypeSupported(type))
}

type AiAssistantChatProps = {
  isOpen: boolean
  onClose: () => void
}

export const AiAssistantChat = ({
  isOpen,
  onClose,
}: AiAssistantChatProps): JSX.Element | null => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [isVoiceReplyOn, setIsVoiceReplyOn] = useState<boolean>(false)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [notice, setNotice] = useState<string>('')

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string>('')

  useEffect(() => {
    if (!isOpen) return
    inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages, isStreaming, voiceState, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const stopAudio = useCallback((): void => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = ''
    }
    setIsSpeaking(false)
  }, [])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop())
      stopAudio()
    }
  }, [stopAudio])

  const speak = useCallback(
    async (text: string): Promise<void> => {
      stopAudio()

      try {
        const response = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) return

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        audioUrlRef.current = url

        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => stopAudio()
        setIsSpeaking(true)
        await audio.play()
      } catch {
        setIsSpeaking(false)
      }
    },
    [stopAudio],
  )

  const sendMessage = async (
    rawText: string,
    options: { speakReply?: boolean } = {},
  ): Promise<void> => {
    const text = rawText.trim().slice(0, ASSISTANT_MAX_CHARS)
    if (text.length === 0 || isStreaming) return

    setNotice('')
    stopAudio()

    const history: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setIsStreaming(true)

    if (messages.length === 0) {
      trackMetaEvent('Lead', { source: 'ai_assistant_first_message' })
    }

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error('assistant_unavailable')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let answer = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break

        answer += decoder.decode(value, { stream: true })
        setMessages([...history, { role: 'assistant', content: answer }])
      }

      if (answer.trim().length === 0) {
        setMessages([...history, { role: 'assistant', content: ERROR_MESSAGE }])
        return
      }

      if (options.speakReply ?? isVoiceReplyOn) {
        void speak(toPlainText(answer))
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      setMessages([...history, { role: 'assistant', content: ERROR_MESSAGE }])
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const transcribeAndSend = async (blob: Blob): Promise<void> => {
    setVoiceState('transcribing')

    try {
      const form = new FormData()
      form.append('audio', blob, 'message.webm')

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: form,
      })

      const result = (await response.json()) as { text?: string; error?: string }

      if (!response.ok || !result.text) {
        setNotice(result.error ?? ERROR_MESSAGE)
        return
      }

      setVoiceState('idle')
      setIsVoiceReplyOn(true)
      await sendMessage(result.text, { speakReply: true })
    } catch {
      setNotice(ERROR_MESSAGE)
    } finally {
      setVoiceState('idle')
    }
  }

  const startRecording = async (): Promise<void> => {
    setNotice('')
    stopAudio()

    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setNotice(MIC_DENIED_MESSAGE)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = pickMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        recorderRef.current = null
        const blob = new Blob(chunks, { type: mimeType ?? 'audio/webm' })
        if (blob.size < 1200) {
          setVoiceState('idle')
          setNotice("Message trop court. Maintenez le micro et parlez.")
          return
        }
        void transcribeAndSend(blob)
      }

      recorderRef.current = recorder
      recorder.start()
      setVoiceState('recording')
      trackMetaEvent('Contact', { source: 'ai_assistant_voice' })
    } catch {
      setNotice(MIC_DENIED_MESSAGE)
      setVoiceState('idle')
    }
  }

  const stopRecording = (): void => {
    const recorder = recorderRef.current
    if (recorder && recorder.state === 'recording') {
      recorder.stop()
    }
  }

  const handleMicClick = (): void => {
    if (voiceState === 'recording') {
      stopRecording()
      return
    }
    if (voiceState === 'idle' && !isStreaming) {
      void startRecording()
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    void sendMessage(input)
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage(input)
    }
  }

  const handleVoiceReplyToggle = (): void => {
    setIsVoiceReplyOn((current) => {
      if (current) stopAudio()
      return !current
    })
  }

  const handleWhatsAppClick = (): void => {
    const message =
      'Bonjour! Je souhaite obtenir un devis pour vos services de fermeture et sécurité.'
    trackMetaEvent('Contact', { source: 'ai_assistant_whatsapp' })
    window.open(
      `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`,
      '_blank',
    )
  }

  if (!isOpen) return null

  const lastMessage = messages[messages.length - 1]
  const isWaitingFirstToken =
    isStreaming &&
    lastMessage?.role === 'assistant' &&
    lastMessage.content.length === 0

  const micLabel =
    voiceState === 'recording'
      ? "Arrêter l'enregistrement et envoyer"
      : 'Parler à l’assistant vocal'

  return (
    <div
      className="fixed inset-x-4 bottom-24 z-50 flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[400px]"
      style={{ maxHeight: 'min(72vh, 660px)' }}
      role="dialog"
      aria-label="Assistant IA Walid Fermeture"
    >
      <div className="flex items-start justify-between gap-3 bg-gradient-to-br from-[#0B3C49] to-[#18A999] px-5 py-4 text-white">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/70">
            Assistant IA
          </p>
          <p className="mt-1 text-base font-semibold">Walid Fermeture</p>
          <p className="mt-1 text-[11px] text-white/80">
            Estimation de prix immédiate • 24/7
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleVoiceReplyToggle}
            type="button"
            aria-pressed={isVoiceReplyOn}
            aria-label={
              isVoiceReplyOn
                ? 'Désactiver la réponse vocale'
                : 'Activer la réponse vocale'
            }
            title={
              isVoiceReplyOn ? 'Réponse vocale activée' : 'Réponse vocale désactivée'
            }
            className={`rounded-full px-2 py-1 text-sm transition-colors ${
              isVoiceReplyOn
                ? 'bg-white/25 text-white'
                : 'text-white/60 hover:bg-white/15 hover:text-white'
            }`}
          >
            {isVoiceReplyOn ? '🔊' : '🔇'}
          </button>
          <button
            onClick={onClose}
            type="button"
            aria-label="Fermer l&apos;assistant"
            className="rounded-full px-2 py-1 text-xl leading-none text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 px-4 py-4"
      >
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-neutral-700 shadow-sm">
          {ASSISTANT_GREETING}
        </div>

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === 'user'
                ? 'ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-[#0B3C49] px-4 py-3 text-sm leading-relaxed text-white shadow-sm'
                : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-neutral-700 shadow-sm'
            }
          >
            {toPlainText(message.content)}
          </div>
        ))}

        {isWaitingFirstToken && (
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
            <span className="inline-flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#18A999] [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#18A999] [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#18A999]" />
            </span>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {ASSISTANT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void sendMessage(suggestion)}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-[#18A999] hover:text-[#0B3C49]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {(voiceState !== 'idle' || isSpeaking || notice.length > 0) && (
        <div className="border-t border-neutral-200 bg-white px-4 py-2 text-[11px] text-neutral-500">
          {voiceState === 'recording' && (
            <span className="flex items-center gap-2 font-semibold text-[#0B3C49]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Enregistrement… appuyez à nouveau pour envoyer.
            </span>
          )}
          {voiceState === 'transcribing' && <span>Transcription en cours…</span>}
          {voiceState === 'idle' && isSpeaking && (
            <button
              type="button"
              onClick={stopAudio}
              className="font-semibold text-[#18A999] underline underline-offset-2"
            >
              L&apos;assistant parle — couper le son
            </button>
          )}
          {voiceState === 'idle' && !isSpeaking && notice.length > 0 && (
            <span className="text-red-600">{notice}</span>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-neutral-200 bg-white px-3 py-3"
      >
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isStreaming || voiceState === 'transcribing'}
            aria-label={micLabel}
            title={micLabel}
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-base transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              voiceState === 'recording'
                ? 'animate-pulse bg-red-500 text-white'
                : 'border border-neutral-300 text-[#0B3C49] hover:border-[#18A999] hover:bg-[#18A999]/10'
            }`}
          >
            {voiceState === 'recording' ? '■' : '🎙'}
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={ASSISTANT_MAX_CHARS}
            placeholder="Décrivez votre besoin ou parlez…"
            className="max-h-28 flex-1 resize-none rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#18A999]"
          />
          <button
            type="submit"
            disabled={isStreaming || input.trim().length === 0}
            className="rounded-full bg-[#0B3C49] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#18A999] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Envoi
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-neutral-400">
          <span>Estimations indicatives — devis gratuit confirmé.</span>
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="whitespace-nowrap font-semibold text-[#18A999] underline underline-offset-2"
          >
            {DISPLAY_PHONE}
          </button>
        </div>
      </form>
    </div>
  )
}
