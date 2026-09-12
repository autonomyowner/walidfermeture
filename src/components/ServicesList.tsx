'use client'

import Image from 'next/image'

type Service = {
  id: string
  title: string
  description: string
  features: string[]
  image: string
  signature: string
  whatsappMessage: string
}

const services: Service[] = [
  {
    id: 'rideaux',
    title: 'Rideaux métalliques & volets roulants',
    description:
      'Installation, motorisation, dépannage et maintenance de rideaux métalliques et volets roulants pour commerces et particuliers.',
    features: [
      'Pose de rideaux métalliques manuels et motorisés',
      'Lames pleines, micro-perforées, grilles cobra',
      'Déblocage et réparation 24/7',
      'Motorisation et automatisation',
      'Contrats de maintenance préventive',
    ],
    image:
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    signature: 'Sécurité 24/7',
    whatsappMessage:
      'Bonjour! Je suis intéressé(e) par vos services de rideaux métalliques et volets roulants. J\'aimerais obtenir un devis.',
  },
  {
    id: 'portes',
    title: 'Portes blindées',
    description:
      'Installation certifiée de portes blindées avec serrures multipoints pour une sécurité maximale de votre domicile ou commerce.',
    features: [
      'Installation certifiée et sécurisée',
      'Serrures multipoints haute sécurité',
      'Remplacement et renforts',
      'Habillages sur-mesure',
      'Mise aux normes assurance',
    ],
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    signature: 'Haute sécurité',
    whatsappMessage:
      'Bonjour! Je souhaite installer une porte blindée. Pourriez-vous me fournir plus de détails et un devis?',
  },
  {
    id: 'alu-pvc',
    title: 'Portes & fenêtres ALU/PVC',
    description:
      'Menuiserie ALU et PVC sur-mesure avec isolation thermique et phonique optimale pour votre confort.',
    features: [
      'Fabrication sur-mesure',
      'Isolation thermique & phonique',
      'Oscillo-battant, coulissant, fixe',
      'Double et triple vitrage',
      'Garantie décennale',
    ],
    image:
      'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=800&q=80',
    signature: 'Isolation pro',
    whatsappMessage:
      'Bonjour! Je suis intéressé(e) par des portes et fenêtres ALU/PVC. J\'aimerais avoir un devis personnalisé.',
  },
  {
    id: 'vitrines',
    title: 'Vitrines commerciales',
    description:
      'Installation et réparation de vitrines en verre sécurit anti-effraction pour protéger votre commerce.',
    features: [
      'Verre sécurit et trempé',
      'Protection anti-effraction',
      'Remplacement de vitres cassées',
      'Étanchéité et joints',
      'Intervention rapide',
    ],
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    signature: 'Protection commerce',
    whatsappMessage:
      'Bonjour! J\'ai besoin de services pour vitrines commerciales. Pouvez-vous me donner plus d\'informations?',
  },
  {
    id: 'enseignes',
    title: 'Enseignes lumineuses & néons',
    description:
      'Création, fabrication et installation d\'enseignes lumineuses LED et néons pour maximiser la visibilité de votre commerce.',
    features: [
      'Création et design sur-mesure',
      'Enseignes LED et néon flexible',
      'Caissons lumineux et lettres relief',
      'Mise aux normes électriques',
      'Maintenance et dépannage',
    ],
    image: '/projects/1.jpg',
    signature: 'Visibilité maximale',
    whatsappMessage:
      'Bonjour! Je cherche à créer une enseigne lumineuse pour mon commerce. J\'aimerais discuter des options disponibles.',
  },
  {
    id: 'garde-corps',
    title: 'Garde-corps',
    description:
      'Installation de garde-corps en acier, aluminium ou verre pour intérieur et extérieur, conformes aux normes de sécurité.',
    features: [
      'Acier, aluminium, verre',
      'Intérieur et extérieur',
      'Conformes aux normes NF',
      'Design moderne ou classique',
      'Installation professionnelle',
    ],
    image:
      'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80',
    signature: 'Sécurité normée',
    whatsappMessage:
      'Bonjour! J\'ai besoin d\'installer des garde-corps. Pouvez-vous me fournir un devis?',
  },
  {
    id: 'stores',
    title: 'Stores',
    description:
      'Installation de stores bannes, zip et intérieurs avec toiles techniques et motorisation pour votre confort.',
    features: [
      'Stores bannes pour terrasses',
      'Stores zip et verticaux',
      'Stores intérieurs',
      'Toiles techniques résistantes',
      'Motorisation et automatisation',
    ],
    image:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    signature: 'Confort & protection',
    whatsappMessage:
      'Bonjour! Je suis intéressé(e) par l\'installation de stores. J\'aimerais obtenir plus d\'informations.',
  },
  {
    id: 'site-web',
    title: 'Création de site web',
    description:
      'En partenariat avec l\'agence SiteDZ, nous concevons des sites web modernes et performants pour donner une présence digitale à votre activité.',
    features: [
      'Design sur-mesure et responsive',
      'Optimisation SEO et performance',
      'Hébergement et nom de domaine',
      'Maintenance et mises à jour',
      'Accompagnement personnalisé',
    ],
    image:
      'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=800&q=80',
    signature: 'Présence digitale',
    whatsappMessage:
      'Bonjour! Je suis intéressé(e) par la création d\'un site web (partenariat SiteDZ). J\'aimerais obtenir un devis.',
  },
  {
    id: 'site-vitrine',
    title: 'Site vitrine professionnel',
    description:
      'Un site vitrine élégant pour présenter votre entreprise, vos services et vos coordonnées. Réalisé avec notre partenaire SiteDZ.',
    features: [
      'Présentation claire de votre activité',
      'Pages services et galerie',
      'Formulaire de contact intégré',
      'Compatible mobile et tablette',
      'Référencement local optimisé',
    ],
    image:
      'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=800&q=80',
    signature: 'Image professionnelle',
    whatsappMessage:
      'Bonjour! Je souhaite créer un site vitrine pour mon activité (partenariat SiteDZ). Pouvez-vous m\'envoyer un devis?',
  },
  {
    id: 'site-ecommerce',
    title: 'Site e-commerce',
    description:
      'Lancez votre boutique en ligne avec catalogue produits, paiement sécurisé et gestion des commandes. Solution clé en main par SiteDZ.',
    features: [
      'Catalogue produits illimité',
      'Paiement sécurisé en ligne',
      'Gestion des stocks et commandes',
      'Tableau de bord administrateur',
      'Formation à la prise en main',
    ],
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    signature: 'Vendez en ligne',
    whatsappMessage:
      'Bonjour! Je voudrais créer un site e-commerce pour vendre mes produits en ligne (partenariat SiteDZ). J\'aimerais discuter du projet.',
  },
  {
    id: 'receptionniste-ia',
    title: 'Réceptionniste IA intégrée à votre écosystème',
    description:
      'Une réceptionniste virtuelle par intelligence artificielle qui répond à vos appels et messages 24/7, qualifie les demandes et prend les rendez-vous. Intégrée directement à votre site, votre WhatsApp et vos outils existants avec notre partenaire SiteDZ.',
    features: [
      'Réponse vocale et écrite 24/7, en français et en anglais',
      'Prise de rendez-vous et qualification des demandes',
      'Intégration site web, WhatsApp et téléphonie',
      'Transfert vers un conseiller humain si nécessaire',
      'Comptes rendus d\'appels et suivi des demandes',
    ],
    image:
      'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&w=800&q=80',
    signature: 'Disponible 24/7',
    whatsappMessage:
      'Bonjour! Je suis intéressé(e) par l\'intégration d\'une réceptionniste IA dans mon écosystème (site, WhatsApp, téléphone). J\'aimerais obtenir un devis.',
  },
]

