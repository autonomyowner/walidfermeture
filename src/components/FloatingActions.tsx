'use client'

import { useEffect, useState } from 'react'
import { AiAssistantChat } from '@/components/AiAssistantChat'
import { trackMetaEvent } from '@/lib/metaPixel'

export const FloatingActions = (): JSX.Element => {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = (): void => {
      setIsVisible(window.scrollY > 300)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWhatsAppClick = (): void => {
    const phoneNumber = '+33753969259'
    const message =
      'Bonjour! Je souhaite obtenir un devis pour vos services de fermeture et sécurité.'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`
    trackMetaEvent('Contact', { source: 'floating_whatsapp' })
    window.open(whatsappUrl, '_blank')
  }

  const handleAssistantClick = (): void => {
    setIsChatOpen((current) => {
      if (!current) {
        trackMetaEvent('Contact', { source: 'floating_ai_assistant' })
      }
      return !current
    })
  }

  return (
    <>
      <AiAssistantChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <div
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 transition-all duration-500 ease-in-out ${
          isVisible || isChatOpen
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-16 opacity-0'
        }`}
      >
        <button
          onClick={handleAssistantClick}
          className="rounded-full bg-gradient-to-br from-[#0B3C49] to-[#18A999] px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:px-6 sm:tracking-[0.35em]"
          type="button"
          aria-expanded={isChatOpen}
          aria-label="Ouvrir l&apos;assistant IA"
        >
          {isChatOpen ? 'Fermer' : 'Assistant IA'}
        </button>
        <button
          onClick={handleWhatsAppClick}
          className="rounded-full border border-neutral-300 bg-white/95 px-5 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-800 shadow-lg backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:px-6 sm:tracking-[0.35em]"
          type="button"
          aria-label="Discuter sur WhatsApp"
        >
          WhatsApp
        </button>
      </div>
    </>
  )
}
