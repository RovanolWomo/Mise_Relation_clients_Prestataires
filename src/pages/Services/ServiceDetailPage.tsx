import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, Shield, MessageSquare, Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProviderAvatar } from '@/components/common/ProviderAvatar'
import { formatPrice } from '@/lib/utils'
import { prestations } from '@/data/mock'

const mockAvis = [
  { id: 1, auteur: 'Marie K.', note: 5, commentaire: 'Excellent travail, tres professionnel et rapide.', date: '20/05/2026' },
  { id: 2, auteur: 'Patrick N.', note: 4, commentaire: 'Bon travail, ponctuel. Je recommande.', date: '15/05/2026' },
]

export function ServiceDetailPage() {
  const { id } = useParams()
  const prestation = prestations.find(p => p.id === Number(id))

  if (!prestation) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Service introuvable.</p>
          <Link to="/services"><Button variant="primary">Voir tous les services</Button></Link>
        </div>
      </div>
    )
  }

  const p = prestation

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Retour aux services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Service card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <Badge variant="info" className="mb-3">{p.categorie.nom}</Badge>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3">{p.titre}</h1>
              <div className="flex items-center gap-2 mb-4">
                {!p.disponibilite && <Badge variant="warning">Indisponible</Badge>}
                {p.disponibilite && <Badge variant="success">Disponible</Badge>}
                <span className="text-sm text-slate-400">{p.avisCount} avis</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{p.description}</p>
            </div>

            {/* Trust signals */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">Garanties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Shield,      label: 'Prestataire verifie', desc: 'Identite validee par notre equipe' },
                  { icon: Clock,       label: 'Reponse rapide',       desc: 'Sous 2h en moyenne' },
                  { icon: CheckCircle, label: 'Paiement securise',    desc: 'Libere apres validation' },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <Icon className="w-4 h-4 text-blue-600 mb-1" aria-hidden />
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-slate-400" aria-hidden />
                <h2 className="font-display font-bold text-slate-900 dark:text-white">Avis clients</h2>
              </div>
              <div className="flex flex-col gap-4">
                {mockAvis.map(a => (
                  <div key={a.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold shrink-0">
                      {a.auteur.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.auteur}</span>
                        <span className="text-xs text-slate-400">{a.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < a.note ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{a.commentaire}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: booking */}
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sticky top-24">
              {/* Provider */}
              <Link to={`/prestataires/${p.prestataire.id}`} className="flex items-center gap-3 mb-5 group">
                <ProviderAvatar avatar={p.prestataire.avatar} size="md" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    {p.prestataire.prenom} {p.prestataire.nom}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="w-3 h-3" aria-hidden />
                    Yaounde
                  </div>
                </div>
              </Link>

              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">A partir de</p>
                <p className="font-display font-bold text-2xl text-slate-900 dark:text-white">{formatPrice(p.prix)}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="cta" size="md" className="w-full" disabled={!p.disponibilite}>
                  {p.disponibilite ? 'Faire une demande' : 'Prestataire indisponible'}
                </Button>
                <Button variant="outline" size="md" className="w-full">
                  Contacter
                </Button>
              </div>

              <p className="text-xs text-slate-400 text-center mt-3">Aucun paiement avant confirmation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