export const ServicesList = (): JSX.Element => {
  const handleWhatsAppClick = (message: string): void => {
    const phoneNumber = '+33753969259'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="space-y-20">
      {services.map((service, index) => {
        const isReversed = index % 2 === 1
        return (
          <section
            key={service.id}
            id={service.id}
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
          >
            <div
              className={`relative overflow-hidden rounded-[32px] border border-neutral-200 bg-white/85 shadow-lg ${
                isReversed ? 'lg:order-2' : ''
              }`}
            >
            <div className="relative aspect-[4/3]">
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/35 via-transparent to-white/10" />
            </div>
            <div className="flex items-center justify-between px-6 py-5">
              <span className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                {service.signature}
              </span>
              <span className="text-xs uppercase tracking-[0.35em] text-neutral-400">
                Walid Fermeture
              </span>
            </div>
            </div>

            <div className={`space-y-6 ${isReversed ? 'lg:order-1' : ''}`}>
            <div>
              <h2 className="text-3xl font-elegant font-semibold text-neutral-900">
                {service.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                {service.description}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                Compris dans nos prestations
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600">
                {service.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <div>
              <button
                type="button"
                onClick={() => handleWhatsAppClick(service.whatsappMessage)}
                className="rounded-full bg-[#0B3C49] px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition-colors duration-200 hover:bg-[#18A999]"
              >
                Demander un devis
              </button>
            </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
