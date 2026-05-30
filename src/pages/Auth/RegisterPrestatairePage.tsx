import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, CheckCircle, Upload, ArrowLeft, ArrowRight, Clock, AlertCircle, Eye, EyeOff, GraduationCap, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { PasswordStrength } from '@/components/ui/PasswordStrength'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/I18nContext'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import type { AuthUser } from '@/context/AuthContext'

type Step = 1 | 2 | 3 | 4

type UploadState = { file: File | null; name: string }
const emptyUpload = (): UploadState => ({ file: null, name: '' })

function FileUpload({
  label, hint, value, onChange, required, icon: Icon,
}: {
  label: string; hint?: string; value: UploadState; onChange: (v: UploadState) => void; required?: boolean
  icon?: React.ElementType
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />}
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <label className={cn(
        'flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
        value.file
          ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-900/10',
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
            <CheckCircle className="w-6 h-6 text-orange-600" aria-hidden />
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400 max-w-[180px] truncate">{value.name}</p>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-slate-400" aria-hidden />
            <p className="text-sm text-slate-500 dark:text-slate-400">Cliquer pour uploader</p>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
          </>
        )}
      </label>
    </div>
  )
}

function Field({
  label, type = 'text', placeholder, value, onChange, required, className, hint,
}: {
  label: string; type?: string; placeholder?: string; value: string; onChange: (v: string) => void
  required?: boolean; className?: string; hint?: string
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all"
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

function validate(step: Step, state: Record<string, string | UploadState | boolean>): string | null {
  if (step === 1) {
    if (!state.prenom && !state.nom) return 'Veuillez renseigner votre prénom ou nom.'
    if (!state.email) return "L'adresse email est requise."
    const pwd = state.password as string
    if (!pwd) return 'Le mot de passe est requis.'
    const strongPwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^+=_\-])[A-Za-z\d@$!%*?&#^+=_\-]{8,}$/
    if (!strongPwdRegex.test(pwd)) return 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&…).'
  }
  if (step === 2) {
    if (!state.categorie) return 'Veuillez sélectionner votre domaine de compétence.'
    const desc = state.description as string
    if (desc.length < 20) return `La description doit comporter au moins 20 caractères pour être professionnelle. (${desc.length}/20)`
  }
  if (step === 3) {
    const cniRecto = state.cniRecto as UploadState
    if (!cniRecto?.file) return 'La CNI recto est obligatoire.'
    const diplome = state.diplome as UploadState
    const attestation = state.attestation as UploadState
    if (!diplome?.file && !attestation?.file) return 'Veuillez fournir au moins un diplôme OU une attestation professionnelle dans votre domaine.'
  }
  return null
}

