import { ServicesList } from '@/components/ServicesList'
import { PricingSection } from '@/components/PricingSection'

export default function ServicesPage(): JSX.Element {
  return (
    <div className="min-h-screen px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
            Nos Services
          </p>
          <h1 className="mt-4 text-4xl font-elegant font-semibold text-neutral-900 sm:text-5xl">
            Services de fermeture, signalétique & web
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-neutral-600">
            Explorez nos solutions complètes de fermeture, sécurité et signalétique
            pour sécuriser et valoriser vos espaces à Paris et en Île-de-France.
            Désormais, en partenariat avec l&apos;agence SiteDZ, nous proposons aussi
            la création de sites web, vitrines et e-commerce, ainsi que l&apos;intégration
            d&apos;une réceptionniste IA disponible 24/7 dans votre écosystème.
          </p>
        </div>

        <div className="mt-16">
          <ServicesList />
        </div>

        <PricingSection />
      </div>
    </div>
  )
}
