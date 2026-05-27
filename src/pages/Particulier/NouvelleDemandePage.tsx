import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, Bell, Search, Plus, User, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { categories } from '@/data/mock'

const currentUser = { prenom: 'Marie', role: 'particulier', avatar: 'MK' }

const items: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/particulier' },
  { icon: Clock,  label: 'Mes demandes',     href: '/particulier' },
  { icon: Bell,   label: 'Notifications',    href: '/particulier' },
  { separator: true },
  { icon: Search, label: 'Trouver un service', href: '/services' },
  { icon: Plus,   label: 'Nouvelle demande',   href: '/particulier/nouvelle-demande' },
  { separator: true },
  { icon: User, label: 'Mon profil', href: '/particulier/profil' },
]

export function NouvelleDemandePage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titre || !form.categorie || !form.description) {
      setError('Veuillez remplir les champs obligatoires (*).')
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
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">Demande envoyee !</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Votre demande a ete publiee. Les prestataires disponibles pourront vous repondre sous peu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate('/particulier')}>
              Voir mes demandes
            </Button>
            <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ titre: '', categorie: '', description: '', date: '', localisation: '', budget: '' }) }}>
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
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Retour au tableau de bord
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">Nouvelle demande</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Decrivez votre besoin pour trouver le bon prestataire</p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Titre du probleme <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.titre}
                onChange={set('titre')}
                placeholder="Ex: Court-circuit dans le salon"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Categorie de service <span className="text-red-500">*</span>
              </label>
              <select value={form.categorie} onChange={set('categorie')} className={inputCls}>
                <option value="">Selectionner une categorie...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.nom}>{c.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description detaillee <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={set('description')}
                placeholder="Ex: Ma prise électrique a sauté après une coupure et je sens une odeur de brûlé..."
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Date souhaitee
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
                </label>
                <input
                  type="text"
                  value={form.localisation}
                  onChange={set('localisation')}
                  placeholder="Ex: Douala, Bonapriso"
                  className={inputCls}
                />
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
                placeholder="Ex: 10000"
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
