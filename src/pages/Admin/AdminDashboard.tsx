import { useState, useEffect } from 'react'
import {
  Users, Briefcase, FileCheck, CheckCircle, XCircle, Eye,
  Plus, Trash2, Star, CreditCard, LayoutDashboard,
  UserPlus, Tag, TrendingUp,
  X, ZoomIn, ToggleLeft, ToggleRight, Search,
  RefreshCw, Package, Edit2
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn, formatPrice } from '@/lib/utils'
import { api } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

// ---- Types ----
interface Stats { totalUsers: number; totalPrestataires: number; pendingKyc: number; totalRequests: number; totalServices: number; activeRequests: number }
interface UserRow { id: number; nom: string; prenom: string; email: string; telephone?: string; role: string; statut: string; verified: boolean; categorie?: string; createdAt: string }
interface KycDossier extends UserRow { bio?: string; experience?: string; tarif?: number; zone?: string; kycDocuments?: { id: number; type: string; url: string; mimeType?: string }[] }
interface Category { id: number; nom: string; description?: string; icone?: string; _count?: { services: number } }
interface ServiceRow { id: number; titre: string; description: string; prix: number; featured: boolean; disponibilite: boolean; zone?: string; prestataire: { id: number; nom: string; prenom: string }; category: { id: number; nom: string }; categoryId: number; _count?: { reviews: number } }
interface RequestRow { id: number; titre: string; categorie?: string; statut: string; localisation?: string; createdAt: string; particulier: { nom: string; prenom: string }; prestataire?: { nom: string; prenom: string } }
interface PayConfig { id?: number; provider: string; enabled: boolean; merchantId?: string; apiKey?: string; webhookUrl?: string }

// ---- Util Badges ----
const RoleBadge = ({ role }: { role: string }) => {
  const colors: Record<string, string> = { ADMIN: 'bg-purple-100 text-purple-700', PRESTATAIRE: 'bg-green-100 text-green-700', PARTICULIER: 'bg-orange-100 text-orange-700' }
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', colors[role] || 'bg-slate-100 text-slate-600')}>{role}</span>
}
const StatusBadge = ({ statut }: { statut: string }) => {
  const colors: Record<string, string> = { ACTIF: 'bg-green-100 text-green-700', EN_ATTENTE_VERIFICATION: 'bg-amber-100 text-amber-700', SUSPENDU: 'bg-red-100 text-red-700', BANNI: 'bg-red-200 text-red-800', REJETE: 'bg-slate-100 text-slate-600' }
  const labels: Record<string, string> = { ACTIF: 'Actif', EN_ATTENTE_VERIFICATION: 'En attente KYC', SUSPENDU: 'Suspendu', BANNI: 'Banni', REJETE: 'Rejeté' }
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', colors[statut] || 'bg-slate-100 text-slate-600')}>{labels[statut] || statut}</span>
}

// ---- KYC Media Viewer ----
function MediaViewer({ doc }: { doc: { url: string; type: string; mimeType?: string } }) {
  const isPdf = doc.mimeType === 'application/pdf' || doc.url.includes('.pdf')
  const [zoom, setZoom] = useState(false)
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{doc.type}</p>
      {isPdf ? (
        <iframe src={doc.url} className="w-full h-40 rounded-lg border border-slate-200 dark:border-slate-700" title={doc.type} />
      ) : (
        <div className="relative group">
          <img src={doc.url} alt={doc.type} className="w-full h-36 object-cover rounded-lg border border-slate-200 dark:border-slate-700 cursor-zoom-in" onClick={() => setZoom(true)} />
          <button onClick={() => setZoom(true)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><ZoomIn className="w-3 h-3" /></button>
        </div>
      )}
      {zoom && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setZoom(false)}>
          <img src={doc.url} alt={doc.type} className="max-w-full max-h-full rounded-xl" onClick={e => e.stopPropagation()} />
          <button className="absolute top-4 right-4 text-white" onClick={() => setZoom(false)}><X className="w-6 h-6" /></button>
        </div>
      )}
    </div>
  )
}

// ---- Main Component ----
type Tab = 'overview' | 'users' | 'kyc' | 'register' | 'categories' | 'services' | 'requests' | 'payments'

const EMPTY_SERVICE_FORM = { titre: '', description: '', prix: '', categoryId: '', prestataireId: '', zone: '', disponibilite: true }

