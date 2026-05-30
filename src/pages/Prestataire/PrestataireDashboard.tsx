import { useState, useEffect } from 'react'
import { Plus, Clock, CheckCircle, Star, Eye, MessageSquare, LayoutDashboard, Inbox, Briefcase, User, Bell, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
  description: string
  statut: string
  montant?: number
  categorie?: string
  dateIntervention?: string
  localisation?: string
  createdAt: string
  particulier: { id: number; nom: string; prenom: string; avatar?: string; telephone?: string }
}

interface ApiService {
  id: number
  titre: string
  prix: number
  disponibilite: boolean
  category: { nom: string }
  _count?: { reviews: number }
}

interface ChatTarget { convId: number; user: { id: number; nom: string; prenom: string }; requestTitle?: string }

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
  acceptee:   'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  en_cours:   'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  terminee:   'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  annulee:    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
}

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'Assignée (en attente)', acceptee: 'Acceptée', en_cours: 'En cours',
  terminee: 'Terminée', annulee: 'Annulée',
}

export function PrestataireDashboard() {
  const [tab, setTab] = useState<'demandes' | 'prestations'>('demandes')
  const { t } = useT()
  const { user } = useAuth()
  const [demandes, setDemandes] = useState<ApiRequest[]>([])
  const [services, setServices] = useState<ApiService[]>([])
  const [loadingDemandes, setLoadingDemandes] = useState(false)
  const [chat, setChat] = useState<ChatTarget | null>(null)

  const currentUser = user
    ? { prenom: user.prenom, nom: user.nom, role: 'prestataire', avatar: user.prenom[0] + user.nom[0], avatarUrl: user.avatar || undefined }
    : { prenom: 'Prestataire', nom: '', role: 'prestataire', avatar: 'PR' }

  useEffect(() => {
    if (tab === 'demandes') loadDemandes()
    else if (tab === 'prestations') loadServices()
  }, [tab])

  async function loadDemandes() {
    setLoadingDemandes(true)
    try { setDemandes(await api.get<ApiRequest[]>('/requests/provider')) } catch (_) {}
    finally { setLoadingDemandes(false) }
  }

  async function loadServices() {
    try { setServices(await api.get<ApiService[]>('/services/my')) } catch (_) {}
  }

  async function acceptDemande(id: number) {
    try {
      await api.patch(`/requests/${id}/accept`, {})
      setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: 'ACCEPTEE' } : d))
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Erreur') }
  }

  async function openChat(demande: ApiRequest) {
    try {
      const conv = await api.post<{ id: number }>('/chat/start', {
        otherUserId: demande.particulier.id,
        requestId: demande.id,
      })
      setChat({ convId: conv.id, user: demande.particulier, requestTitle: demande.titre })
    } catch (e) {}
  }

  const activeCount = demandes.filter(d => ['EN_ATTENTE', 'ACCEPTEE', 'EN_COURS'].includes(d.statut.toUpperCase())).length
  const doneCount = demandes.filter(d => d.statut.toUpperCase() === 'TERMINEE').length

  const cardStats = [
    { label: 'Demandes actives', value: activeCount, icon: Clock, color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
    { label: 'Terminées',        value: doneCount,   icon: CheckCircle, color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { label: 'Note moyenne',     value: user?.verified ? '—' : 'En attente', icon: Star, color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
  ]

  const items: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Tableau de bord',  href: '/prestataire'                                  },
    { icon: Inbox,           label: 'Demandes reçues',  onClick: () => setTab('demandes'),    active: tab === 'demandes'    },
    { icon: Briefcase,       label: 'Mes prestations',  onClick: () => setTab('prestations'), active: tab === 'prestations' },
    { separator: true },
    { icon: Plus, label: 'Nouvelle prestation', href: '/prestataire/nouvelle-prestation' },
    { icon: Bell, label: 'Notifications',       href: '#' },
    { separator: true },
    { icon: User, label: 'Mon profil', href: '/prestataire/profil' },
  ]

  return (
    <DashboardLayout user={currentUser} items={items}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Bonjour, {currentUser.prenom} !
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Gérez vos prestations et demandes reçues</p>
          </div>
          <Link to="/prestataire/nouvelle-prestation">
            <Button variant="cta" size="sm">
              <Plus className="w-4 h-4" /> Nouvelle prestation
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {cardStats.map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.color)}>
                <s.icon className="w-4 h-4" />
              </div>
              <p className="font-display font-bold text-slate-900 dark:text-white text-xl">{s.value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Demandes reçues */}
        {tab === 'demandes' && (
          <div>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-lg mb-3">Demandes reçues</h2>
            {loadingDemandes && <p className="text-slate-400 text-sm">Chargement...</p>}
            {!loadingDemandes && demandes.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-10 text-center">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-600 dark:text-slate-400">Aucune demande pour l'instant</p>
                <p className="text-sm text-slate-400 mt-1">Les clients vous assigneront des demandes correspondant à votre domaine.</p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {demandes.map(d => {
                const statut = d.statut.toLowerCase() as string
                return (
                  <div key={d.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-sm transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', STATUT_COLORS[statut] || 'bg-slate-100 text-slate-600')}>
                            {STATUT_LABELS[statut] || d.statut}
                          </span>
                          {d.categorie && <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-full">{d.categorie}</span>}
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{d.titre}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{d.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 text-[10px] font-bold">
                              {d.particulier.prenom[0]}{d.particulier.nom[0]}
                            </div>
                            {d.particulier.prenom} {d.particulier.nom}
                          </span>
                          {d.localisation && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{d.localisation}</span>}
                          {d.dateIntervention && <span>{formatDate(d.dateIntervention)}</span>}
                          {d.montant && <span className="font-semibold text-orange-600 dark:text-orange-400">{formatPrice(d.montant)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => openChat(d)}>
                          <MessageSquare className="w-3.5 h-3.5" /> Chat
                        </Button>
                        {statut === 'en_attente' && (
                          <Button variant="cta" size="sm" onClick={() => acceptDemande(d.id)}>
                            Accepter
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

        {/* Mes prestations */}
        {tab === 'prestations' && (
          <div>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-lg mb-3">Mes prestations</h2>
            {services.length === 0 && (
              <p className="text-slate-400 text-sm mb-4">Vous n'avez pas encore de prestation publiée.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map(s => (
                <div key={s.id} className={cn('bg-white dark:bg-slate-900 rounded-2xl border p-5 hover:shadow-sm transition-all', s.disponibilite ? 'border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-700' : 'border-slate-100 dark:border-slate-800 opacity-60')}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">{s.category.nom}</p>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{s.titre}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={s.disponibilite ? 'success' : 'default'}>{s.disponibilite ? 'Actif' : 'Inactif'}</Badge>
                      <p className="font-bold text-orange-700 dark:text-orange-400 text-sm mt-1">{formatPrice(s.prix)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400"><Eye className="w-3 h-3 inline mr-1" />{s._count?.reviews || 0} avis</p>
                </div>
              ))}
              <Link to="/prestataire/nouvelle-prestation" className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-700 p-5 flex flex-col items-center justify-center gap-2 min-h-[120px] cursor-pointer transition-colors">
                <Plus className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <p className="font-semibold text-orange-600 dark:text-orange-400 text-sm">Ajouter une prestation</p>
              </Link>
            </div>
          </div>
        )}
      </main>

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
