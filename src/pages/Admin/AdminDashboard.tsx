import { useState } from 'react'
import { Users, Briefcase, BarChart2, ShieldAlert, CheckCircle, XCircle, Eye, TrendingUp, AlertTriangle, FileCheck, Settings } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'

const currentUser = { prenom: 'Admin', role: 'admin', avatar: 'AD' }

const cardStats = [
  { label: 'Utilisateurs',        value: '1 540',              icon: Users,       color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',     delta: '+12 cette semaine' },
  { label: 'Prestataires actifs', value: '340',                icon: Briefcase,   color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',  delta: '+5 ce mois'        },
  { label: 'CA ce mois',          value: formatPrice(4800000), icon: BarChart2,   color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', delta: '+18%'             },
  { label: 'Signalements',        value: '7',                  icon: ShieldAlert, color: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',          delta: '3 non traites'     },
]

const recentUsers = [
  { id: 1, nom: 'Kamga Marie',    email: 'marie@mail.com',    role: 'particulier', statut: 'actif',      date: '27/05/2026' },
  { id: 2, nom: 'Mbeki Alain',    email: 'alain@mail.com',    role: 'prestataire', statut: 'actif',      date: '26/05/2026' },
  { id: 3, nom: 'Talla Bertrand', email: 'bertrand@mail.com', role: 'prestataire', statut: 'en_attente', date: '25/05/2026' },
  { id: 4, nom: 'Nkeng Paul',     email: 'paul@mail.com',     role: 'particulier', statut: 'suspendu',   date: '24/05/2026' },
]

const signalements = [
  { id: 1, type: 'Avis frauduleux',    utilisateur: 'User #234', cible: 'Prestataire #12', date: '27/05/2026', traite: false },
  { id: 2, type: 'Compte suspect',     utilisateur: 'User #189', cible: 'Compte #56',      date: '26/05/2026', traite: false },
  { id: 3, type: 'Paiement litigieux', utilisateur: 'User #302', cible: 'Paiement #88',    date: '25/05/2026', traite: true  },
]

const kycDossiers: KycDossier[] = [
  {
    id: 1, nom: 'Talla Bertrand', categorie: 'Plomberie', date: '25/05/2026',
    docs: { photo: true, cni_recto: true, cni_verso: true, justif: false },
    statut: 'en_attente',
  },
  {
    id: 2, nom: 'Fouda Christian', categorie: 'Electricite', date: '24/05/2026',
    docs: { photo: true, cni_recto: true, cni_verso: true, justif: true },
    statut: 'en_attente',
  },
  {
    id: 3, nom: 'Ngo Marie', categorie: 'Informatique', date: '22/05/2026',
    docs: { photo: true, cni_recto: true, cni_verso: true, justif: true },
    statut: 'approuve',
  },
]

type KycStatut = 'en_attente' | 'approuve' | 'rejete'
type KycDossier = {
  id: number; nom: string; categorie: string; date: string
  docs: { photo: boolean; cni_recto: boolean; cni_verso: boolean; justif: boolean }
  statut: KycStatut
}

const DOC_LABELS: Record<string, string> = {
  photo: 'Photo', cni_recto: 'CNI Recto', cni_verso: 'CNI Verso', justif: 'Domicile',
}

export function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [kycList, setKycList] = useState(kycDossiers)

  const pendingKyc = kycList.filter(d => d.statut === 'en_attente').length

  function handleKyc(id: number, action: 'approuve' | 'rejete') {
    setKycList(list => list.map(d => d.id === id ? { ...d, statut: action } : d))
  }

  const items: SidebarItem[] = [
    { icon: BarChart2,   label: "Vue d'ensemble",  onClick: () => setTab('overview'),      active: tab === 'overview'      },
    { icon: Users,       label: 'Utilisateurs',    onClick: () => setTab('users'),         active: tab === 'users'         },
    { icon: FileCheck,   label: 'KYC',             onClick: () => setTab('kyc'),           active: tab === 'kyc',           badge: pendingKyc },
    { icon: ShieldAlert, label: 'Signalements',    onClick: () => setTab('signalements'),  active: tab === 'signalements'  },
    { separator: true },
    { icon: Settings, label: 'Parametres', href: '/admin/parametres' },
  ]

  return (
    <DashboardLayout user={currentUser} items={items}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Tableau de bord administrateur</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Supervision de la plateforme Prestolink</p>
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

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <h2 className="font-display font-bold text-slate-900 dark:text-white mb-5">Activite recente</h2>
              <div className="space-y-4">
                {[
                  { dot: 'bg-green-400',  action: 'Nouvel utilisateur inscrit',  detail: 'Kamga Marie — Particulier',       time: 'il y a 5 min'  },
                  { dot: 'bg-blue-400',   action: 'Prestataire verifie',          detail: 'Mbeki Alain — Plomberie',         time: 'il y a 22 min' },
                  { dot: 'bg-orange-400', action: 'Paiement traite',              detail: '15 000 FCFA — Intervention #203', time: 'il y a 1h'     },
                  { dot: 'bg-red-400',    action: 'Avis modere',                  detail: 'Avis #78 supprime (fraude)',      time: 'il y a 2h'     },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${item.dot}`} aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.action}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.detail} &middot; {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-slate-900 dark:text-white">Signalements urgents</h2>
                <Badge variant="error">{signalements.filter(s => !s.traite).length} en attente</Badge>
              </div>
              <div className="space-y-3">
                {signalements.filter(s => !s.traite).map(s => (
                  <div key={s.id} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-red-800 dark:text-red-400">{s.type}</p>
                      <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">{s.utilisateur} &middot; {s.cible} &middot; {s.date}</p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 text-xs !py-1 !px-2.5">Traiter</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-display font-bold text-slate-900 dark:text-white">Gestion des utilisateurs</h2>
              <Badge variant="info">{recentUsers.length} recents</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Utilisateur</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Statut</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u.id} className="border-t border-slate-50 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{u.nom}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={u.role === 'prestataire' ? 'info' : 'default'}>{u.role}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={u.statut === 'actif' ? 'success' : u.statut === 'en_attente' ? 'warning' : 'error'}>
                          {u.statut}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{u.date}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors" aria-label={`Voir ${u.nom}`}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 text-slate-400 hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors" aria-label={`Valider ${u.nom}`}>
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors" aria-label={`Suspendre ${u.nom}`}>
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KYC review */}
        {tab === 'kyc' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {pendingKyc} dossier{pendingKyc !== 1 ? 's' : ''} en attente de validation
              </p>
            </div>
            {kycList.map(d => (
              <div
                key={d.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 transition-all ${
                  d.statut === 'approuve'
                    ? 'border-green-200 dark:border-green-800'
                    : d.statut === 'rejete'
                      ? 'border-red-200 dark:border-red-800'
                      : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {d.nom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-slate-900 dark:text-white">{d.nom}</p>
                      <p className="text-xs text-slate-400">{d.categorie} &middot; Soumis le {d.date}</p>
                    </div>
                  </div>
                  <Badge
                    variant={d.statut === 'approuve' ? 'success' : d.statut === 'rejete' ? 'error' : 'warning'}
                  >
                    {d.statut === 'approuve' ? 'Approuve' : d.statut === 'rejete' ? 'Rejete' : 'En attente'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {Object.entries(d.docs).map(([key, present]) => (
                    <div
                      key={key}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${
                        present
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {present
                        ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                      {DOC_LABELS[key]}
                    </div>
                  ))}
                </div>

                {d.statut === 'en_attente' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleKyc(d.id, 'approuve')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" aria-hidden />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleKyc(d.id, 'rejete')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
                    >
                      <XCircle className="w-4 h-4" aria-hidden />
                      Rejeter
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium rounded-xl cursor-pointer transition-colors">
                      <Eye className="w-4 h-4" aria-hidden />
                      Voir documents
                    </button>
                  </div>
                )}

                {d.statut !== 'en_attente' && (
                  <div className="flex items-center gap-2 text-sm">
                    {d.statut === 'approuve'
                      ? <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400"><CheckCircle className="w-4 h-4" /> Dossier approuve</span>
                      : <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400"><XCircle className="w-4 h-4" /> Dossier rejete</span>}
                    <button
                      onClick={() => setKycList(l => l.map(x => x.id === d.id ? { ...x, statut: 'en_attente' as const } : x))}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs underline cursor-pointer ml-2"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            ))}

            {kycList.every(d => d.statut !== 'en_attente') && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-green-800 dark:text-green-400">Tous les dossiers ont ete traites</p>
              </div>
            )}
          </div>
        )}

        {/* Signalements */}
        {tab === 'signalements' && (
          <div className="flex flex-col gap-3">
            {signalements.map(s => (
              <div key={s.id} className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex items-center gap-4 ${s.traite ? 'border-slate-100 dark:border-slate-800' : 'border-red-200 dark:border-red-800'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${s.traite ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {s.traite
                    ? <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    : <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-slate-800 dark:text-slate-200">{s.type}</p>
                  <p className="text-sm text-slate-400">{s.utilisateur} &middot; {s.cible} &middot; {s.date}</p>
                </div>
                {s.traite
                  ? <Badge variant="success">Traite</Badge>
                  : (
                    <div className="flex gap-2 shrink-0">
                      <Button variant="cta" size="sm">Resoudre</Button>
                      <Button variant="outline" size="sm">Ignorer</Button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