export function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')

  // Data states
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [kycList, setKycList] = useState<KycDossier[]>([])
  const [kycDetail, setKycDetail] = useState<KycDossier | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<ServiceRow[]>([])
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [prestataires, setPrestataires] = useState<UserRow[]>([])

  // UI states
  const [kycModalOpen, setKycModalOpen] = useState(false)
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceRow | null>(null)
  const [searchUsers, setSearchUsers] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceSearch, setServiceSearch] = useState('')

  // Forms
  const [newCat, setNewCat] = useState({ nom: '', description: '', icone: '' })
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', nom: '', prenom: '', telephone: '', role: 'PARTICULIER', categorie: '', experience: '', bio: '', tarif: '', zone: '' })
  const [payForm, setPayForm] = useState<Record<string, Partial<PayConfig>>>({})
  const [serviceForm, setServiceForm] = useState<typeof EMPTY_SERVICE_FORM>(EMPTY_SERVICE_FORM)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  const feedback = (msg: string) => { setFeedbackMsg(msg); setTimeout(() => setFeedbackMsg(null), 3000) }

  useEffect(() => {
    if (tab === 'overview') loadStats()
    else if (tab === 'users') loadUsers()
    else if (tab === 'kyc') loadKyc()
    else if (tab === 'categories') loadCategories()
    else if (tab === 'services') { loadServices(); loadCategories(); loadPrestataires() }
    else if (tab === 'requests') loadRequests()
    else if (tab === 'payments') loadPayments()
  }, [tab])

  async function loadStats() {
    try { setStats(await api.get<Stats>('/admin/stats')) } catch (_) {}
  }
  async function loadUsers() {
    try { const d = await api.get<{ users: UserRow[] }>('/admin/users?limit=50'); setUsers(d.users) } catch (_) {}
  }
  async function loadKyc() {
    try { setKycList(await api.get<KycDossier[]>('/admin/kyc/pending')) } catch (_) {}
  }
  async function loadKycDetail(id: number) {
    try {
      const d = await api.get<KycDossier>(`/admin/kyc/${id}`)
      setKycDetail(d); setKycModalOpen(true)
    } catch (_) {}
  }
  async function loadCategories() {
    try { setCategories(await api.get<Category[]>('/admin/categories')) } catch (_) {}
  }
  async function loadServices() {
    try { setServices(await api.get<ServiceRow[]>('/admin/services')) } catch (_) {}
  }
  async function loadPrestataires() {
    try {
      const d = await api.get<{ users: UserRow[] }>('/admin/users?role=PRESTATAIRE&limit=100')
      setPrestataires(d.users)
    } catch (_) {}
  }
  async function loadRequests() {
    try { const d = await api.get<{ requests: RequestRow[] }>('/admin/requests?limit=50'); setRequests(d.requests) } catch (_) {}
  }
  async function loadPayments() {
    try {
      const list = await api.get<PayConfig[]>('/admin/payment-config')
      const map: Record<string, PayConfig> = {}
      list.forEach(c => { map[c.provider] = c })
      setPayForm({
        mtn_momo: map.mtn_momo || { provider: 'mtn_momo', enabled: false },
        orange_money: map.orange_money || { provider: 'orange_money', enabled: false },
      })
    } catch (_) {}
  }

  async function handleVerify(id: number, action: 'approve' | 'reject') {
    try {
      await api.patch(`/admin/users/${id}/verify`, { action })
      feedback(action === 'approve' ? '✅ Prestataire approuvé' : '❌ Prestataire rejeté')
      setKycModalOpen(false); loadKyc()
    } catch (e: unknown) { feedback('❌ ' + (e instanceof Error ? e.message : 'Erreur')) }
  }

  async function handleStatusChange(id: number, statut: string) {
    try {
      await api.patch(`/admin/users/${id}/status`, { statut })
      feedback('✅ Statut mis à jour')
      loadUsers()
    } catch (_) {}
  }

  async function handleCreateCategory() {
    if (!newCat.nom) return
    try {
      await api.post('/admin/categories', newCat)
      feedback('✅ Catégorie créée')
      setNewCat({ nom: '', description: '', icone: '' })
      setCatModalOpen(false); loadCategories()
    } catch (e: unknown) { feedback('❌ ' + (e instanceof Error ? e.message : 'Erreur')) }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm('Supprimer cette catégorie ?')) return
    try { await api.delete(`/admin/categories/${id}`); feedback('✅ Supprimée'); loadCategories() } catch (e: unknown) { feedback('❌ ' + (e instanceof Error ? e.message : 'Erreur')) }
  }

  async function handleToggleFeatured(id: number, featured: boolean) {
    try { await api.patch(`/admin/services/${id}/featured`, { featured: !featured }); loadServices() } catch (_) {}
  }

  function openCreateService() {
    setEditingService(null)
    setServiceForm(EMPTY_SERVICE_FORM)
    setServiceModalOpen(true)
  }

  function openEditService(s: ServiceRow) {
    setEditingService(s)
    setServiceForm({
      titre: s.titre,
      description: s.description,
      prix: String(s.prix),
      categoryId: String(s.categoryId || s.category?.id || ''),
      prestataireId: String(s.prestataire?.id || ''),
      zone: s.zone || '',
      disponibilite: s.disponibilite,
    })
    setServiceModalOpen(true)
  }

  async function handleSaveService() {
    if (!serviceForm.titre || !serviceForm.description || !serviceForm.prix || !serviceForm.categoryId || !serviceForm.prestataireId) {
      feedback('❌ Remplissez tous les champs obligatoires')
      return
    }
    try {
      if (editingService) {
        await api.put(`/admin/services/${editingService.id}`, serviceForm)
        feedback('✅ Service mis à jour')
      } else {
        await api.post('/admin/services', serviceForm)
        feedback('✅ Service créé')
      }
      setServiceModalOpen(false)
      loadServices()
    } catch (e: unknown) { feedback('❌ ' + (e instanceof Error ? e.message : 'Erreur')) }
  }

  async function handleDeleteService(id: number) {
    if (!confirm('Supprimer ce service définitivement ?')) return
    try {
      await api.delete(`/admin/services/${id}`)
      feedback('✅ Service supprimé')
      loadServices()
    } catch (e: unknown) { feedback('❌ ' + (e instanceof Error ? e.message : 'Erreur')) }
  }

  async function handleRegisterUser() {
    try {
      await api.post('/admin/users/register', registerForm)
      feedback('✅ Utilisateur créé')
      setRegisterForm({ email: '', password: '', nom: '', prenom: '', telephone: '', role: 'PARTICULIER', categorie: '', experience: '', bio: '', tarif: '', zone: '' })
    } catch (e: unknown) { feedback('❌ ' + (e instanceof Error ? e.message : 'Erreur')) }
  }

  async function handleSavePayment(provider: string) {
    try {
      await api.put(`/admin/payment-config/${provider}`, payForm[provider])
      feedback('✅ Configuration sauvegardée'); loadPayments()
    } catch (e: unknown) { feedback('❌ ' + (e instanceof Error ? e.message : 'Erreur')) }
  }

  const currentUser = user
    ? { prenom: user.prenom, nom: user.nom, role: 'admin', avatar: user.prenom[0] + user.nom[0], avatarUrl: user.avatar || undefined }
    : { prenom: 'Admin', role: 'admin', avatar: 'AD' }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-all'

  const items: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Vue d'ensemble",      onClick: () => setTab('overview'),   active: tab === 'overview'    },
    { icon: Users,           label: 'Utilisateurs',         onClick: () => setTab('users'),      active: tab === 'users'       },
    { icon: FileCheck,       label: 'KYC / Inscriptions',   onClick: () => setTab('kyc'),        active: tab === 'kyc'         },
    { icon: UserPlus,        label: 'Inscription manuelle', onClick: () => setTab('register'),   active: tab === 'register'    },
    { separator: true },
    { icon: Tag,             label: 'Catégories',           onClick: () => setTab('categories'), active: tab === 'categories'  },
    { icon: Briefcase,       label: 'Services',             onClick: () => setTab('services'),   active: tab === 'services'    },
    { icon: Package,         label: 'Demandes',             onClick: () => setTab('requests'),   active: tab === 'requests'    },
    { separator: true },
    { icon: CreditCard,      label: 'Paiements',            onClick: () => setTab('payments'),   active: tab === 'payments'    },
  ]

  return (
    <DashboardLayout user={currentUser} items={items}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Feedback toast */}
        {feedbackMsg && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg text-sm font-medium">
            {feedbackMsg}
          </div>
        )}

        {/* ======== VUE D'ENSEMBLE ======== */}
        {tab === 'overview' && (
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Vue d'ensemble</h1>
            {stats ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Utilisateurs total', value: stats.totalUsers, icon: Users, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30' },
                  { label: 'Prestataires actifs', value: stats.totalPrestataires, icon: Briefcase, color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
                  { label: 'KYC en attente', value: stats.pendingKyc, icon: FileCheck, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
                  { label: 'Demandes total', value: stats.totalRequests, icon: Package, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
                  { label: 'Services publiés', value: stats.totalServices, icon: Tag, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' },
                  { label: 'Demandes actives', value: stats.activeRequests, icon: TrendingUp, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30' },
                ].map(s => (
                  <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.color)}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">Chargement des statistiques...</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setTab('kyc')} className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-left hover:opacity-90 transition-opacity cursor-pointer">
                <p className="font-semibold text-amber-800 dark:text-amber-400">Dossiers KYC en attente</p>
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">{stats?.pendingKyc || 0} prestataire(s) à valider</p>
              </button>
              <button onClick={() => setTab('register')} className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl text-left hover:opacity-90 transition-opacity cursor-pointer">
                <p className="font-semibold text-orange-800 dark:text-orange-400">Inscription manuelle</p>
                <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">Créer un compte utilisateur directement</p>
              </button>
            </div>
          </div>
        )}

        {/* ======== UTILISATEURS ======== */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Utilisateurs</h1>
              <div className="flex gap-2">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={cn(inputCls, 'w-44')}>
                  <option value="all">Tous les statuts</option>
                  <option value="ACTIF">Actif</option>
                  <option value="EN_ATTENTE_VERIFICATION">En attente KYC</option>
                  <option value="SUSPENDU">Suspendu</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={searchUsers} onChange={e => setSearchUsers(e.target.value)} placeholder="Rechercher..." className={cn(inputCls, 'pl-9 w-48')} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    {['Nom', 'Email', 'Rôle', 'Statut', 'Inscription', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users
                    .filter(u => statusFilter === 'all' || u.statut === statusFilter)
                    .filter(u => !searchUsers || `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(searchUsers.toLowerCase()))
                    .map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.prenom} {u.nom}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3"><StatusBadge statut={u.statut} /></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.statut}
                          onChange={e => handleStatusChange(u.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          <option value="ACTIF">Actif</option>
                          <option value="EN_ATTENTE_VERIFICATION">En attente KYC</option>
                          <option value="SUSPENDU">Suspendu</option>
                          <option value="BANNI">Banni</option>
                          <option value="REJETE">Rejeté</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-center py-8 text-slate-400">Aucun utilisateur</p>}
            </div>
          </div>
        )}

        {/* ======== KYC ======== */}
        {tab === 'kyc' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Dossiers KYC</h1>
              <button onClick={loadKyc} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-600 cursor-pointer transition-colors">
                <RefreshCw className="w-4 h-4" /> Actualiser
              </button>
            </div>
            {kycList.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Aucun dossier en attente</p>
                <p className="text-sm text-slate-400 mt-1">Tous les prestataires ont été traités</p>
              </div>
            ) : (
              <div className="space-y-3">
                {kycList.map(k => (
                  <div key={k.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-sm">
                        {k.prenom[0]}{k.nom[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{k.prenom} {k.nom}</p>
                        <p className="text-xs text-slate-500">{k.email} · {k.categorie}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className="text-xs text-slate-400">{new Date(k.createdAt).toLocaleDateString('fr-FR')}</span>
                      <Button variant="outline" size="sm" onClick={() => loadKycDetail(k.id)}>
                        <Eye className="w-4 h-4" /> Voir
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleVerify(k.id, 'approve')}>
                        <CheckCircle className="w-4 h-4" /> Approuver
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleVerify(k.id, 'reject')} className="text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="w-4 h-4" /> Rejeter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* KYC Detail Modal */}
            {kycModalOpen && kycDetail && (
              <Modal isOpen={kycModalOpen} onClose={() => setKycModalOpen(false)} title={`Dossier — ${kycDetail.prenom} ${kycDetail.nom}`}>
                <div className="space-y-5 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-slate-400">Email</p><p className="font-medium">{kycDetail.email}</p></div>
                    <div><p className="text-xs text-slate-400">Téléphone</p><p className="font-medium">{kycDetail.telephone || '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Domaine</p><p className="font-medium">{kycDetail.categorie || '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Expérience</p><p className="font-medium">{kycDetail.experience ? kycDetail.experience + ' ans' : '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Tarif min</p><p className="font-medium">{kycDetail.tarif ? formatPrice(kycDetail.tarif) : '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Zone</p><p className="font-medium">{kycDetail.zone || '—'}</p></div>
                  </div>
                  {kycDetail.bio && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400">{kycDetail.bio}</div>
                  )}
                  {kycDetail.kycDocuments && kycDetail.kycDocuments.length > 0 ? (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Documents soumis ({kycDetail.kycDocuments.length})</p>
                      <div className="grid grid-cols-2 gap-3">
                        {kycDetail.kycDocuments.map(doc => (
                          <MediaViewer key={doc.id} doc={doc} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Aucun document soumis</p>
                  )}
                  <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="primary" onClick={() => handleVerify(kycDetail.id, 'approve')} className="flex-1">
                      <CheckCircle className="w-4 h-4" /> Approuver
                    </Button>
                    <Button variant="outline" onClick={() => handleVerify(kycDetail.id, 'reject')} className="flex-1 text-red-600 border-red-200">
                      <XCircle className="w-4 h-4" /> Rejeter
                    </Button>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* ======== INSCRIPTION MANUELLE ======== */}
        {tab === 'register' && (
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Inscription manuelle</h1>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-xl">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Prénom *</label><input value={registerForm.prenom} onChange={e => setRegisterForm(f => ({...f, prenom: e.target.value}))} className={inputCls} placeholder="Jean-Pierre" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nom *</label><input value={registerForm.nom} onChange={e => setRegisterForm(f => ({...f, nom: e.target.value}))} className={inputCls} placeholder="Atangana" /></div>
                <div className="col-span-2"><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email *</label><input value={registerForm.email} onChange={e => setRegisterForm(f => ({...f, email: e.target.value}))} className={inputCls} type="email" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Téléphone</label><input value={registerForm.telephone} onChange={e => setRegisterForm(f => ({...f, telephone: e.target.value}))} className={inputCls} placeholder="+237 6..." /></div>
                <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mot de passe</label><input value={registerForm.password} onChange={e => setRegisterForm(f => ({...f, password: e.target.value}))} className={inputCls} type="password" placeholder="Laissez vide = défaut" /></div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Rôle *</label>
                  <select value={registerForm.role} onChange={e => setRegisterForm(f => ({...f, role: e.target.value}))} className={inputCls}>
                    <option value="PARTICULIER">Particulier</option>
                    <option value="PRESTATAIRE">Prestataire</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                {registerForm.role === 'PRESTATAIRE' && (
                  <>
                    <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Domaine</label><input value={registerForm.categorie} onChange={e => setRegisterForm(f => ({...f, categorie: e.target.value}))} className={inputCls} placeholder="Plomberie" /></div>
                    <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Exp. (ans)</label><input value={registerForm.experience} onChange={e => setRegisterForm(f => ({...f, experience: e.target.value}))} className={inputCls} type="number" /></div>
                    <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tarif min (FCFA)</label><input value={registerForm.tarif} onChange={e => setRegisterForm(f => ({...f, tarif: e.target.value}))} className={inputCls} type="number" /></div>
                    <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Zone</label><input value={registerForm.zone} onChange={e => setRegisterForm(f => ({...f, zone: e.target.value}))} className={inputCls} /></div>
                    <div className="col-span-2"><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Bio</label><textarea value={registerForm.bio} onChange={e => setRegisterForm(f => ({...f, bio: e.target.value}))} className={cn(inputCls, 'resize-none')} rows={3} /></div>
                  </>
                )}
              </div>
              <Button variant="primary" onClick={handleRegisterUser} className="mt-5 w-full">
                <UserPlus className="w-4 h-4" /> Créer l'utilisateur
              </Button>
            </div>
          </div>
        )}

        {/* ======== CATÉGORIES ======== */}
        {tab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Catégories & types de services</h1>
              <Button variant="primary" size="sm" onClick={() => setCatModalOpen(true)}>
                <Plus className="w-4 h-4" /> Nouvelle catégorie
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{c.nom}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>
                    </div>
                    <button onClick={() => handleDeleteCategory(c.id)} className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <p className="text-sm font-semibold text-orange-600">{c._count?.services || 0} service(s)</p>
                </div>
              ))}
            </div>
            {categories.length === 0 && <p className="text-center py-8 text-slate-400">Aucune catégorie</p>}

            <Modal
              isOpen={catModalOpen}
              onClose={() => setCatModalOpen(false)}
              title="Nouvelle catégorie"
              footer={
                <>
                  <Button variant="outline" size="sm" onClick={() => setCatModalOpen(false)}>Annuler</Button>
                  <Button variant="primary" size="sm" onClick={handleCreateCategory}>Créer</Button>
                </>
              }
            >
              <div className="space-y-3">
                <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nom *</label><input value={newCat.nom} onChange={e => setNewCat(f => ({...f, nom: e.target.value}))} className={inputCls} placeholder="Ex: Plomberie" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label><input value={newCat.description} onChange={e => setNewCat(f => ({...f, description: e.target.value}))} className={inputCls} placeholder="Description courte" /></div>
                <div><label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Icône (slug)</label><input value={newCat.icone} onChange={e => setNewCat(f => ({...f, icone: e.target.value}))} className={inputCls} placeholder="Ex: plumbing-icon" /></div>
              </div>
            </Modal>
          </div>
        )}

        {/* ======== SERVICES CRUD ======== */}
        {tab === 'services' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Gestion des services</h1>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={serviceSearch} onChange={e => setServiceSearch(e.target.value)} placeholder="Rechercher..." className={cn(inputCls, 'pl-9 w-48')} />
                </div>
                <Button variant="primary" size="sm" onClick={openCreateService}>
                  <Plus className="w-4 h-4" /> Nouveau service
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    {['Titre', 'Prestataire', 'Catégorie', 'Prix', 'Dispo', 'Vedette', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {services
                    .filter(s => !serviceSearch || s.titre.toLowerCase().includes(serviceSearch.toLowerCase()) || s.prestataire.nom.toLowerCase().includes(serviceSearch.toLowerCase()))
                    .map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white max-w-[180px] truncate">{s.titre}</p>
                        {s.zone && <p className="text-xs text-slate-400 truncate max-w-[180px]">{s.zone}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{s.prestataire.prenom} {s.prestataire.nom}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs">{s.category.nom}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatPrice(s.prix)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', s.disponibilite ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                          {s.disponibilite ? 'Oui' : 'Non'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleFeatured(s.id, s.featured)} className="cursor-pointer transition-colors" title={s.featured ? 'Retirer vedette' : 'Mettre en vedette'}>
                          {s.featured
                            ? <ToggleRight className="w-8 h-8 text-orange-500" />
                            : <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditService(s)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors cursor-pointer" title="Modifier">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteService(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {services.length === 0 && <p className="text-center py-8 text-slate-400">Aucun service publié</p>}
            </div>

            {/* Modal Créer / Modifier service */}
            <Modal
              isOpen={serviceModalOpen}
              onClose={() => setServiceModalOpen(false)}
              title={editingService ? `Modifier — ${editingService.titre}` : 'Nouveau service'}
              footer={
                <>
                  <Button variant="outline" size="sm" onClick={() => setServiceModalOpen(false)}>Annuler</Button>
                  <Button variant="primary" size="sm" onClick={handleSaveService}>
                    {editingService ? 'Sauvegarder' : 'Créer le service'}
                  </Button>
                </>
              }
            >
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Titre *</label>
                  <input value={serviceForm.titre} onChange={e => setServiceForm(f => ({...f, titre: e.target.value}))} className={inputCls} placeholder="Ex: Réparation fuite urgente" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description * <span className="font-normal text-slate-400">(min 20 car.)</span></label>
                  <textarea value={serviceForm.description} onChange={e => setServiceForm(f => ({...f, description: e.target.value}))} rows={3} className={cn(inputCls, 'resize-none')} placeholder="Description détaillée du service..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Prix (FCFA) *</label>
                    <input type="number" value={serviceForm.prix} onChange={e => setServiceForm(f => ({...f, prix: e.target.value}))} className={inputCls} placeholder="Ex: 15000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Zone d'intervention</label>
                    <input value={serviceForm.zone} onChange={e => setServiceForm(f => ({...f, zone: e.target.value}))} className={inputCls} placeholder="Ex: Yaoundé, Bastos" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Catégorie *</label>
                  <select value={serviceForm.categoryId} onChange={e => setServiceForm(f => ({...f, categoryId: e.target.value}))} className={inputCls}>
                    <option value="">Sélectionner...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                {!editingService && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Prestataire *</label>
                    <select value={serviceForm.prestataireId} onChange={e => setServiceForm(f => ({...f, prestataireId: e.target.value}))} className={inputCls}>
                      <option value="">Sélectionner un prestataire...</option>
                      {prestataires.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom} — {p.email}</option>)}
                    </select>
                    {prestataires.length === 0 && <p className="text-xs text-amber-500 mt-1">Aucun prestataire actif trouvé</p>}
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Disponible immédiatement</p>
                    <p className="text-xs text-slate-400">Le service sera visible aux clients</p>
                  </div>
                  <button type="button" onClick={() => setServiceForm(f => ({...f, disponibilite: !f.disponibilite}))} className="cursor-pointer transition-colors">
                    {serviceForm.disponibilite
                      ? <ToggleRight className="w-9 h-9 text-orange-600" />
                      : <ToggleLeft className="w-9 h-9 text-slate-400" />}
                  </button>
                </div>
              </div>
            </Modal>
          </div>
        )}

        {/* ======== DEMANDES ======== */}
        {tab === 'requests' && (
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Toutes les demandes</h1>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    {['Titre', 'Catégorie', 'Client', 'Prestataire', 'Statut', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requests.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-[180px] truncate">{r.titre}</td>
                      <td className="px-4 py-3 text-slate-500">{r.categorie || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{r.particulier.prenom} {r.particulier.nom}</td>
                      <td className="px-4 py-3 text-slate-500">{r.prestataire ? `${r.prestataire.prenom} ${r.prestataire.nom}` : <span className="text-amber-500">Non assigné</span>}</td>
                      <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', {
                        'bg-amber-100 text-amber-700': r.statut === 'EN_ATTENTE',
                        'bg-orange-100 text-orange-700': r.statut === 'ACCEPTEE' || r.statut === 'EN_COURS',
                        'bg-green-100 text-green-700': r.statut === 'TERMINEE',
                        'bg-red-100 text-red-700': r.statut === 'ANNULEE',
                      })}>{r.statut.replace('_', ' ')}</span></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {requests.length === 0 && <p className="text-center py-8 text-slate-400">Aucune demande</p>}
            </div>
          </div>
        )}

        {/* ======== PAIEMENTS ======== */}
        {tab === 'payments' && (
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Configuration des paiements</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['mtn_momo', 'orange_money'] as const).map(provider => {
                const cfg = payForm[provider] || {}
                const label = provider === 'mtn_momo' ? 'MTN Mobile Money' : 'Orange Money'
                const colorClass = provider === 'mtn_momo' ? 'bg-yellow-400' : 'bg-orange-500'
                const icon = provider === 'mtn_momo' ? '📱' : '🟠'
                return (
                  <div key={provider} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl', colorClass)}>{icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
                      </div>
                      <button
                        onClick={() => setPayForm(f => ({ ...f, [provider]: { ...f[provider], enabled: !f[provider]?.enabled } }))}
                        className="cursor-pointer"
                      >
                        {cfg.enabled
                          ? <ToggleRight className="w-8 h-8 text-orange-500" />
                          : <ToggleLeft className="w-8 h-8 text-slate-300" />
                        }
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Merchant ID</label><input value={cfg.merchantId || ''} onChange={e => setPayForm(f => ({...f, [provider]: {...f[provider], merchantId: e.target.value}}))} className={inputCls} placeholder="ID marchand" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">API Key</label><input value={cfg.apiKey || ''} onChange={e => setPayForm(f => ({...f, [provider]: {...f[provider], apiKey: e.target.value}}))} className={inputCls} type="password" placeholder="••••••••" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Webhook URL</label><input value={cfg.webhookUrl || ''} onChange={e => setPayForm(f => ({...f, [provider]: {...f[provider], webhookUrl: e.target.value}}))} className={inputCls} placeholder="https://..." /></div>
                      <Button variant="primary" size="sm" onClick={() => handleSavePayment(provider)} className="w-full">Sauvegarder</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </main>
    </DashboardLayout>
  )
}
