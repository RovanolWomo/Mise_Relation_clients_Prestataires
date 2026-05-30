import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, ToggleLeft, ToggleRight, LayoutDashboard, Inbox, Briefcase, Plus, User, Upload, GraduationCap, Award, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { SidebarItem } from '@/components/layout/DashboardLayout'
import { cn } from '@/lib/utils'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'

const items: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord',    href: '/prestataire'                                   },
  { icon: Inbox,           label: 'Demandes reçues',    href: '/prestataire'                                   },
  { icon: Briefcase,       label: 'Mes prestations',    href: '/prestataire'                                   },
  { separator: true },
  { icon: Plus, label: 'Nouvelle prestation', href: '/prestataire/nouvelle-prestation' },
  { separator: true },
  { icon: User, label: 'Mon profil', href: '/prestataire/profil' },
]

type UploadState = { file: File | null; name: string }
const emptyUpload = (): UploadState => ({ file: null, name: '' })

function FileUpload({ label, hint, value, onChange, required }: {
  label: string; hint?: string; value: UploadState; onChange: (v: UploadState) => void; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <label className={cn(
        'flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
        value.file
          ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50/40',
      )}>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="sr-only"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) onChange({ file: f, name: f.name })
          }}
        />
        {value.file ? (
          <>
            <CheckCircle className="w-6 h-6 text-orange-600" />
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400 max-w-[180px] truncate">{value.name}</p>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Cliquer pour uploader</p>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
          </>
        )}
      </label>
    </div>
  )
}

export function NouvellePrestation() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { categories } = useCategories()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disponible, setDisponible] = useState(true)
  const [diplome, setDiplome] = useState<UploadState>(emptyUpload())
  const [attestation, setAttestation] = useState<UploadState>(emptyUpload())

  const currentUser = user
    ? { prenom: user.prenom, nom: user.nom, role: 'prestataire', avatar: user.prenom[0] + user.nom[0], avatarUrl: user.avatar || undefined }
    : { prenom: 'Prestataire', role: 'prestataire', avatar: 'PR' }

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
    if (form.description.length < 20) {
      setError(`La description doit comporter au moins 20 caractères. (${form.description.length}/20)`)
      return
    }
    if (!user) { navigate('/connexion'); return }

    setError(null)
    setLoading(true)
    try {
      const cat = categories.find(c => c.nom === form.categorie)
      const formData = new FormData()
      formData.append('titre', form.titre)
      formData.append('description', form.description)
      formData.append('prix', form.tarif)
      formData.append('categoryId', String(cat?.id ?? 1))
      formData.append('zone', form.zone)
      formData.append('disponibilite', String(disponible))
      if (diplome.file) formData.append('image', diplome.file)
      else if (attestation.file) formData.append('image', attestation.file)

      await api.upload('/services', formData)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la publication')
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
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">Prestation publiée !</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Votre prestation est maintenant visible par les particuliers. Vous recevrez des demandes par notification.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate('/prestataire')}>
              Voir mes prestations
            </Button>
            <Button variant="outline" onClick={() => {
              setSubmitted(false)
              setForm({ titre: '', categorie: '', description: '', tarif: '', zone: '' })
              setDiplome(emptyUpload())
              setAttestation(emptyUpload())
            }}>
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
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-orange-700 dark:hover:text-orange-400 cursor-pointer mb-6 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Retour au tableau de bord
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">Nouvelle prestation</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Proposez un service et soyez visible par les particuliers</p>

          {error && (
            <div className="mb-5 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
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
                placeholder="Ex: Installation solaire domestique à Yaoundé"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Domaine <span className="text-red-500">*</span>
              </label>
              <select value={form.categorie} onChange={set('categorie')} className={inputCls}>
                <option value="">Sélectionner un domaine...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.nom}>{c.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description de la prestation <span className="text-red-500">*</span>
                <span className="ml-2 text-xs font-normal text-slate-400">(20 caractères min)</span>
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={set('description')}
                placeholder="Ex: Installation complète de panneaux solaires avec garantie 2 ans, intervention en 48h sur Yaoundé et environs. Devis gratuit sur place..."
                className={cn(inputCls, 'resize-none')}
              />
              <div className="flex justify-between mt-1">
                <p className={cn('text-xs', form.description.length < 20 ? 'text-red-500' : 'text-green-600 dark:text-green-400')}>
                  {form.description.length < 20 ? `${20 - form.description.length} caractères manquants` : '✓ Description valide'}
                </p>
                <p className="text-xs text-slate-400">{form.description.length} caractères</p>
              </div>
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

            {/* Justificatif de formation */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Justificatif de formation <span className="text-red-500">*</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fournissez au moins un document pour justifier vos compétences dans ce domaine.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    <GraduationCap className="w-3.5 h-3.5 text-orange-500" />
                    Option A — Diplôme
                  </p>
                  <FileUpload
                    label="Diplôme / Certificat"
                    hint="CAP, BTS, Licence, Master..."
                    value={diplome}
                    onChange={setDiplome}
                  />
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    <Award className="w-3.5 h-3.5 text-orange-500" />
                    Option B — Attestation
                  </p>
                  <FileUpload
                    label="Attestation professionnelle"
                    hint="Délivrée par un employeur ou organisme"
                    value={attestation}
                    onChange={setAttestation}
                  />
                </div>
              </div>
              {(diplome.file || attestation.file) && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Justificatif fourni — votre prestation sera plus crédible auprès des clients ✓
                </div>
              )}
            </div>

            {/* Disponibilité toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Disponible immédiatement</p>
                <p className="text-xs text-slate-400 mt-0.5">Votre prestation sera marquée comme disponible</p>
              </div>
              <button
                type="button"
                onClick={() => setDisponible(v => !v)}
                className="cursor-pointer transition-colors active:scale-95"
                aria-label={disponible ? 'Marquer indisponible' : 'Marquer disponible'}
              >
                {disponible
                  ? <ToggleRight className="w-9 h-9 text-orange-600" />
                  : <ToggleLeft className="w-9 h-9 text-slate-400" />}
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
