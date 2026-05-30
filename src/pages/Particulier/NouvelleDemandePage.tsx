import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, Bell, Search, Plus, User, LayoutDashboard, MapPin, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { cn } from '@/lib/utils'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'

const items: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord',    href: '/particulier'                   },
  { icon: Clock,           label: 'Mes demandes',       href: '/particulier'                   },
  { icon: Bell,            label: 'Notifications',      href: '/particulier'                   },
  { separator: true },
  { icon: Search, label: 'Trouver un service',  href: '/services'                       },
  { icon: Plus,   label: 'Nouvelle demande',    href: '/particulier/nouvelle-demande'   },
  { separator: true },
  { icon: User, label: 'Mon profil', href: '/particulier/profil' },
]

export function NouvelleDemandePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { categories } = useCategories()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const currentUser = user
    ? { prenom: user.prenom, role: 'particulier', avatar: user.prenom[0] + user.nom[0] }
    : { prenom: 'Invité', role: 'particulier', avatar: 'IN' }

  const [form, setForm] = useState({
    titre: '',
    categorie: '',
    description: '',
    date: '',
    localisation: '',
    budget: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function getGeolocation() {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur.")
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
          if (apiKey) {
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=fr`
            )
            const data = await res.json()
            if (data.results?.[0]) {
              const addr = data.results[0].formatted_address
              setForm(f => ({ ...f, localisation: addr }))
            } else {
              setForm(f => ({ ...f, localisation: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
            }
          } else {
            setForm(f => ({ ...f, localisation: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}` }))
          }
        } catch {
          setForm(f => ({ ...f, localisation: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
        }
        setGeoLoading(false)
      },
      (err) => {
        setGeoLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Accès à la localisation refusé. Veuillez autoriser la géolocalisation dans votre navigateur.")
        } else {
          setGeoError("Impossible de récupérer votre position. Veuillez entrer votre localisation manuellement.")
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titre || !form.categorie || !form.description) {
      setError('Veuillez remplir les champs obligatoires (*).')
      return
    }
    if (!user) {
      navigate('/connexion')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await api.post('/requests', {
        titre: form.titre,
        description: form.description,
        categorie: form.categorie,
        date: form.date || undefined,
        localisation: form.localisation || undefined,
        budget: form.budget ? parseFloat(form.budget) : undefined,
        latitude: coords?.lat,
        longitude: coords?.lng,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la demande')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all'

  if (submitted) {
    return (
      <DashboardLayout user={currentUser} items={items}>
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">Demande envoyée !</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Votre demande a été publiée. Les prestataires disponibles{coords ? ` dans votre zone` : ''} pourront vous répondre sous peu.
          </p>
          {coords && (
            <div className="flex items-center justify-center gap-2 text-sm text-orange-600 dark:text-orange-400 mb-6">
              <MapPin className="w-4 h-4" />
              Prestataires triés par proximité géographique
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate('/particulier')}>
              Voir mes demandes
            </Button>
            <Button variant="outline" onClick={() => {
              setSubmitted(false)
              setForm({ titre: '', categorie: '', description: '', date: '', localisation: '', budget: '' })
              setCoords(null)
            }}>
              Nouvelle demande
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={currentUser} items={items}>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/particulier"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer mb-6 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Retour au tableau de bord
        </Link>

        {/* Géolocalisation banner */}
        {!coords && (
          <div className="mb-5 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-400">Activez la géolocalisation</p>
                <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">Nous trierons les prestataires par proximité pour vous trouver la meilleure offre.</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={getGeolocation}
              disabled={geoLoading}
              className="shrink-0"
            >
              {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {geoLoading ? 'Localisation...' : 'Ma position'}
            </Button>
          </div>
        )}

        {coords && (
          <div className="mb-5 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Position détectée — les prestataires seront triés par proximité
          </div>
        )}

        {geoError && (
          <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {geoError}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">Nouvelle demande</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Décrivez votre besoin pour trouver le bon prestataire</p>

          {error && (
            <div className="mb-5 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Titre du problème <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.titre}
                onChange={set('titre')}
                placeholder="Ex: Court-circuit dans le salon à Yaoundé"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Catégorie de service <span className="text-red-500">*</span>
              </label>
              <select value={form.categorie} onChange={set('categorie')} className={inputCls}>
                <option value="">Sélectionner une catégorie...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.nom}>{c.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description détaillée <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={set('description')}
                placeholder="Ex: Ma prise électrique a sauté après une coupure et je sens une odeur de brûlé dans le salon..."
                className={cn(inputCls, 'resize-none')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Date souhaitée
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={set('date')}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Localisation
                  {coords && <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ GPS</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.localisation}
                    onChange={set('localisation')}
                    placeholder="Ex: Douala, Bonapriso"
                    className={cn(inputCls, 'pr-10')}
                  />
                  <button
                    type="button"
                    onClick={getGeolocation}
                    disabled={geoLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
                    title="Utiliser ma position GPS"
                  >
                    {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Budget maximum (FCFA) <span className="text-xs text-slate-400 font-normal ml-1">— optionnel</span>
              </label>
              <input
                type="number"
                value={form.budget}
                onChange={set('budget')}
                placeholder="Ex: 15000"
                className={inputCls}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">
                Publier ma demande
              </Button>
              <Link to="/particulier">
                <Button type="button" variant="outline" size="lg">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </DashboardLayout>
  )
}
