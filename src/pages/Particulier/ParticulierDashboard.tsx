import { useState, useEffect } from 'react'
import { Search, Plus, Clock, CheckCircle, AlertCircle, CreditCard, Star, Bell, LayoutDashboard, User, Smartphone, Loader2, MessageSquare, UserCheck, MapPin, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import { useT } from '@/i18n/I18nContext'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { ChatPanel } from '@/components/chat/ChatPanel'

interface ApiRequest {
  id: number
  titre: string
  description?: string
  statut: string
  montant?: number
  categorie?: string
  dateIntervention?: string
  localisation?: string
  createdAt: string
  prestataire?: { id: number; nom: string; prenom: string; avatar?: string }
}

interface Prestataire {
  id: number; nom: string; prenom: string; avatar?: string
  categorie?: string; zone?: string; tarif?: number; experience?: string; avgNote?: number
}

interface ChatTarget { convId: number; user: { id: number; nom: string; prenom: string }; requestTitle?: string }

type Statut = 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee'

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
  acceptee:   'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  en_cours:   'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  terminee:   'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  annulee:    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
}

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente', acceptee: 'Acceptée',
  en_cours: 'En cours', terminee: 'Terminée', annulee: 'Annulée',
}

const PAYMENT_METHODS = [
  { id: 'mtn',    name: 'MTN Mobile Money', color: 'bg-yellow-400', textColor: 'text-yellow-900', icon: '📱', desc: 'Paiement instantané' },
  { id: 'orange', name: 'Orange Money',     color: 'bg-orange-500', textColor: 'text-white',      icon: '🟠', desc: 'Paiement sécurisé'  },
]

function PaymentModal({ demande, onClose, onSuccess }: { demande: { id: number; titre: string; montant: number }; onClose: () => void; onSuccess: () => void }) {
  const [method, setMethod] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'choose' | 'confirm' | 'processing' | 'done'>('choose')

  async function handlePay() {
    if (!phone.trim()) return
    setStep('processing')
    await new Promise(r => setTimeout(r, 2200))
    setStep('done')
  }

  if (step === 'done') return (
    <Modal isOpen onClose={onSuccess} title="Paiement confirmé">
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(demande.montant)} payés</p>
          <p className="text-sm text-slate-400 mt-1">Votre paiement a été confirmé</p>
        </div>
        <Button variant="primary" onClick={onSuccess}>Fermer</Button>
      </div>
    </Modal>
  )

  return (
    <Modal isOpen onClose={onClose} title={`Paiement — ${demande.titre}`}>
      {step === 'choose' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Montant : <strong>{formatPrice(demande.montant)}</strong></p>
          {PAYMENT_METHODS.map(pm => (
            <button key={pm.id} onClick={() => { setMethod(pm.id); setStep('confirm') }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-orange-300 transition-all text-left">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0', pm.color)}>{pm.icon}</div>
              <div><p className="font-semibold text-slate-800 dark:text-slate-200">{pm.name}</p><p className="text-xs text-slate-400">{pm.desc}</p></div>
            </button>
          ))}
        </div>
      )}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-400">{method === 'mtn' ? 'MTN MoMo' : 'Orange Money'} — {formatPrice(demande.montant)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Numéro <Smartphone className="w-3.5 h-3.5 inline ml-1" /></label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={method === 'mtn' ? '670 00 00 00' : '655 00 00 00'}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <Button variant="primary" onClick={handlePay} className="w-full" disabled={!phone.trim()}>
            Confirmer le paiement
          </Button>
        </div>
      )}
      {step === 'processing' && (
        <div className="flex flex-col items-center py-8 gap-4">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-slate-500">Traitement en cours...</p>
        </div>
      )}
    </Modal>
  )
}