export function RegisterPrestatairePage() {
  const navigate = useNavigate()
  const { t } = useT()
  const { updateUser } = useAuth()
  const { categories } = useCategories()
  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')

  const [categorie, setCategorie] = useState('')
  const [experience, setExperience] = useState('')
  const [description, setDescription] = useState('')
  const [tarif, setTarif] = useState('')
  const [zone, setZone] = useState('')

  const [photoProfil, setPhotoProfil] = useState<UploadState>(emptyUpload())
  const [cniRecto, setCniRecto] = useState<UploadState>(emptyUpload())
  const [cniVerso, setCniVerso] = useState<UploadState>(emptyUpload())
  const [justif, setJustif] = useState<UploadState>(emptyUpload())
  const [diplome, setDiplome] = useState<UploadState>(emptyUpload())
  const [attestation, setAttestation] = useState<UploadState>(emptyUpload())

  function getState() {
    return { prenom, nom, email, telephone, password, categorie, description, cniRecto, diplome, attestation }
  }

  function next() {
    const err = validate(step, getState())
    if (err) { setError(err); return }
    setError(null)
    if (step === 3) {
      setShowConsent(true)
      return
    }
    setStep(s => (s + 1) as Step)
  }

  async function handleConfirmConsent() {
    setShowConsent(false)
    setSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('nom', nom)
      formData.append('prenom', prenom)
      formData.append('telephone', telephone)
      formData.append('categorie', categorie)
      formData.append('experience', experience)
      formData.append('bio', description)
      formData.append('tarif', tarif)
      formData.append('zone', zone)
      if (photoProfil.file) formData.append('photoProfil', photoProfil.file)
      if (cniRecto.file) formData.append('cniRecto', cniRecto.file)
      if (cniVerso.file) formData.append('cniVerso', cniVerso.file)
      if (justif.file) formData.append('justif', justif.file)
      if (diplome.file) formData.append('diplome', diplome.file)
      if (attestation.file) formData.append('attestation', attestation.file)

      const data = await api.upload<{ user: AuthUser; token: string }>(
        '/auth/register-prestataire', formData
      )
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      updateUser(data.user)
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
      setShowConsent(false)
    } finally {
      setSubmitting(false)
    }
  }

  const STEPS = [
    { n: 1 as Step, label: t.kyc.step1 },
    { n: 2 as Step, label: t.kyc.step2 },
    { n: 3 as Step, label: t.kyc.step3 },
    { n: 4 as Step, label: t.kyc.step4 },
  ]

  const inputCls = 'w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 h-14 flex items-center px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" aria-hidden />
          </div>
          <span className="font-display font-bold text-slate-900 dark:text-white text-lg">
            Presto<span className="text-orange-500">link</span>
          </span>
        </Link>
      </header>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors shrink-0',
                  step > s.n
                    ? 'bg-green-500 text-white'
                    : step === s.n
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400',
                )}>
                  {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
                </div>
                <span className={cn(
                  'text-[11px] font-medium text-center hidden sm:block max-w-[80px] leading-tight',
                  step === s.n ? 'text-orange-700 dark:text-orange-400' : 'text-slate-400',
                )}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2 mb-4 transition-colors',
                  step > s.n ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700',
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">

          {/* Step 1 - Informations personnelles */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{t.kyc.step1}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Les champs marqués * sont obligatoires</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t.auth.prenom} placeholder="Jean-Pierre" value={prenom} onChange={setPrenom} />
                <Field label={t.auth.nom} placeholder="Atangana" value={nom} onChange={setNom} />
              </div>
              <Field label={t.auth.email} type="email" placeholder="jp.atangana@gmail.com" value={email} onChange={setEmail} required />
              <PhoneInput label={t.auth.telephone} value={telephone} onChange={setTelephone} />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.password} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={cn(inputCls, 'pr-11')}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                    aria-label={showPwd ? 'Masquer' : 'Afficher'}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>
            </div>
          )}

          {/* Step 2 - Compétences */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{t.kyc.step2}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Décrivez vos compétences et votre offre</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.kyc.category} <span className="text-red-500">*</span>
                </label>
                <select
                  value={categorie}
                  onChange={e => setCategorie(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Sélectionner...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.nom}>{c.nom}</option>
                  ))}
                </select>
              </div>
              <Field label={t.kyc.experience} type="number" placeholder="Ex : 10" value={experience} onChange={setExperience}
                hint="Nombre d'années d'expérience dans ce domaine" />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.kyc.description} <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-slate-400">(20 caractères min)</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex : Expert en plomberie sanitaire avec 10 ans d'expérience à Douala, spécialisé dans la réparation de fuites, installation de robinetterie et entretien de réseaux..."
                  className={cn(inputCls, 'resize-none')}
                />
                <div className="flex justify-between mt-1">
                  <p className={cn('text-xs', description.length < 20 ? 'text-red-500' : 'text-green-600 dark:text-green-400')}>
                    {description.length < 20 ? `${20 - description.length} caractères manquants` : '✓ Description valide'}
                  </p>
                  <p className="text-xs text-slate-400">{description.length} caractères</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t.kyc.tarif} type="number" placeholder="Ex : 15000" value={tarif} onChange={setTarif}
                  hint="Tarif minimum en FCFA" />
                <Field label={t.kyc.zone} placeholder="Ex : Yaoundé, Bastos" value={zone} onChange={setZone}
                  hint="Zone d'intervention principale" />
              </div>
            </div>
          )}

          {/* Step 3 - Documents */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{t.kyc.step3}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  CNI recto obligatoire. Fournissez au moins un justificatif de formation (diplôme OU attestation).
                </p>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                  ⚠️ Documents d'identité — La CNI recto est obligatoire pour vérifier votre identité.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUpload label={t.kyc.photo_profil} hint={t.kyc.upload_hint} value={photoProfil} onChange={setPhotoProfil} />
                <FileUpload label={t.kyc.cni_recto}    hint={t.kyc.upload_hint} value={cniRecto}    onChange={setCniRecto}    required />
                <FileUpload label={t.kyc.cni_verso}    hint={t.kyc.upload_hint} value={cniVerso}    onChange={setCniVerso}    />
                <FileUpload label={t.kyc.justif}       hint={t.kyc.upload_hint} value={justif}      onChange={setJustif}      />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Justificatif de formation <span className="text-red-500">*</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Fournissez <strong>au moins un</strong> des deux documents ci-dessous pour attester de vos compétences professionnelles.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Option 1 — Diplôme
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
                      <Award className="w-3.5 h-3.5" />
                      Option 2 — Attestation
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
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Justificatif de formation fourni ✓
                  </div>
                )}
              </div>

              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex gap-2">
                <CheckCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" aria-hidden />
                <p className="text-xs text-orange-700 dark:text-orange-400">
                  Vos documents sont chiffrés et accessibles uniquement à notre équipe de vérification.
                </p>
              </div>
            </div>
          )}

          {/* Step 4 - En attente */}
          {step === 4 && (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-amber-500" aria-hidden />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">{t.kyc.pending_review}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{t.kyc.pending_desc}</p>
              </div>
              <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-left mt-2">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">Étapes de validation</p>
                {[
                  { label: 'Documents reçus', done: true },
                  { label: "Vérification de l'identité", done: false },
                  { label: 'Activation du compte', done: false },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 py-1.5">
                    <CheckCircle className={cn('w-4 h-4 shrink-0', item.done ? 'text-green-500' : 'text-slate-300 dark:text-slate-600')} />
                    <span className={cn('text-sm', item.done ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400')}>{item.label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/')}
                className="mt-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 cursor-pointer transition-colors active:scale-95"
              >
                Retour à l'accueil
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              {step > 1 ? (
                <button
                  onClick={() => { setError(null); setStep(s => (s - 1) as Step) }}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden />
                  {t.kyc.back}
                </button>
              ) : (
                <Link to="/inscription" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">
                  <ArrowLeft className="w-4 h-4" aria-hidden />
                  {t.kyc.back}
                </Link>
              )}
              <Button variant={step === 3 ? 'cta' : 'primary'} size="md" onClick={next}>
                {step === 3 ? t.kyc.submit : t.kyc.next}
                {step < 3 && <ArrowRight className="w-4 h-4" aria-hidden />}
              </Button>
            </div>
          )}
        </div>

        {step < 4 && (
          <p className="text-center text-xs text-slate-400 mt-4">
            Étape {step} sur 3 — <span className="text-orange-600 dark:text-orange-400">{STEPS[step - 1].label}</span>
          </p>
        )}
      </div>

      {/* Consent modal */}
      <Modal
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        title="Consentement au traitement des données personnelles"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowConsent(false)}>Annuler</Button>
            <Button variant="primary" size="sm" onClick={handleConfirmConsent}>J'accepte et je soumets</Button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <p>
            Conformément à la <strong>Loi N°2010/012 du 21 décembre 2010</strong> relative à la cybersécurité
            et à la cybercriminalité au Cameroun, ainsi qu'aux dispositions de protection des données
            personnelles en vigueur sur le territoire camerounais, nous vous informons de ce qui suit :
          </p>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
            <p className="font-semibold text-orange-800 dark:text-orange-400 text-xs uppercase tracking-wide mb-2">Finalité du traitement</p>
            <p>Vos documents d'identité et certifications seront traités exclusivement pour la vérification de votre profil prestataire sur Prestolink.</p>
          </div>
          <p>En cliquant sur <strong>"J'accepte"</strong>, vous autorisez Prestolink à :</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Vérifier l'authenticité de vos pièces d'identité (CNI).</li>
            <li>Valider vos diplômes et attestations professionnelles.</li>
            <li>Conserver vos données de manière sécurisée durant la période de validation.</li>
            <li>Partager ces informations avec les autorités compétentes en cas d'obligation légale.</li>
          </ul>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1">Vos droits</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification,
              de suppression et de portabilité de vos données personnelles. Contactez-nous à
              <span className="text-orange-600 dark:text-orange-400"> dpo@prestolink.cm</span> pour exercer ces droits.
            </p>
          </div>
          <p className="text-xs text-slate-400 italic">
            Ce consentement est révocable à tout moment. Le retrait du consentement ne compromet pas
            la licéité des traitements effectués avant ce retrait.
          </p>
        </div>
      </Modal>
    </div>
  )
}
