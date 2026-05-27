import { useState } from 'react'
import { Search, Plus, Clock, CheckCircle, AlertCircle, CreditCard, Star, Bell, LayoutDashboard, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { formatPrice, formatDate } from '@/lib/utils'
import { useT } from '@/i18n/I18nContext'

const currentUser = { prenom: 'Marie', role: 'particulier', avatar: 'MK' }

const demandes = [
  { id: 1, titre: 'Reparation fuite salle de bain', statut: 'en_cours' as const,   montant: 15000, dateIntervention: '2026-05-28', prestataire: 'Alain Mbeki',      categorie: 'Plomberie'    },
  { id: 2, titre: 'Installation prise electrique',  statut: 'terminee' as const,   montant: 8000,  dateIntervention: '2026-05-22', prestataire: 'Sandrine Ngo Biya', categorie: 'Electricite'  },
  { id: 3, titre: 'Depannage reseau WiFi',           statut: 'en_attente' as const, montant: 5000,  dateIntervention: '2026-05-30', prestataire: undefined,           categorie: 'Informatique' },
]

const notifications = [
  { id: 1, message: 'Alain Mbeki a accepte votre demande de plomberie', type: 'success' as const, lu: false, createdAt: 'Il y a 30 min' },
  { id: 2, message: 'Rappel : intervention demain a 09h00',              type: 'info' as const,    lu: false, createdAt: 'Il y a 2h'    },
  { id: 3, message: 'Votre paiement de 8 000 FCFA a ete confirme',      type: 'success' as const, lu: true,  createdAt: 'Hier'          },
]

type Statut = 'en_attente' | 'en_cours' | 'terminee' | 'annulee' | 'acceptee'

const STATUT_COLORS: Record<Statut, string> = {
  en_attente: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
  acceptee:   'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  en_cours:   'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  terminee:   'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  annulee:    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
}

export function ParticulierDashboard() {
  const [tab, setTab] = useState<'demandes' | 'notifs'>('demandes')
  const { t } = useT()
  const unreadCount = notifications.filter(n => !n.lu).length

  const cardStats = [
    { label: t.dashboard.active,        value: 2,                  icon: Clock,       color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: t.dashboard.done,          value: 7,                  icon: CheckCircle, color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { label: t.dashboard.balance,       value: formatPrice(45000), icon: CreditCard,  color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
    { label: t.dashboard.reviews_given, value: 5,                  icon: Star,        color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  ]

  const items: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Tableau de bord', href: '/particulier' },
    { icon: Clock, label: t.dashboard.my_requests, onClick: () => setTab('demandes'), active: tab === 'demandes' },
    { icon: Bell,  label: t.dashboard.notifications, onClick: () => setTab('notifs'), active: tab === 'notifs', badge: unreadCount },
    { separator: true },
    { icon: Search, label: t.dashboard.find_service, href: '/services' },
    { icon: Plus,   label: t.dashboard.new_request,  href: '/particulier/nouvelle-demande' },
    { separator: true },
    { icon: User, label: 'Mon profil', href: '/particulier/profil' },
  ]

  return (
    <DashboardLayout user={currentUser} items={items}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {t.dashboard.hello}, {currentUser.prenom} !
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Gerez vos demandes de service</p>
          </div>
          <div className="flex gap-2">
            <Link to="/services">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4" aria-hidden /> {t.dashboard.find_service}
              </Button>
            </Link>
            <Link to="/particulier/nouvelle-demande">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4" aria-hidden /> {t.dashboard.new_request}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cardStats.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-slate-900 dark:text-white text-xl">{s.value}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs truncate">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {tab === 'demandes' && (
          <div className="flex flex-col gap-3">
            {demandes.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                <p className="text-slate-400 mb-4">{t.dashboard.no_requests}</p>
                <Link to="/services"><Button variant="primary">{t.dashboard.start}</Button></Link>
              </div>
            )}
            {demandes.map(d => (
              <div key={d.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="info">{d.categorie}</Badge>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUT_COLORS[d.statut]}`}>
                      {t.status[d.statut]}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white">{d.titre}</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                    {d.prestataire ? `Prestataire : ${d.prestataire}` : "En attente d'un prestataire"}
                    &nbsp;&middot;&nbsp;{formatDate(d.dateIntervention)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-display font-bold text-blue-700 dark:text-blue-400">{formatPrice(d.montant)}</p>
                  <Link to={`/particulier/demandes/${d.id}`}>
                    <Button variant="outline" size="sm">{t.common.details}</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'notifs' && (
          <div className="flex flex-col gap-3">
            {notifications.map(n => (
              <div key={n.id} className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex items-start gap-4 transition-all ${n.lu ? 'border-slate-100 dark:border-slate-800' : 'border-blue-200 dark:border-blue-700 shadow-sm'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                  {n.type === 'success'
                    ? <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    : <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.lu ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.createdAt}</p>
                </div>
                {!n.lu && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" aria-label="Non lu" />}
              </div>
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
