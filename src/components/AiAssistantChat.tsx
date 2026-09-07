'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ASSISTANT_GREETING,
  ASSISTANT_MAX_CHARS,
  ASSISTANT_SUGGESTIONS,
} from '@/lib/aiAssistant'
import { trackMetaEvent } from '@/lib/metaPixel'

// Le transport temps reel ne se telecharge qu'au moment ou l'on appelle.
const VoiceCall = dynamic(
  () => import('@/components/VoiceCall').then((mod) => mod.VoiceCall),
  { ssr: false },
)

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const PHONE_NUMBER = '+33753969259'
const DISPLAY_PHONE = '07 53 96 92 59'

const ERROR_MESSAGE =
  "Désolé, je n'arrive pas à répondre pour le moment. Appelez-nous au 07 53 96 92 59, nous répondons 24/7."

// Le modele glisse parfois du markdown : on l'aplatit, la bulle affiche du texte brut.
const toPlainText = (content: string): string =>
  content
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[*+]\s+/gm, '- ')

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
  const [isCalling, setIsCalling] = useState<boolean>(false)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages, isStreaming, isCalling, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  // Sur telephone le panneau occupe tout l'ecran : on fige la page derriere
  // pour eviter le double defilement.
  useEffect(() => {
    if (!isOpen) return
    if (!window.matchMedia('(max-width: 639px)').matches) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  // Chaque tour de parole rejoint le fil, pour garder une trace ecrite de l'appel.
  const handleTranscript = useCallback(
    (role: 'user' | 'assistant', text: string): void => {
      setMessages((current) => [...current, { role, content: text }])
    },
    [],
  )

  const sendMessage = async (rawText: string): Promise<void> => {
    const text = rawText.trim().slice(0, ASSISTANT_MAX_CHARS)
    if (text.length === 0 || isStreaming) return

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
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      setMessages([...history, { role: 'assistant', content: ERROR_MESSAGE }])
    } finally {
      setIsStreaming(false)
      abortRef.current = null
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

  const handleCallToggle = (): void => {
    setIsCalling((current) => {
      if (!current) trackMetaEvent('Contact', { source: 'ai_assistant_voice_call' })
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

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-24 sm:right-6 sm:top-auto sm:max-h-[min(72vh,660px)] sm:w-[400px] sm:rounded-3xl sm:border sm:border-neutral-200 sm:shadow-2xl"
      style={{ overflow: 'hidden' }}
      role="dialog"
      aria-label="Assistant Walid Fermeture"
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
        <button
          onClick={onClose}
          type="button"
          aria-label="Fermer l&apos;assistant"
          className="-mr-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-2xl leading-none text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          ×
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-neutral-50 px-4 py-4"
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

        {messages.length === 0 && !isCalling && (
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

      {isCalling && (
        <VoiceCall
          onTranscript={handleTranscript}
          onEnded={() => setIsCalling(false)}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-neutral-200 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={handleCallToggle}
            aria-pressed={isCalling}
            aria-label={
              isCalling
                ? "Raccrocher l'appel vocal"
                : "Parler à l'assistant vocal"
            }
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-base transition-colors ${
              isCalling
                ? 'bg-red-500 text-white'
                : 'border border-neutral-300 text-[#0B3C49] hover:border-[#18A999] hover:bg-[#18A999]/10'
            }`}
          >
            {isCalling ? '■' : '🎙'}
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={ASSISTANT_MAX_CHARS}
            placeholder="Votre besoin…"
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-neutral-300 px-4 py-3 text-base text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#18A999] sm:text-sm"
          />
          <button
            type="submit"
            disabled={isStreaming || input.trim().length === 0}
            aria-label="Envoyer"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#0B3C49] text-lg text-white transition-colors hover:bg-[#18A999] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↑
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-neutral-400">
          <span>Estimations indicatives — devis gratuit.</span>
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
