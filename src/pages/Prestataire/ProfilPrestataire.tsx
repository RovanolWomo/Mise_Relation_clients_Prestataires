import { useState, useRef } from 'react'
import { LayoutDashboard, Inbox, Briefcase, Plus, User, Star, MapPin, Phone, Mail, Edit2, CheckCircle, Clock, DollarSign, Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { formatPrice } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import type { AuthUser } from '@/context/AuthContext'

export function ProfilPrestataire() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(user?.bio || '')
  const [telephone, setTelephone] = useState(user?.telephone || '')
  const [zone, setZone] = useState(user?.zone || '')
  const [tarifMin, setTarifMin] = useState(String(user?.tarif || ''))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const currentUser = user
    ? { prenom: user.prenom, nom: user.nom, role: 'prestataire', avatar: user.prenom[0] + user.nom[0], avatarUrl: user.avatar || undefined }
    : { prenom: 'Prestataire', role: 'prestataire', avatar: 'PR' }

  const items: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Tableau de bord',    href: '/prestataire'                                   },
    { icon: Inbox,           label: 'Demandes reçues',    href: '/prestataire'                                   },
    { icon: Briefcase,       label: 'Mes prestations',    href: '/prestataire'                                   },
    { separator: true },
    { icon: Plus, label: 'Nouvelle prestation', href: '/prestataire/nouvelle-prestation' },
    { separator: true },
    { icon: User, label: 'Mon profil', href: '/prestataire/profil', active: true },
  ]

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-all'

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('bio', bio)
      fd.append('telephone', telephone)
      fd.append('zone', zone)
      if (tarifMin) fd.append('tarif', tarifMin)
      const updated = await api.upload<AuthUser>('/auth/profile', fd, 'PUT')
      updateUser(updated)
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (_) {
      // Fallback optimistic
      updateUser({ ...user, bio, telephone, zone, tarif: tarifMin ? parseFloat(tarifMin) : user.tarif })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setAvatarLoading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const updated = await api.upload<AuthUser>('/auth/profile', fd, 'PUT')
      updateUser(updated)
    } catch (_) {}
    finally { setAvatarLoading(false) }
  }

  if (!user) return null

  const avatarInitials = user.prenom[0] + user.nom[0]
  const isVerified = user.verified === true

  return (
    <DashboardLayout user={currentUser} items={items}>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Mon profil</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Gérez vos informations personnelles et professionnelles</p>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="w-4 h-4" />
              Modifier
            </Button>
          )}
        </div>

        {saved && (
          <div className="mb-5 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            Profil mis à jour avec succès !
          </div>
        )}

        {/* Stats rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Domaine',      value: user.categorie || '—',         icon: Briefcase,  color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
            { label: 'Expérience',   value: user.experience ? user.experience + ' ans' : '—', icon: Clock,  color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30' },
            { label: 'Avis clients', value: '—',                           icon: Star,       color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30' },
            { label: 'Tarif min',    value: user.tarif ? formatPrice(user.tarif) : '—', icon: DollarSign, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[80px]">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Avatar & identité */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center text-center gap-3">
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={avatarInitials} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                  {avatarInitials}
                </div>
              )}
              <button
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-orange-700 cursor-pointer transition-colors active:scale-95"
                onClick={() => fileRef.current?.click()}
                disabled={avatarLoading}
              >
                {avatarLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-display font-bold text-slate-900 dark:text-white text-lg">{user.prenom} {user.nom}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.categorie || 'Prestataire'}</p>
            </div>
            <Badge variant={isVerified ? 'success' : 'warning'}>
              {isVerified ? '✓ Identité vérifiée' : 'En attente de vérification'}
            </Badge>
            {user.experience && (
              <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {user.experience} d'expérience
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Coordonnées</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  {editing
                    ? <input value={telephone} onChange={e => setTelephone(e.target.value)} className={inputCls} placeholder="+237 6..." />
                    : <span className="text-sm text-slate-700 dark:text-slate-300">{user.telephone || '—'}</span>
                  }
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  {editing
                    ? <input value={zone} onChange={e => setZone(e.target.value)} placeholder="Zone d'intervention" className={inputCls} />
                    : <span className="text-sm text-slate-700 dark:text-slate-300">{user.zone || '—'}</span>
                  }
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                  {editing
                    ? <input type="number" value={tarifMin} onChange={e => setTarifMin(e.target.value)} placeholder="Tarif min FCFA" className={inputCls} />
                    : <span className="text-sm text-slate-700 dark:text-slate-300">{user.tarif ? `À partir de ${formatPrice(user.tarif)}` : '—'}</span>
                  }
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-3">Présentation professionnelle</h2>
              {editing ? (
                <textarea
                  rows={5}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className={`${inputCls} resize-none`}
                  placeholder="Décrivez votre parcours, vos spécialités..."
                />
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{user.bio || 'Aucune présentation pour le moment.'}</p>
              )}
            </div>

            {editing && (
              <div className="flex gap-3">
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Enregistrer les modifications
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
