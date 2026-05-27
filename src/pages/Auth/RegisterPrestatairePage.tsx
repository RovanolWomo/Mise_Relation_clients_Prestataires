import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, CheckCircle, Upload, ArrowLeft, ArrowRight, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import { categories } from '@/data/mock'
import { useT } from '@/i18n/I18nContext'

type Step = 1 | 2 | 3 | 4

type UploadState = { file: File | null; name: string }
const emptyUpload = (): UploadState => ({ file: null, name: '' })

function FileUpload({
  label, hint, value, onChange, required,
}: {
  label: string; hint?: string; value: UploadState; onChange: (v: UploadState) => void; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <label className={cn(
        'flex flex-col items-center justify-center gap-2 w-full h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
        value.file
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600',
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
            <CheckCircle className="w-6 h-6 text-blue-600" aria-hidden />
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 max-w-[180px] truncate">{value.name}</p>
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
  label, type = 'text', placeholder, value, onChange, required, className,
}: {
  label: string; type?: string; placeholder?: string; value: string; onChange: (v: string) => void; required?: boolean; className?: string
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
        className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      />
    </div>
  )
}

/* Validate each step — returns error string or null */
function validate(step: Step, state: Record<string, string | UploadState>): string | null {
  if (step === 1) {
    if (!state.prenom && !state.nom) return 'Veuillez renseigner votre prenom ou nom.'
    if (!state.email) return 'L\'adresse email est requise.'
    const pwd = state.password as string
    const strongPwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!pwd) return 'Le mot de passe est requis.'
    if (!strongPwdRegex.test(pwd)) return 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
  }
  if (step === 2) {
    if (!state.categorie) return 'Veuillez selectionner votre domaine de competence.'
    if (!(state.description as string).length >= 20) return 'La description doit comporter au moins 20 caractères pour être professionnelle.'
  }
  if (step === 3) {
    const cniRecto = state.cniRecto as UploadState
    if (!cniRecto?.file) return 'La CNI (recto) est obligatoire.'
  }
  return null
}

export function RegisterPrestatairePage() {
  const navigate = useNavigate()
  const { t } = useT()
  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState<string | null>(null)

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
    return { prenom, nom, email, telephone, password, categorie, description, cniRecto }
  }

  function next() {
    const err = validate(step, getState())
    if (err) { setError(err); return }
    setError(null)

    if (step === 3) {
      setShowConsent(true)
      return
    }

    if (step === 3) { setStep(4); return }
    setStep(s => (s + 1) as Step)
  }

  function handleConfirmConsent() {
    setShowConsent(false)
    setStep(4)
  }

  function handleConfirmConsent() {
    setShowConsent(false)
    setStep(4)
  }

  const STEPS = [
    { n: 1 as Step, label: t.kyc.step1 },
    { n: 2 as Step, label: t.kyc.step2 },
    { n: 3 as Step, label: t.kyc.step3 },
    { n: 4 as Step, label: t.kyc.step4 },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 h-14 flex items-center px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400',
                )}>
                  {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
                </div>
                <span className={cn(
                  'text-[11px] font-medium text-center hidden sm:block max-w-[80px] leading-tight',
                  step === s.n ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400',
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
          <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">

          {/* Step 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{t.kyc.step1}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Les champs marques * sont obligatoires</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t.auth.prenom} placeholder="Jean-Pierre" value={prenom} onChange={setPrenom} />
                <Field label={t.auth.nom} placeholder="Atangana" value={nom} onChange={setNom} />
              </div>
              <Field label={t.auth.email} type="email" placeholder="jp.atangana@gmail.com" value={email} onChange={setEmail} required />
              <div className="flex gap-2">
                <div className="w-24 px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold flex items-center justify-center">
                  🇨🇲 +237
                </div>
                <Field
                  label={t.auth.telephone}
                  type="tel"
                  placeholder="670 00 00 00"
                  value={telephone}
                  onChange={setTelephone}
                  className="flex-1"
                />
              </div>
              <Field label={t.auth.password} type="password" placeholder="••••••••" value={password} onChange={setPassword} required />
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{t.kyc.step2}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Decrivez vos competences et votre offre</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.kyc.category} <span className="text-red-500">*</span>
                </label>
                <select
                  value={categorie}
                  onChange={e => setCategorie(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Selectionner...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.nom}>{c.nom}</option>
                  ))}
                </select>
              </div>
              <Field label={t.kyc.experience} type="number" placeholder="Ex : 10" value={experience} onChange={setExperience} />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.kyc.description}</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Expert en plomberie sanitaire avec 10 ans d'expérience à Douala, spécialisé dans la réparation de fuites..."
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t.kyc.tarif} type="number" placeholder="Ex : 15000" value={tarif} onChange={setTarif} />
                <Field label={t.kyc.zone} placeholder="Ex : Yaoundé, Bastos" value={zone} onChange={setZone} />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{t.kyc.step3}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  La CNI (recto) est obligatoire. Les autres documents sont recommandes.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUpload label={t.kyc.photo_profil}         hint={t.kyc.upload_hint} value={photoProfil}  onChange={setPhotoProfil} />
                <FileUpload label={t.kyc.cni_recto}            hint={t.kyc.upload_hint} value={cniRecto}     onChange={setCniRecto}    required />
                <FileUpload label={t.kyc.cni_verso}            hint={t.kyc.upload_hint} value={cniVerso}     onChange={setCniVerso}    />
                <FileUpload label={t.kyc.justif}               hint={t.kyc.upload_hint} value={justif}       onChange={setJustif}      />
                <FileUpload label="Diplome / Certification"    hint={t.kyc.upload_hint} value={diplome}      onChange={setDiplome}     />
                <FileUpload label="Attestation professionnelle" hint={t.kyc.upload_hint} value={attestation}  onChange={setAttestation}  />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Vos documents sont chiffres et accessibles uniquement a notre equipe de verification.
                </p>
              </div>
            </div>
          )}

          {/* Step 4 */}
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
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">Etapes de validation</p>
                {[
                  { label: 'Documents recus', done: true },
                  { label: 'Verification identite', done: false },
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
                className="mt-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Retour a l'accueil
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              {step > 1 ? (
                <button
                  onClick={() => { setError(null); setStep(s => (s - 1) as Step) }}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors"
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
            Etape {step} sur 3 — <span className="text-blue-600 dark:text-blue-400">{STEPS[step - 1].label}</span>
          </p>
        )}
      </div>

      <Modal
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        title="Consentement au traitement des données"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowConsent(false)}>Annuler</Button>
            <Button variant="primary" size="sm" onClick={handleConfirmConsent}>J'accepte et je soumets</Button>
          </>
        }
      >
        <p className="mb-4">
          Conformément à la réglementation camerounaise sur la protection des données à caractère personnel,
          nous vous informons que vos documents d'identité et certifications seront traités exclusivement
          pour la vérification de votre profil prestataire.
        </p>
        <p className="mb-4">
          En cliquant sur "J'accepte", vous autorisez Prestolink à :
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Vérifier l'authenticité de vos pièces d'identité.</li>
          <li>Valider vos diplômes et certifications professionnelles.</li>
          <li>Conserver vos données de manière sécurisée durant la période de validation.</li>
        </ul>
        <p className="text-xs text-slate-400 italic">
          Vous disposez d'un droit d'accès, de rectification et de suppression de vos données sur simple demande.
        </p>
      </Modal>
    </div>
  )
}
