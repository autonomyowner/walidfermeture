const serviceAreas = [
  'Paris',
  'Île-de-France',
  'Val-de-Marne',
  'Hauts-de-Seine',
  'Seine-Saint-Denis',
  'Paris & IDF',
]

export const LocationMap = (): JSX.Element => {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white/90 px-6 py-10 shadow-sm">
        <h2 className="text-2xl font-elegant font-semibold text-neutral-900">
          Zone d&apos;intervention
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          Nous intervenons dans tout Paris et en Île-de-France. Notre équipe
          est disponible 24/7 pour vos urgences et vos projets de fermeture et
          sécurité.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-neutral-600 sm:grid-cols-2">
          {serviceAreas.map((area) => (
            <div
              key={area}
              className="rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3"
            >
              {area}
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-neutral-500">
          Délai moyen d&apos;intervention : 4h en Île-de-France
        </p>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white/80 px-6 py-10 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900">
          Notre localisation
        </h3>
        <div className="mt-6 h-64 overflow-hidden rounded-2xl border border-neutral-200">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2621.8076!2d2.4906!3d48.9385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66a5c8f5c8c8d%3A0x0!2s80%20Avenue%20Pierre%20Jouhet%2C%2093600%20Aulnay-sous-Bois!5e0!3m2!1sfr!2sfr!4v1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Notre localisation - 80 avenue Pierre Jouhet, 93600 Aulnay-sous-Bois"
          />
        </div>
        <div className="mt-6 grid gap-4 text-sm text-neutral-600">
          <div>
            <p className="font-semibold text-neutral-900">Adresse</p>
            <p className="mt-1">
              80 avenue Pierre Jouhet
              <br />
              93600 Aulnay-sous-Bois
            </p>
          </div>
          <div>
            <p className="font-semibold text-neutral-900">SIRET</p>
            <p className="mt-1">988 499 182 00018</p>
          </div>
          <div>
            <p className="font-semibold text-neutral-900">Couverture</p>
            <p className="mt-1">
              Disponibilité 24/7 pour urgences et dépannages dans toute
              l&apos;Île-de-France, avec délai moyen de 4h.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white/80 px-6 py-8 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900">
          Informations pratiques
        </h3>
        <div className="mt-4 grid gap-4 text-sm text-neutral-600">
          <div>
            <p className="font-semibold text-neutral-900">Visite gratuite</p>
            <p className="mt-1">
              Prise de cotes et conseil technique gratuits pour établir un
              devis précis et personnalisé.
            </p>
          </div>
          <div>
            <p className="font-semibold text-neutral-900">Garantie</p>
            <p className="mt-1">
              Toutes nos installations sont garanties avec service après-vente
              réactif et contrats de maintenance disponibles.
            </p>
          </div>
          <div>
            <p className="font-semibold text-neutral-900">Urgences 24/7</p>
            <p className="mt-1">
              Pour toute urgence, contactez-nous au 07 53 96 92 59. Intervention
              rapide garantie sur Paris et IDF.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
