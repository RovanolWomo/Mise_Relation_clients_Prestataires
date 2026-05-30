import { useState } from 'react'
import { Plus, TrendingUp, Clock, CheckCircle, Star, DollarSign, Eye, MessageSquare, LayoutDashboard, Inbox, Briefcase, User, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { formatPrice, formatDate } from '@/lib/utils'
import { useT } from '@/i18n/I18nContext'
import { useAuth } from '@/context/AuthContext'

const demandes = [
  { id: 1, titre: 'Réparation fuite salle de bain',  statut: 'en_cours' as const,   montant: 15000, dateIntervention: '2026-05-28', client: 'Marie K.',   localisation: 'Yaoundé Centre' },
  { id: 2, titre: 'Installation chauffe-eau',         statut: 'en_attente' as const, montant: 25000, dateIntervention: '2026-05-31', client: 'Patrick N.', localisation: 'Bastos'         },
  { id: 3, titre: 'Remplacement robinets cuisine',    statut: 'terminee' as const,   montant: 10000, dateIntervention: '2026-05-20', client: 'Joëlle A.',  localisation: 'Mvan'           },
]

const mesPrestations = [
  { id: 1, titre: 'Réparation fuite urgente',        avisCount: 34, vues: 120, prix: 15000, actif: true  },
  { id: 2, titre: 'Installation sanitaire complète', avisCount: 22, vues: 87,  prix: 60000, actif: true  },
  { id: 3, titre: 'Détartrage chauffe-eau',           avisCount: 8,  vues: 41,  prix: 8000,  actif: false },
]

type Statut = 'en_attente' | 'en_cours' | 'terminee' | 'annulee' | 'acceptee'
const STATUT_COLORS: Record<Statut, string> = {
  en_attente: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
  acceptee:   'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  en_cours:   'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  terminee:   'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  annulee:    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
}

export function PrestataireDashboard() {
  const [tab, setTab] = useState<'demandes' | 'prestations'>('demandes')
  const { t } = useT()
  const { user } = useAuth()

  const currentUser = user
    ? { prenom: user.prenom, role: 'prestataire', avatar: user.prenom[0] + user.nom[0] }
    : { prenom: 'Prestataire', role: 'prestataire', avatar: 'PR' }

  const cardStats = [
    { label: t.dashboard.active,  value: '3',                 icon: Clock,       color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',   delta: '+2 cette semaine' },
    { label: t.dashboard.done,    value: '28',                icon: CheckCircle, color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',        delta: '+5 ce mois'       },
    { label: t.dashboard.balance, value: formatPrice(125000), icon: DollarSign,  color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',        delta: 'Retrait possible' },
    { label: 'Note moyenne',      value: '4.8 / 5',           icon: Star,        color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',    delta: '34 avis'          },
  ]

  const items: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Tableau de bord',  href: '/prestataire'                                  },
    { icon: Inbox,            label: 'Demandes reçues',  onClick: () => setTab('demandes'),    active: tab === 'demandes'    },
    { icon: Briefcase,        label: 'Mes prestations',  onClick: () => setTab('prestations'), active: tab === 'prestations' },
    { separator: true },
    { icon: Plus,  label: 'Nouvelle prestation', href: '/prestataire/nouvelle-prestation' },
    { icon: Bell,  label: 'Notifications',       href: '#'                                },
    { separator: true },
    { icon: User,  label: 'Mon profil',          href: '/prestataire/profil'              },
  ]

  return (
    <DashboardLayout user={currentUser} items={items}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {t.dashboard.hello}, {currentUser.prenom} !
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Gérez vos prestations et répondez aux demandes</p>
          </div>
          <Link to="/prestataire/nouvelle-prestation">
            <Button variant="cta" size="sm">
              <Plus className="w-4 h-4" aria-hidden /> Nouvelle prestation
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cardStats.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                    <Icon className="w-4 h-4" aria-hidden />
                  </div>
                  <TrendingUp className="w-3.5 h-3.5 text-green-500 ml-auto" aria-hidden />
                </div>
                <p className="font-display font-bold text-slate-900 dark:text-white text-xl mb-0.5">{s.value}</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs">{s.label}</p>
                <p className="text-green-600 dark:text-green-400 text-xs mt-1 font-medium">{s.delta}</p>
              </div>
            )
          })}
        </div>

        {/* Demandes reçues */}
        {tab === 'demandes' && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-lg mb-1">Demandes reçues</h2>
            {demandes.map(d => (
              <div key={d.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-sm transition-all">
                <div className="flex-1 min-w-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1 ${STATUT_COLORS[d.statut]}`}>
                    {t.status[d.statut]}
                  </span>
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white">{d.titre}</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                    Client : {d.client} &middot; {d.localisation} &middot; {formatDate(d.dateIntervention)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-display font-bold text-orange-700 dark:text-orange-400">{formatPrice(d.montant)}</p>
                  {d.statut === 'en_attente' && (
                    <Button variant="cta" size="sm">Accepter</Button>
                  )}
                  <Link to={`/prestataire/demandes/${d.id}`}>
                    <Button variant="outline" size="sm">{t.common.details}</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mes prestations */}
        {tab === 'prestations' && (
          <div>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-lg mb-3">Mes prestations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mesPrestations.map(p => (
                <div key={p.id} className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 hover:shadow-sm transition-all ${p.actif ? 'border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-700' : 'border-slate-100 dark:border-slate-800 opacity-70'}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-display font-semibold text-slate-900 dark:text-white">{p.titre}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={p.actif ? 'success' : 'default'}>{p.actif ? 'Actif' : 'Inactif'}</Badge>
                      <p className="font-display font-bold text-orange-700 dark:text-orange-400">{formatPrice(p.prix)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" aria-hidden />{p.vues} vues</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" aria-hidden />{p.avisCount} avis</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">Modifier</Button>
                    <Button variant="secondary" size="sm" className="flex-1">Statistiques</Button>
                  </div>
                </div>
              ))}

              <Link
                to="/prestataire/nouvelle-prestation"
                className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-700 p-5 flex flex-col items-center justify-center gap-2 min-h-[160px] cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden />
                </div>
                <p className="font-semibold text-orange-600 dark:text-orange-400 text-sm">Ajouter une prestation</p>
              </Link>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
