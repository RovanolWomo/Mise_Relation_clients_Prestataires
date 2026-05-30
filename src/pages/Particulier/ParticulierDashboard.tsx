import { useState } from 'react'
import { Search, Plus, Clock, CheckCircle, AlertCircle, CreditCard, Star, Bell, LayoutDashboard, User, Smartphone, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { formatPrice, formatDate } from '@/lib/utils'
import { useT } from '@/i18n/I18nContext'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const demandes = [
  { id: 1, titre: 'Réparation fuite salle de bain', statut: 'en_cours' as const,   montant: 15000, dateIntervention: '2026-05-28', prestataire: 'Alain Mbeki',      categorie: 'Plomberie',    paye: false },
  { id: 2, titre: 'Installation prise électrique',  statut: 'terminee' as const,   montant: 8000,  dateIntervention: '2026-05-22', prestataire: 'Sandrine Ngo Biya', categorie: 'Électricité', paye: true  },
  { id: 3, titre: 'Dépannage réseau WiFi',           statut: 'en_attente' as const, montant: 5000,  dateIntervention: '2026-05-30', prestataire: undefined,           categorie: 'Informatique', paye: false },
]

const notifications = [
  { id: 1, message: 'Alain Mbeki a accepté votre demande de plomberie', type: 'success' as const, lu: false, createdAt: 'Il y a 30 min' },
  { id: 2, message: 'Rappel : intervention demain à 09h00',              type: 'info' as const,    lu: false, createdAt: 'Il y a 2h'    },
  { id: 3, message: 'Votre paiement de 8 000 FCFA a été confirmé',      type: 'success' as const, lu: true,  createdAt: 'Hier'          },
]

type Statut = 'en_attente' | 'en_cours' | 'terminee' | 'annulee' | 'acceptee'

const STATUT_COLORS: Record<Statut, string> = {
  en_attente: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
  acceptee:   'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  en_cours:   'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  terminee:   'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  annulee:    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
}

const PAYMENT_METHODS = [
  { id: 'mtn', name: 'MTN Mobile Money', color: 'bg-yellow-400', textColor: 'text-yellow-900', icon: '📱', desc: 'Paiement instantané via MTN MoMo' },
  { id: 'orange', name: 'Orange Money', color: 'bg-orange-500', textColor: 'text-white', icon: '🟠', desc: 'Paiement sécurisé via Orange Money' },
]

interface PayDemandePayload {
  id: number
  titre: string
  montant: number
}

function PaymentModal({ demande, onClose, onSuccess }: {
  demande: PayDemandePayload
  onClose: () => void
  onSuccess: () => void
}) {
  const [method, setMethod] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'choose' | 'confirm' | 'processing' | 'done'>('choose')

  async function handlePay() {
    if (!phone.trim()) return
    setStep('processing')
    await new Promise(r => setTimeout(r, 2200))
    setStep('done')
  }

  if (step === 'done') {
    return (
      <Modal isOpen onClose={onSuccess} title="Paiement confirmé">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-slate-900 dark:text-white mb-1">Paiement réussi !</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatPrice(demande.montant)} débités avec succès pour <strong>{demande.titre}</strong>
            </p>
          </div>
          <Button variant="primary" onClick={onSuccess}>Fermer</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Payer — ${demande.titre}`}
      footer={
        step === 'confirm' ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setStep('choose')}>Retour</Button>
            <Button variant="primary" size="sm" onClick={handlePay} disabled={!phone.trim()}>
              Confirmer {formatPrice(demande.montant)}
            </Button>
          </>
        ) : undefined
      }
    >
      {step === 'processing' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">Traitement en cours…</p>
          <p className="text-sm text-slate-500">Vérification du paiement sur {method === 'mtn' ? 'MTN MoMo' : 'Orange Money'}</p>
        </div>
      )}

      {step === 'choose' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Montant à payer : <span className="font-bold text-slate-900 dark:text-white">{formatPrice(demande.montant)}</span>
          </p>
          <div className="space-y-3">
            {PAYMENT_METHODS.map(pm => (
              <button
                key={pm.id}
                onClick={() => { setMethod(pm.id); setStep('confirm') }}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md active:scale-[0.98] text-left',
                  'border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600',
                )}
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0', pm.color)}>
                  {pm.icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{pm.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{pm.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-orange-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-400">
                {method === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-500">Montant : {formatPrice(demande.montant)}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Numéro {method === 'mtn' ? 'MTN' : 'Orange'} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder={method === 'mtn' ? '670 00 00 00' : '655 00 00 00'}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-all"
            />
          </div>
          <p className="text-xs text-slate-400">
            Vous recevrez une notification sur votre téléphone pour confirmer le paiement.
          </p>
        </div>
      )}
    </Modal>
  )
}

export function ParticulierDashboard() {
  const [tab, setTab] = useState<'demandes' | 'notifs'>('demandes')
  const { t } = useT()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [payTarget, setPayTarget] = useState<PayDemandePayload | null>(null)
  const [paidIds, setPaidIds] = useState<Set<number>>(new Set([2]))
  const unreadCount = notifications.filter(n => !n.lu).length

  const currentUser = user
    ? { prenom: user.prenom, role: 'particulier', avatar: user.prenom[0] + user.nom[0] }
    : { prenom: 'Invité', role: 'particulier', avatar: 'IN' }

  const cardStats = [
    { label: t.dashboard.active,        value: 2,                  icon: Clock,       color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
    { label: t.dashboard.done,          value: 7,                  icon: CheckCircle, color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'      },
    { label: t.dashboard.balance,       value: formatPrice(45000), icon: CreditCard,  color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'      },
    { label: t.dashboard.reviews_given, value: 5,                  icon: Star,        color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'  },
  ]

  const items: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Tableau de bord',    href: '/particulier'                                             },
    { icon: Clock,           label: t.dashboard.my_requests,   onClick: () => setTab('demandes'), active: tab === 'demandes' },
    { icon: Bell,            label: t.dashboard.notifications, onClick: () => setTab('notifs'),   active: tab === 'notifs',   badge: unreadCount },
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
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Gérez vos demandes de service</p>
          </div>
          <Link to="/particulier/nouvelle-demande">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" aria-hidden /> {t.dashboard.new_request}
            </Button>
          </Link>
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

        {/* Mes demandes */}
        {tab === 'demandes' && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-lg mb-1">{t.dashboard.my_requests}</h2>
            {demandes.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                <p className="text-slate-400 mb-4">{t.dashboard.no_requests}</p>
                <Link to="/services"><Button variant="primary">{t.dashboard.start}</Button></Link>
              </div>
            )}
            {demandes.map(d => {
              const isPaid = paidIds.has(d.id)
              return (
                <div key={d.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-sm transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="info">{d.categorie}</Badge>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUT_COLORS[d.statut]}`}>
                        {t.status[d.statut]}
                      </span>
                      {d.statut === 'terminee' && (
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                          isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
                        )}>
                          {isPaid ? '✓ Payé' : '⚠ Paiement en attente'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-slate-900 dark:text-white">{d.titre}</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                      {d.prestataire ? `Prestataire : ${d.prestataire}` : "En attente d'un prestataire"}
                      &nbsp;&middot;&nbsp;{formatDate(d.dateIntervention)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-display font-bold text-orange-700 dark:text-orange-400">{formatPrice(d.montant)}</p>
                    {d.statut === 'terminee' && !isPaid && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setPayTarget({ id: d.id, titre: d.titre, montant: d.montant })}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Payer
                      </Button>
                    )}
                    <Link to={`/particulier/demandes/${d.id}`}>
                      <Button variant="outline" size="sm">{t.common.details}</Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Notifications */}
        {tab === 'notifs' && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-lg mb-1">{t.dashboard.notifications}</h2>
            {notifications.map(n => (
              <div key={n.id} className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex items-start gap-4 transition-all ${n.lu ? 'border-slate-100 dark:border-slate-800' : 'border-orange-200 dark:border-orange-700 shadow-sm'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                  {n.type === 'success'
                    ? <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    : <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.lu ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.createdAt}</p>
                </div>
                {!n.lu && <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-2" aria-label="Non lu" />}
              </div>
            ))}
          </div>
        )}
      </main>

      {payTarget && (
        <PaymentModal
          demande={payTarget}
          onClose={() => setPayTarget(null)}
          onSuccess={() => {
            setPaidIds(prev => new Set([...prev, payTarget.id]))
            setPayTarget(null)
          }}
        />
      )}
    </DashboardLayout>
  )
}
