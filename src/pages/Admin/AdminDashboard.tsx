import { useState } from 'react'
import { Users, Briefcase, BarChart2, ShieldAlert, CheckCircle, XCircle, Eye, TrendingUp, AlertTriangle, FileCheck, Settings, X, Download, ZoomIn } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

const currentUser = { prenom: 'Admin', role: 'admin', avatar: 'AD' }

const cardStats = [
  { label: 'Utilisateurs',         value: '1 540',              icon: Users,       color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',  delta: '+12 cette semaine' },
  { label: 'Prestataires actifs',  value: '340',                icon: Briefcase,   color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',       delta: '+5 ce mois'        },
  { label: 'CA ce mois',           value: formatPrice(4800000), icon: BarChart2,   color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',       delta: '+18%'              },
  { label: 'Signalements',         value: '7',                  icon: ShieldAlert, color: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',               delta: '3 non traités'     },
]

const recentUsers = [
  { id: 1, nom: 'Kamga Marie',      email: 'marie@mail.com',      role: 'particulier', statut: 'actif',      date: '27/05/2026' },
  { id: 2, nom: 'Mbeki Alain',      email: 'alain@mail.com',      role: 'prestataire', statut: 'actif',      date: '26/05/2026' },
  { id: 3, nom: 'Talla Bertrand',   email: 'bertrand@mail.com',   role: 'prestataire', statut: 'en_attente', date: '25/05/2026' },
  { id: 4, nom: 'Nkeng Paul',       email: 'paul@mail.com',       role: 'particulier', statut: 'suspendu',   date: '24/05/2026' },
]

const signalements = [
  { id: 1, type: 'Avis frauduleux',     utilisateur: 'User #234', cible: 'Prestataire #12', date: '27/05/2026', traite: false },
  { id: 2, type: 'Compte suspect',      utilisateur: 'User #189', cible: 'Compte #56',      date: '26/05/2026', traite: false },
  { id: 3, type: 'Paiement litigieux',  utilisateur: 'User #302', cible: 'Paiement #88',    date: '25/05/2026', traite: true  },
]

type KycStatut = 'en_attente' | 'approuve' | 'rejete'
type KycDoc = { label: string; type: 'image' | 'pdf'; present: boolean; url?: string }
type KycDossier = {
  id: number; nom: string; prenom: string; email: string; telephone: string
  categorie: string; date: string; experience: string; description: string
  zone: string; tarif: string
  docs: KycDoc[]
  statut: KycStatut
}

const kycDossiers: KycDossier[] = [
  {
    id: 1, nom: 'Talla', prenom: 'Bertrand', email: 'bertrand@mail.com', telephone: '+237 670 11 22 33',
    categorie: 'Plomberie', date: '25/05/2026', experience: '8 ans',
    description: "Plombier professionnel avec 8 ans d'expérience à Yaoundé. Spécialisé dans la réparation de fuites, l'installation sanitaire et la maintenance des réseaux d'eau.",
    zone: 'Yaoundé, Mfandena, Nlongkak', tarif: '15 000 FCFA',
    docs: [
      { label: 'Photo de profil', type: 'image', present: true,  url: 'https://ui-avatars.com/api/?name=Bertrand+Talla&size=400&background=EA580C&color=fff' },
      { label: 'CNI Recto',       type: 'image', present: true,  url: 'https://placehold.co/400x250/F8FAFC/94a3b8?text=CNI+Recto' },
      { label: 'CNI Verso',       type: 'image', present: true,  url: 'https://placehold.co/400x250/F8FAFC/94a3b8?text=CNI+Verso' },
      { label: 'Justif. domicile', type: 'pdf',  present: false                                                                 },
      { label: 'Diplôme / Cert.', type: 'pdf',   present: true,  url: 'https://placehold.co/400x300/FFF7ED/EA580C?text=Diplome+CAP+Plomberie' },
      { label: 'Attestation pro', type: 'pdf',   present: false                                                                 },
    ],
    statut: 'en_attente',
  },
  {
    id: 2, nom: 'Fouda', prenom: 'Christian', email: 'fouda@mail.cm', telephone: '+237 699 44 55 66',
    categorie: 'Électricité', date: '24/05/2026', experience: '12 ans',
    description: "Électricien certifié avec 12 ans d'expérience dans l'installation électrique domestique et industrielle. Intervention d'urgence disponible 24h/24 sur Douala.",
    zone: 'Douala, Akwa, Bonanjo', tarif: '20 000 FCFA',
    docs: [
      { label: 'Photo de profil', type: 'image', present: true, url: 'https://ui-avatars.com/api/?name=Christian+Fouda&size=400&background=EA580C&color=fff' },
      { label: 'CNI Recto',       type: 'image', present: true, url: 'https://placehold.co/400x250/F8FAFC/94a3b8?text=CNI+Recto' },
      { label: 'CNI Verso',       type: 'image', present: true, url: 'https://placehold.co/400x250/F8FAFC/94a3b8?text=CNI+Verso' },
      { label: 'Justif. domicile', type: 'pdf',  present: true, url: 'https://placehold.co/400x300/F8FAFC/94a3b8?text=Facture+ENEO' },
      { label: 'Diplôme / Cert.', type: 'pdf',  present: true, url: 'https://placehold.co/400x300/FFF7ED/EA580C?text=BTS+Electrotechnique' },
      { label: 'Attestation pro', type: 'pdf',  present: true, url: 'https://placehold.co/400x300/FFF7ED/EA580C?text=Attestation+SONEL' },
    ],
    statut: 'en_attente',
  },
  {
    id: 3, nom: 'Ngo', prenom: 'Marie', email: 'marie.ngo@mail.cm', telephone: '+237 677 88 99 00',
    categorie: 'Informatique', date: '22/05/2026', experience: '5 ans',
    description: "Technicienne en informatique spécialisée dans la maintenance, le dépannage réseau et la cybersécurité. Certifiée CISCO et Microsoft.",
    zone: 'Yaoundé, Bastos, Ngoa-Ekellé', tarif: '10 000 FCFA',
    docs: [
      { label: 'Photo de profil', type: 'image', present: true, url: 'https://ui-avatars.com/api/?name=Marie+Ngo&size=400&background=EA580C&color=fff' },
      { label: 'CNI Recto',       type: 'image', present: true, url: 'https://placehold.co/400x250/F8FAFC/94a3b8?text=CNI+Recto' },
      { label: 'CNI Verso',       type: 'image', present: true, url: 'https://placehold.co/400x250/F8FAFC/94a3b8?text=CNI+Verso' },
      { label: 'Justif. domicile', type: 'pdf',  present: true, url: 'https://placehold.co/400x300/F8FAFC/94a3b8?text=Facture+CAMWATER' },
      { label: 'Diplôme / Cert.', type: 'pdf',   present: true, url: 'https://placehold.co/400x300/FFF7ED/EA580C?text=Licence+Informatique' },
      { label: 'Attestation pro', type: 'pdf',   present: true, url: 'https://placehold.co/400x300/FFF7ED/EA580C?text=Cert+CISCO' },
    ],
    statut: 'approuve',
  },
]

function KycDetailModal({ dossier, onClose }: { dossier: KycDossier; onClose: () => void }) {
  const [zoomDoc, setZoomDoc] = useState<KycDoc | null>(null)

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title={`Dossier KYC — ${dossier.prenom} ${dossier.nom}`}
        className="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Personal info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-400">Nom complet</span><p className="font-semibold text-slate-800 dark:text-slate-200">{dossier.prenom} {dossier.nom}</p></div>
            <div><span className="text-slate-400">Email</span><p className="font-semibold text-slate-800 dark:text-slate-200">{dossier.email}</p></div>
            <div><span className="text-slate-400">Téléphone</span><p className="font-semibold text-slate-800 dark:text-slate-200">{dossier.telephone}</p></div>
            <div><span className="text-slate-400">Domaine</span><p className="font-semibold text-slate-800 dark:text-slate-200">{dossier.categorie}</p></div>
            <div><span className="text-slate-400">Expérience</span><p className="font-semibold text-slate-800 dark:text-slate-200">{dossier.experience}</p></div>
            <div><span className="text-slate-400">Tarif minimum</span><p className="font-semibold text-slate-800 dark:text-slate-200">{dossier.tarif}</p></div>
            <div className="col-span-2"><span className="text-slate-400">Zone</span><p className="font-semibold text-slate-800 dark:text-slate-200">{dossier.zone}</p></div>
            <div className="col-span-2">
              <span className="text-slate-400">Description</span>
              <p className="text-slate-700 dark:text-slate-300 mt-1 text-xs leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">{dossier.description}</p>
            </div>
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Documents soumis</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {dossier.docs.map(doc => (
                <div key={doc.label} className={cn(
                  'rounded-xl border overflow-hidden',
                  doc.present ? 'border-orange-200 dark:border-orange-800' : 'border-slate-200 dark:border-slate-700 opacity-50',
                )}>
                  {doc.present && doc.url ? (
                    <div className="relative group">
                      <img
                        src={doc.url}
                        alt={doc.label}
                        className="w-full h-24 object-cover bg-slate-100"
                      />
                      <button
                        onClick={() => setZoomDoc(doc)}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <ZoomIn className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                      {doc.present
                        ? <span className="text-2xl">📄</span>
                        : <XCircle className="w-6 h-6 text-slate-300" />}
                    </div>
                  )}
                  <div className={cn(
                    'px-2 py-1.5 flex items-center justify-between',
                    doc.present ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-slate-50 dark:bg-slate-800',
                  )}>
                    <span className="text-[11px] font-medium truncate text-slate-700 dark:text-slate-300">{doc.label}</span>
                    {doc.present
                      ? <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {zoomDoc && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => setZoomDoc(null)}>
          <button
            onClick={() => setZoomDoc(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={zoomDoc.url}
            alt={zoomDoc.label}
            className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
            {zoomDoc.label}
          </p>
        </div>
      )}
    </>
  )
}

export function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [kycList, setKycList] = useState(kycDossiers)
  const [viewDossier, setViewDossier] = useState<KycDossier | null>(null)

  const pendingKyc = kycList.filter(d => d.statut === 'en_attente').length

  function handleKyc(id: number, action: 'approuve' | 'rejete') {
    setKycList(list => list.map(d => d.id === id ? { ...d, statut: action } : d))
  }

  const items: SidebarItem[] = [
    { icon: BarChart2,   label: "Vue d'ensemble",  onClick: () => setTab('overview'),      active: tab === 'overview'      },
    { icon: Users,       label: 'Utilisateurs',     onClick: () => setTab('users'),         active: tab === 'users'         },
    { icon: FileCheck,   label: 'KYC',              onClick: () => setTab('kyc'),           active: tab === 'kyc',           badge: pendingKyc },
    { icon: ShieldAlert, label: 'Signalements',     onClick: () => setTab('signalements'),  active: tab === 'signalements'  },
    { separator: true },
    { icon: Settings, label: 'Paramètres', href: '/admin/parametres' },
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
              <h2 className="font-display font-bold text-slate-900 dark:text-white mb-5">Activité récente</h2>
              <div className="space-y-4">
                {[
                  { dot: 'bg-green-400',  action: 'Nouvel utilisateur inscrit',  detail: 'Kamga Marie — Particulier',       time: 'il y a 5 min'  },
                  { dot: 'bg-orange-400', action: 'Prestataire vérifié',          detail: 'Mbeki Alain — Plomberie',         time: 'il y a 22 min' },
                  { dot: 'bg-amber-400',  action: 'Paiement traité',              detail: '15 000 FCFA — Intervention #203', time: 'il y a 1h'     },
                  { dot: 'bg-red-400',    action: 'Avis modéré',                  detail: 'Avis #78 supprimé (fraude)',      time: 'il y a 2h'     },
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
              <Badge variant="info">{recentUsers.length} récents</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Utilisateur</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rôle</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Statut</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u.id} className="border-t border-slate-50 dark:border-slate-800 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors">
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
                          <button className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors active:scale-95" aria-label={`Voir ${u.nom}`}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 text-slate-400 hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors active:scale-95" aria-label={`Valider ${u.nom}`}>
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors active:scale-95" aria-label={`Suspendre ${u.nom}`}>
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

        {/* KYC */}
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
                className={cn(
                  'bg-white dark:bg-slate-900 rounded-2xl border p-5 transition-all',
                  d.statut === 'approuve' ? 'border-green-200 dark:border-green-800'
                    : d.statut === 'rejete' ? 'border-red-200 dark:border-red-800'
                      : 'border-slate-100 dark:border-slate-800',
                )}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {d.prenom[0]}{d.nom[0]}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-slate-900 dark:text-white">{d.prenom} {d.nom}</p>
                      <p className="text-xs text-slate-400">{d.categorie} &middot; {d.zone} &middot; Soumis le {d.date}</p>
                    </div>
                  </div>
                  <Badge variant={d.statut === 'approuve' ? 'success' : d.statut === 'rejete' ? 'error' : 'warning'}>
                    {d.statut === 'approuve' ? 'Approuvé' : d.statut === 'rejete' ? 'Rejeté' : 'En attente'}
                  </Badge>
                </div>

                {/* Aperçu description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 italic">{d.description}</p>

                {/* Documents status grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                  {d.docs.map(doc => (
                    <div
                      key={doc.label}
                      className={cn(
                        'flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[10px] font-medium text-center',
                        doc.present ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-500',
                      )}
                    >
                      {doc.present ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span className="leading-tight">{doc.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setViewDossier(d)}
                    className="flex items-center gap-1.5 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl cursor-pointer transition-colors active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    Voir le dossier complet
                  </button>
                  <button
                    onClick={() => {
                      const a = document.createElement('a')
                      a.href = '#'
                      a.download = `dossier_${d.prenom}_${d.nom}.pdf`
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium rounded-xl cursor-pointer transition-colors active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                  {d.statut === 'en_attente' && (
                    <>
                      <button
                        onClick={() => handleKyc(d.id, 'approuve')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleKyc(d.id, 'rejete')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 text-sm font-semibold rounded-xl cursor-pointer transition-colors active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </button>
                    </>
                  )}
                  {d.statut !== 'en_attente' && (
                    <button
                      onClick={() => setKycList(l => l.map(x => x.id === d.id ? { ...x, statut: 'en_attente' as const } : x))}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs underline cursor-pointer ml-1 transition-colors"
                    >
                      Annuler la décision
                    </button>
                  )}
                </div>
              </div>
            ))}

            {kycList.every(d => d.statut !== 'en_attente') && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-green-800 dark:text-green-400">Tous les dossiers ont été traités</p>
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
                  ? <Badge variant="success">Traité</Badge>
                  : (
                    <div className="flex gap-2 shrink-0">
                      <Button variant="cta" size="sm">Résoudre</Button>
                      <Button variant="outline" size="sm">Ignorer</Button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </main>

      {viewDossier && <KycDetailModal dossier={viewDossier} onClose={() => setViewDossier(null)} />}
    </DashboardLayout>
  )
}