export function ParticulierDashboard() {
  const [tab, setTab] = useState<'demandes' | 'notifs' | 'services'>('demandes')
  const { t } = useT()
  const { user } = useAuth()
  const [payTarget, setPayTarget] = useState<{ id: number; titre: string; montant: number } | null>(null)
  const [paidIds, setPaidIds] = useState<Set<number>>(new Set())
  const [demandes, setDemandes] = useState<ApiRequest[]>([])
  const [chat, setChat] = useState<ChatTarget | null>(null)

  // Assign modal
  const [assignTarget, setAssignTarget] = useState<ApiRequest | null>(null)
  const [prestataires, setPrestataires] = useState<Prestataire[]>([])
  const [loadingPrestas, setLoadingPrestas] = useState(false)

  const unreadCount = 0

  useEffect(() => {
    loadDemandes()
  }, [])

  async function loadDemandes() {
    try { setDemandes(await api.get<ApiRequest[]>('/requests/my')) } catch (_) {}
  }

  async function openAssignModal(demande: ApiRequest) {
    setAssignTarget(demande)
    setLoadingPrestas(true)
    try {
      const url = demande.categorie
        ? `/users/prestataires?categorie=${encodeURIComponent(demande.categorie)}&verified=true`
        : `/users/prestataires?verified=true`
      setPrestataires(await api.get<Prestataire[]>(url))
    } catch (_) { setPrestataires([]) }
    finally { setLoadingPrestas(false) }
  }

  async function handleAssign(prestataireId: number) {
    if (!assignTarget) return
    try {
      await api.patch(`/requests/${assignTarget.id}/assign`, { prestataireId })
      setDemandes(prev => prev.map(d => d.id === assignTarget.id
        ? { ...d, statut: 'ASSIGNEE', prestataire: prestataires.find(p => p.id === prestataireId) }
        : d
      ))
      setAssignTarget(null)
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Erreur') }
  }

  async function openChat(demande: ApiRequest) {
    if (!demande.prestataire) return
    try {
      const conv = await api.post<{ id: number }>('/chat/start', {
        otherUserId: demande.prestataire.id,
        requestId: demande.id,
      })
      setChat({ convId: conv.id, user: demande.prestataire, requestTitle: demande.titre })
    } catch (_) {}
  }

  const currentUser = user
    ? { prenom: user.prenom, nom: user.nom, role: 'particulier', avatar: user.prenom[0] + user.nom[0], avatarUrl: user.avatar || undefined }
    : { prenom: 'Invité', nom: '', role: 'particulier', avatar: 'IN' }

  const activeCount = demandes.filter(d => ['acceptee', 'en_cours', 'en_attente'].includes(d.statut.toLowerCase())).length
  const doneCount   = demandes.filter(d => d.statut.toLowerCase() === 'terminee').length

  const cardStats = [
    { label: 'Demandes actives', value: activeCount, icon: Clock,       color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
    { label: 'Terminées',        value: doneCount,   icon: CheckCircle, color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'      },
    { label: 'Total demandes',   value: demandes.length, icon: Star,    color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'  },
  ]

  const items: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Tableau de bord',     href: '/particulier' },
    { icon: Clock,           label: 'Mes demandes',        onClick: () => setTab('demandes'), active: tab === 'demandes' },
    { icon: Bell,            label: 'Notifications',       onClick: () => setTab('notifs'),   active: tab === 'notifs',  badge: unreadCount },
    { separator: true },
    { icon: Search, label: 'Trouver un service',  onClick: () => setTab('services'), active: tab === 'services' },
    { icon: Plus,   label: 'Nouvelle demande',    href: '/particulier/nouvelle-demande' },
    { separator: true },
    { icon: User,   label: 'Mon profil',          href: '/particulier/profil' },
  ]

  return (
    <DashboardLayout user={currentUser} items={items}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Bonjour, {currentUser.prenom} !
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Gérez vos demandes de service</p>
          </div>
          <Link to="/particulier/nouvelle-demande">
            <Button variant="primary" size="sm"><Plus className="w-4 h-4" /> Nouvelle demande</Button>
          </Link>
        </div>

        {/* Stats — 3 cards, pas de solde */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {cardStats.map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="font-display font-bold text-slate-900 dark:text-white text-xl">{s.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mes demandes */}
        {tab === 'demandes' && (
          <div>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-lg mb-3">Mes demandes</h2>
            {demandes.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                <p className="text-slate-400 mb-4">Aucune demande pour l'instant.</p>
                <Link to="/particulier/nouvelle-demande"><Button variant="primary">Créer une demande</Button></Link>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {demandes.map(d => {
                const statut = d.statut.toLowerCase()
                const isPaid = paidIds.has(d.id)
                const canAssign = statut === 'en_attente'
                const hasPrestataire = !!d.prestataire
                return (
                  <div key={d.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-sm transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', STATUT_COLORS[statut] || 'bg-slate-100 text-slate-600')}>
                            {STATUT_LABELS[statut] || d.statut}
                          </span>
                          {d.categorie && <Badge variant="info">{d.categorie}</Badge>}
                          {statut === 'terminee' && (
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold', isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                              {isPaid ? '✓ Payé' : '⚠ Paiement en attente'}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{d.titre}</h3>
                        <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500">
                          {d.prestataire ? (
                            <span className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 text-[9px] font-bold">
                                {d.prestataire.prenom[0]}{d.prestataire.nom[0]}
                              </div>
                              {d.prestataire.prenom} {d.prestataire.nom}
                            </span>
                          ) : (
                            <span className="text-amber-500">En attente d'un prestataire</span>
                          )}
                          {d.localisation && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{d.localisation}</span>}
                          {d.dateIntervention && <span>{formatDate(d.dateIntervention)}</span>}
                          {d.montant && <span className="font-semibold text-orange-600">{formatPrice(d.montant)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {canAssign && (
                          <Button variant="primary" size="sm" onClick={() => openAssignModal(d)}>
                            <UserCheck className="w-3.5 h-3.5" />
                            {hasPrestataire ? 'Changer' : 'Choisir prestataire'}
                          </Button>
                        )}
                        {hasPrestataire && !['annulee', 'en_attente'].includes(statut) && (
                          <Button variant="outline" size="sm" onClick={() => openChat(d)}>
                            <MessageSquare className="w-3.5 h-3.5" /> Chat
                          </Button>
                        )}
                        {statut === 'terminee' && !isPaid && d.montant && (
                          <Button variant="cta" size="sm" onClick={() => setPayTarget({ id: d.id, titre: d.titre, montant: d.montant! })}>
                            <CreditCard className="w-3.5 h-3.5" /> Payer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Trouver un service */}
        {tab === 'services' && (
          <div>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-lg mb-3">Trouver un service</h2>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Parcourir les services</p>
              <p className="text-sm text-slate-400 mb-6">Découvrez les prestataires disponibles près de chez vous</p>
              <Link to="/services"><Button variant="primary">Parcourir les services</Button></Link>
            </div>
          </div>
        )}

        {/* Notifications */}
        {tab === 'notifs' && (
          <div>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-lg mb-3">Notifications</h2>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">Aucune notification</p>
            </div>
          </div>
        )}
      </main>

      {/* Modal assignation prestataire */}
      {assignTarget && (
        <Modal
          isOpen={!!assignTarget}
          onClose={() => setAssignTarget(null)}
          title={`Choisir un prestataire — ${assignTarget.titre}`}
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {loadingPrestas && (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>
            )}
            {!loadingPrestas && prestataires.length === 0 && (
              <div className="text-center py-6">
                <p className="text-slate-500">Aucun prestataire vérifié disponible{assignTarget.categorie ? ` en ${assignTarget.categorie}` : ''}.</p>
                <Link to="/prestataires" className="text-orange-600 text-sm mt-2 block hover:underline">Voir tous les prestataires →</Link>
              </div>
            )}
            {prestataires.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                  {p.prenom[0]}{p.nom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{p.prenom} {p.nom}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-0.5">
                    {p.categorie && <span>{p.categorie}</span>}
                    {p.zone && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{p.zone}</span>}
                    {p.tarif && <span className="text-orange-600 font-medium">{formatPrice(p.tarif)}/int.</span>}
                    {p.avgNote && <span>⭐ {p.avgNote.toFixed(1)}</span>}
                  </div>
                </div>
                <Button variant="primary" size="sm" onClick={() => handleAssign(p.id)}>
                  Choisir
                </Button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {payTarget && (
        <PaymentModal
          demande={payTarget}
          onClose={() => setPayTarget(null)}
          onSuccess={() => { setPaidIds(prev => new Set([...prev, payTarget.id])); setPayTarget(null) }}
        />
      )}

      {chat && (
        <ChatPanel
          conversationId={chat.convId}
          otherUser={chat.user}
          requestTitle={chat.requestTitle}
          onClose={() => setChat(null)}
        />
      )}
    </DashboardLayout>
  )
}
