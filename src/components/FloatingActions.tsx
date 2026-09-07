'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { trackMetaEvent } from '@/lib/metaPixel'

// L'assistant ne pese sur aucun chargement de page : son code n'arrive
// qu'au premier clic sur le bouton.
const AiAssistantChat = dynamic(
  () => import('@/components/AiAssistantChat').then((mod) => mod.AiAssistantChat),
  { ssr: false },
)

const PHONE_NUMBER = '+33753969259'

const WhatsAppIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.41-9.4a9.35 9.35 0 0 1 6.65 2.76 9.32 9.32 0 0 1 2.75 6.65c0 5.19-4.22 9.41-9.4 9.41zM20.5 3.49A11.76 11.76 0 0 0 12.04 0C5.5 0 .18 5.32.18 11.86c0 2.09.55 4.13 1.59 5.93L.08 24l6.36-1.67a11.83 11.83 0 0 0 5.6 1.43h.01c6.53 0 11.85-5.32 11.85-11.86 0-3.17-1.23-6.15-3.4-8.4z" />
  </svg>
)

const SparkIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
    <path d="M12 2.5l1.9 5.1 5.1 1.9-5.1 1.9L12 16.5l-1.9-5.1L5 9.5l5.1-1.9L12 2.5zM18.5 14.5l.95 2.55 2.55.95-2.55.95-.95 2.55-.95-2.55-2.55-.95 2.55-.95.95-2.55zM5.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
  </svg>
)

export const FloatingActions = (): JSX.Element => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = (): void => {
      setIsVisible(window.scrollY > 300)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWhatsAppClick = (): void => {
    const message =
      'Bonjour! Je souhaite obtenir un devis pour vos services de fermeture et sécurité.'
    trackMetaEvent('Contact', { source: 'floating_whatsapp' })
    window.open(
      `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`,
      '_blank',
    )
  }

  const handleAssistantClick = (): void => {
    setIsChatOpen((current) => {
      if (!current) trackMetaEvent('Contact', { source: 'floating_ai_assistant' })
      return !current
    })
  }

  return (
    <>
      {isChatOpen && (
        <AiAssistantChat isOpen onClose={() => setIsChatOpen(false)} />
      )}

      <div
        className={`fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2.5 transition-opacity duration-300 sm:bottom-6 sm:right-6 sm:flex-row sm:items-center sm:gap-2 ${
          isVisible && !isChatOpen
            ? 'opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          onClick={handleWhatsAppClick}
          type="button"
          aria-label="Discuter sur WhatsApp"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 active:scale-95 sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-3"
        >
          <WhatsAppIcon />
          <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] sm:inline">
            WhatsApp
          </span>
        </button>

        <button
          onClick={handleAssistantClick}
          type="button"
          aria-label="Ouvrir l&apos;assistant IA"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0B3C49] to-[#18A999] text-white shadow-xl transition-transform duration-200 active:scale-95 sm:h-auto sm:w-auto sm:gap-2 sm:px-6 sm:py-3"
        >
          <SparkIcon />
          <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] sm:inline">
            Assistant IA
          </span>
        </button>
      </div>
    </>
  )
}
