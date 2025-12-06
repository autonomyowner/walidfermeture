import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { MetaPixel } from '@/components/MetaPixel'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Walid Fermeture – Rideaux métalliques, portes blindées & volets roulants à Paris (24/7)',
  description:
    'Pose, dépannage et maintenance de rideaux métalliques, portes blindées, volets roulants, ALU/PVC, vitrines et enseignes lumineuses à Paris. Intervention 24/7. Devis gratuit au 07 53 96 92 59.',
  keywords:
    'rideaux métalliques paris, portes blindées paris, volets roulants paris, enseignes lumineuses paris, dépannage 24/7, vitrines paris, fermeture métallique, porte alu pvc, néons paris',
  authors: [{ name: 'Walid Fermeture' }],
  creator: 'Walid Fermeture',
  publisher: 'Walid Fermeture',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.walidfermeture.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Walid Fermeture – Sécurité & signalétique à Paris',
    description:
      'Pose, dépannage et maintenance de rideaux métalliques, portes blindées, volets roulants, ALU/PVC, vitrines et enseignes lumineuses à Paris. Intervention 24/7.',
    url: 'https://www.walidfermeture.fr',
    siteName: 'Walid Fermeture',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Walid Fermeture – Sécurité & signalétique à Paris',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Walid Fermeture – Sécurité & signalétique à Paris',
    description:
      'Pose, dépannage et maintenance de rideaux métalliques, portes blindées, volets roulants, ALU/PVC, vitrines et enseignes lumineuses à Paris. Intervention 24/7.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body
        className={`${inter.className} bg-gradient-elegant min-h-screen text-slate-900`}
      >
        <MetaPixel />
        <Navbar />
        <main className="pt-20 md:pt-24 pb-20">{children}</main>
        <footer className="bg-slate-900 text-white py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#18A999] flex-shrink-0">
                    <Image
                      src="/logo.png"
                      alt="Walid Fermeture Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">Walid Fermeture</h3>
                </div>
                <p className="text-sm text-gray-400 mb-2">Paris, France • 24/7</p>
                <p className="text-sm text-gray-400">SIRET : 988 499 182 00018</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <p className="text-sm text-gray-400 mb-2">
                  <a href="tel:0753969259" className="hover:text-white transition-colors">
                    07 53 96 92 59
                  </a>
                </p>
                <p className="text-sm text-gray-400">
                  <a href="mailto:oualidataouli4@gmail.com" className="hover:text-white transition-colors">
                    oualidataouli4@gmail.com
                  </a>
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Liens légaux</h3>
                <div className="flex flex-col gap-2">
                  <a
                    href="/privacy"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Mentions légales
                  </a>
                  <a
                    href="/privacy"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Politique de confidentialité
                  </a>
                  <a
                    href="/privacy"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    CGV
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-6 text-center">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} Walid Fermeture. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
        <WhatsAppButton />
      </body>
    </html>
  )
}
