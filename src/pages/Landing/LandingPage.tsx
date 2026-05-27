import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, ArrowRight, Shield, Star, Clock, CheckCircle,
  Droplets, Zap, Hammer, Paintbrush, Wind, Monitor, TreePine, Building2,
  Users, Briefcase, ThumbsUp, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PrestationCard } from '@/components/common/PrestationCard'
import { StarRating } from '@/components/common/StarRating'
import { categories, prestations, stats } from '@/data/mock'

const iconMap: Record<string, React.ElementType> = {
  droplets: Droplets, zap: Zap, hammer: Hammer, paintbrush: Paintbrush,
  wind: Wind, monitor: Monitor, trees: TreePine, building: Building2,
}

const testimonials = [
  { id: 1, note: 5, commentaire: "J'ai trouve un electricien en moins de 2h. Travail impeccable, prix honnete.", auteur: 'Marie K.', ville: 'Yaounde', avatar: 'MK' },
  { id: 2, note: 5, commentaire: "Urgence plomberie resolue le soir meme. Prestataire professionnel et ponctuel.", auteur: 'Patrick N.', ville: 'Douala', avatar: 'PN' },
  { id: 3, note: 5, commentaire: "Interface simple, prestataires verifies. Je recommande a 100%.", auteur: 'Joelle A.', ville: 'Bafoussam', avatar: 'JA' },
]

const steps = [
  { icon: Search, title: 'Decrivez votre besoin', desc: 'Renseignez le type de service, votre localisation et vos disponibilites.' },
  { icon: Users, title: 'Choisissez un prestataire', desc: 'Comparez les profils verifies, notes et tarifs, puis reservez.' },
  { icon: CheckCircle, title: "Suivez l'intervention", desc: "Confirmez, suivez en temps reel et payez en toute securite." },
]

const trustPoints = [
  { icon: Shield, title: 'Prestataires verifies', desc: 'Chaque artisan est identifie et valide avant toute publication.' },
  { icon: Star, title: 'Avis authentiques', desc: 'Seuls les clients ayant reserve peuvent laisser un avis.' },
  { icon: Clock, title: 'Reponse en 2h max', desc: "Nos prestataires s'engagent a repondre rapidement." },
  { icon: ThumbsUp, title: 'Paiement securise', desc: "Votre paiement est libere apres validation de l'intervention." },
]

export function LandingPage() {
  const [query, setQuery] = useState('')

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* HERO */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
        style={{
          backgroundImage: 'url(/src/assets/Bk-img/fond2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
            Trouvez le bon{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
              prestataire technique
            </span>
            {' '}pres de chez vous
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connectez-vous avec des artisans qualifies pour tous vos travaux.
            Rapide, fiable, securise.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-black/30">
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="w-5 h-5 text-slate-400 shrink-0" aria-hidden />
                <input
                  type="search"
                  placeholder="Ex: Electricien à Yaoundé..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full py-2.5 text-slate-800 dark:text-white placeholder-slate-400 bg-transparent outline-none text-base"
                  aria-label="Rechercher un service"
                />
              </div>
              <Button variant="primary" size="lg" className="shrink-0 rounded-xl">
                Rechercher
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Button>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Populaire :&nbsp;
              {['Plomberie', 'Electricite', 'Informatique'].map(s => (
                <button key={s} className="underline underline-offset-2 hover:text-white transition-colors cursor-pointer mr-2 text-slate-300">
                  {s}
                </button>
              ))}
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 inset-x-0 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { v: `${stats.prestataires}+`, l: 'Prestataires' },
              { v: `${stats.particuliers}+`, l: 'Particuliers' },
              { v: `${stats.interventions}+`, l: 'Interventions' },
              { v: `${stats.satisfaction}%`, l: 'Satisfaction' },
            ].map(s => (
              <div key={s.l}>
                <p className="font-display font-bold text-2xl text-white">{s.v}</p>
                <p className="text-slate-400 text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Tous types de services
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
              Des professionnels disponibles dans chaque domaine.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map(cat => {
              const Icon = iconMap[cat.icone] ?? Briefcase
              return (
                <Link
                  key={cat.id}
                  to={`/services?cat=${cat.id}`}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-100/40 dark:hover:shadow-none transition-all duration-200 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden />
                  </div>
                  <div className="text-center">
                    <p className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">{cat.nom}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.count} prestataires</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section id="comment" className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Comment ca marche ?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
              Reservez un prestataire en quelques minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="relative flex flex-col items-center text-center gap-5">
                  {i < steps.length - 1 && (
                    <div aria-hidden className="hidden md:flex absolute top-8 left-[calc(50%+3.5rem)] right-0 items-center">
                      <div className="flex-1 h-px bg-blue-200 dark:bg-blue-800" />
                      <ChevronRight className="w-4 h-4 text-blue-300 dark:text-blue-700 -ml-1" />
                    </div>
                  )}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-300/30 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" aria-hidden />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-700 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-2">{step.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SERVICES EN VEDETTE */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-1">Services en vedette</h2>
              <p className="text-slate-500 dark:text-slate-400">Les mieux notes par la communaute</p>
            </div>
            <Link to="/services" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer">
              Voir tout <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {prestations.map(p => <PrestationCard key={p.id} prestation={p} />)}
          </div>
        </div>
      </section>

      {/* CONFIANCE */}
      <section className="py-20 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-8">
                Une plateforme pensee pour votre confiance
              </h2>
              <div className="space-y-6">
                {trustPoints.map(tp => {
                  const Icon = tp.icon
                  return (
                    <div key={tp.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-900/50 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-blue-400" aria-hidden />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-white mb-1">{tp.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{tp.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {testimonials.map(t => (
                <div key={t.id} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{t.auteur}</p>
                      <p className="text-slate-400 text-xs">{t.ville}</p>
                    </div>
                    <div className="ml-auto"><StarRating note={t.note} /></div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">"{t.commentaire}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 flex flex-col gap-5 hover:shadow-xl hover:shadow-blue-100/30 dark:hover:shadow-none transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">Je suis un particulier</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Trouvez rapidement un professionnel de confiance pour tous vos travaux.</p>
              </div>
              <Link to="/inscription?role=particulier">
                <Button variant="primary" size="lg">Trouver un prestataire <ArrowRight className="w-4 h-4" aria-hidden /></Button>
              </Link>
            </div>
            <div className="bg-blue-600 rounded-3xl p-8 flex flex-col gap-5 hover:bg-blue-700 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" aria-hidden />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">Je suis prestataire</h3>
                <p className="text-blue-200 leading-relaxed">Developpez votre activite et recevez des demandes qualifiees.</p>
              </div>
              <Link to="/inscription?role=prestataire">
                <Button variant="cta" size="lg">Proposer mes services <ArrowRight className="w-4 h-4" aria-hidden /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
