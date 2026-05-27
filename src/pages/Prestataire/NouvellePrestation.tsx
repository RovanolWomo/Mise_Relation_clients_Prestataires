import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, ToggleLeft, ToggleRight, LayoutDashboard, Inbox, Briefcase, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { categories } from '@/data/mock'

const currentUser = { prenom: 'Alain', role: 'prestataire', avatar: 'AM' }

const items: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord',   href: '/prestataire' },
  { icon: Inbox,           label: 'Demandes recues',   href: '/prestataire' },
  { icon: Briefcase,       label: 'Mes prestations',   href: '/prestataire' },
  { separator: true },
  { icon: Plus, label: 'Nouvelle prestation', href: '/prestataire/nouvelle-prestation' },
  { separator: true },
  { icon: User, label: 'Mon profil', href: '/prestataire/profil' },
]

export function NouvellePrestation() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disponible, setDisponible] = useState(true)

  const [form, setForm] = useState({
    titre: '',
    categorie: '',
    description: '',
    tarif: '',
    zone: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titre || !form.categorie || !form.description || !form.tarif) {
      setError('Veuillez remplir tous les champs obligatoires (*).')
      return
    }
    setError(null)
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'

  if (submitted) {
    return (
      <DashboardLayout user={currentUser} items={items}>
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">Prestation publiee !</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Votre prestation est maintenant visible par les particuliers. Vous recevrez des demandes par notification.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate('/prestataire')}>
              Voir mes prestations
            </Button>
            <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ titre: '', categorie: '', description: '', tarif: '', zone: '' }) }}>
              Ajouter une autre
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
          to="/prestataire"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Retour au tableau de bord
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">Nouvelle prestation</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Proposez un service et soyez visible par les particuliers</p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Titre de la prestation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.titre}
                onChange={set('titre')}
                placeholder="Ex: Installation solaire domestique"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Domaine <span className="text-red-500">*</span>
              </label>
              <select value={form.categorie} onChange={set('categorie')} className={inputCls}>
                <option value="">Selectionner un domaine...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.nom}>{c.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description de la prestation <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={set('description')}
                placeholder="Ex: Installation complète de panneaux solaires avec garantie 2 ans, intervention en 48h sur Yaoundé et environs..."
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Tarif minimum (FCFA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.tarif}
                  onChange={set('tarif')}
                  placeholder="Ex: 25000"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Zone d'intervention
                </label>
                <input
                  type="text"
                  value={form.zone}
                  onChange={set('zone')}
                  placeholder="Ex: Douala, Akwa"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Disponible immediatement</p>
                <p className="text-xs text-slate-400 mt-0.5">Votre prestation sera marquee comme disponible</p>
              </div>
              <button
                type="button"
                onClick={() => setDisponible(v => !v)}
                className="cursor-pointer transition-colors"
                aria-label={disponible ? 'Marquer indisponible' : 'Marquer disponible'}
              >
                {disponible
                  ? <ToggleRight className="w-8 h-8 text-blue-600" />
                  : <ToggleLeft className="w-8 h-8 text-slate-400" />}
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="cta" size="lg" loading={loading} className="flex-1">
                Publier la prestation
              </Button>
              <Link to="/prestataire">
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
