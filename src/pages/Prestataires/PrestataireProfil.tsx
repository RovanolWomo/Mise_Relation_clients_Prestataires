import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Star, Clock, Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProviderAvatar } from '@/components/common/ProviderAvatar'
import { formatPrice } from '@/lib/utils'
import { prestations } from '@/data/mock'

export function PrestataireProfil() {
  const { id } = useParams()
  const myPrestations = prestations.filter(p => p.prestataire.id === Number(id))
  const user = myPrestations[0]?.prestataire

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Prestataire introuvable.</p>
          <Link to="/prestataires"><Button variant="primary">Voir tous les prestataires</Button></Link>
        </div>
      </div>
    )
  }

  const totalAvis = myPrestations.reduce((acc, p) => acc + p.avisCount, 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Link
          to="/prestataires"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Retour aux prestataires
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center">
              <div className="flex justify-center mb-4">
                <ProviderAvatar avatar={user.avatar} size="2xl" />
              </div>
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
                {user.prenom} {user.nom}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{myPrestations[0]?.categorie.nom}</p>
              <p className="text-xs text-slate-400 mb-4">{totalAvis} avis clients</p>
              <div className="flex items-center justify-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-5">
                <MapPin className="w-3.5 h-3.5" aria-hidden />
                Yaounde, Cameroun
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="cta" size="md" className="w-full">Faire une demande</Button>
                <Button variant="outline" size="md" className="w-full">
                  <Phone className="w-4 h-4" aria-hidden />
                  Contacter
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <h2 className="font-display font-bold text-slate-900 dark:text-white text-sm mb-3">Certifications</h2>
              <div className="flex flex-col gap-2">
                {[
                  { icon: Shield,      label: 'Identite verifiee' },
                  { icon: CheckCircle, label: 'KYC valide' },
                  { icon: Clock,       label: 'Actif depuis 2024' },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Icon className="w-4 h-4 text-blue-500 shrink-0" aria-hidden />
                      {item.label}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Services + reviews */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">Services proposes</h2>
              <div className="flex flex-col gap-3">
                {myPrestations.map(p => (
                  <Link
                    key={p.id}
                    to={`/services/${p.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                        {p.titre}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{p.avisCount} avis</span>
                        {p.disponibilite
                          ? <Badge variant="success">Disponible</Badge>
                          : <Badge variant="warning">Indisponible</Badge>}
                      </div>
                    </div>
                    <p className="font-display font-bold text-blue-700 dark:text-blue-400 shrink-0 ml-4">
                      {formatPrice(p.prix)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Avis */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">Avis clients</h2>
              <div className="flex flex-col gap-4">
                {[
                  { auteur: 'Marie K.', note: 5, commentaire: 'Excellent, tres professionnel.', date: '20/05/2026' },
                  { auteur: 'Patrick N.', note: 4, commentaire: 'Bon travail, je recommande.', date: '10/05/2026' },
                ].map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold shrink-0">
                      {a.auteur.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.auteur}</span>
                        <span className="text-xs text-slate-400">{a.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`w-3 h-3 ${idx < a.note ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{a.commentaire}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
