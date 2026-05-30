import { useState, useRef } from 'react'
import { LayoutDashboard, Clock, Bell, Search, Plus, User, Phone, Mail, Edit2, CheckCircle, CreditCard, MapPin, Camera, Smartphone, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { formatPrice } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import type { AuthUser } from '@/context/AuthContext'

const paymentMethods = [
  { id: 'mtn', label: 'MTN Mobile Money', number: '+237 670 ••• •••', icon: '📱', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'orange', label: 'Orange Money', number: '+237 655 ••• •••', icon: '🟠', color: 'bg-orange-100 dark:bg-orange-900/20' },
]

export function ProfilParticulier() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [telephone, setTelephone] = useState(user?.telephone || '')
  const [zone, setZone] = useState(user?.zone || '')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const currentUser = user
    ? { prenom: user.prenom, role: 'particulier', avatar: user.prenom[0] + user.nom[0] }
    : { prenom: 'Invité', role: 'particulier', avatar: 'IN' }

  const items: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Tableau de bord',    href: '/particulier'                   },
    { icon: Clock,           label: 'Mes demandes',       href: '/particulier'                   },
    { icon: Bell,            label: 'Notifications',      href: '/particulier'                   },
    { separator: true },
    { icon: Search, label: 'Trouver un service',  href: '/services'                       },
    { icon: Plus,   label: 'Nouvelle demande',    href: '/particulier/nouvelle-demande'   },
    { separator: true },
    { icon: User, label: 'Mon profil', href: '/particulier/profil', active: true },
  ]

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-all'

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      const updated = await api.upload<AuthUser>('/auth/profile', (() => {
        const fd = new FormData()
        fd.append('telephone', telephone)
        fd.append('zone', zone)
        return fd
      })(), 'PUT')
      updateUser(updated)
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (_) {
      // Fallback: update optimistically
      updateUser({ ...user, telephone, zone })
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

  return (
    <DashboardLayout user={currentUser} items={items}>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Mon profil</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Gérez vos informations et modes de paiement</p>
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Zone',      value: user.zone || '—',              color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30' },
            { label: 'Statut',    value: user.statut || 'Actif',        color: 'text-green-600 bg-green-50 dark:bg-green-900/30'   },
            { label: 'Dépensé',   value: formatPrice(0),                color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 text-center">
              <p className={`font-bold text-base mb-0.5 ${s.color.split(' ')[0]}`}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Avatar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center gap-3 text-center">
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
              <p className="text-sm text-slate-500 dark:text-slate-400">Particulier</p>
            </div>
            <Badge variant={user.statut === 'ACTIF' ? 'success' : 'warning'}>
              {user.statut === 'ACTIF' ? 'Compte actif' : user.statut || 'Actif'}
            </Badge>
          </div>

          {/* Infos */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Informations personnelles</h2>
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
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  {editing
                    ? <input value={zone} onChange={e => setZone(e.target.value)} placeholder="Ville, Quartier" className={inputCls} />
                    : <span className="text-sm text-slate-700 dark:text-slate-300">{user.zone || '—'}</span>
                  }
                </div>
              </div>
              {editing && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Enregistrer
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
                </div>
              )}
            </div>

            {/* Modes de paiement */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-slate-900 dark:text-white">Modes de paiement</h2>
                <Button variant="outline" size="sm">
                  <CreditCard className="w-3.5 h-3.5" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-3">
                {paymentMethods.map(pm => (
                  <div key={pm.id} className={`flex items-center gap-3 p-3 rounded-xl ${pm.color}`}>
                    <span className="text-xl">{pm.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{pm.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        {pm.number}
                      </p>
                    </div>
                    <Badge variant="success" className="text-xs">Actif</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
