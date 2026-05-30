import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, User, Wrench, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PasswordStrength } from '@/components/ui/PasswordStrength'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/I18nContext'
import { useAuth, roleToPath } from '@/context/AuthContext'
import type { UserRole } from '@/types'

type Mode = 'login' | 'register'

export function AuthPage({ mode: initial }: { mode: Mode }) {
  const [mode, setMode] = useState<Mode>(initial)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useT()
  const { login, register } = useAuth()

  const [role, setRole] = useState<UserRole>((params.get('role') as UserRole) || 'particulier')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', password: '' })

  const set = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'register' && role === 'prestataire') {
      navigate('/inscription/prestataire')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        if (!form.email || !form.password) {
          setError('Email et mot de passe requis')
          return
        }
        const user = await login(form.email, form.password)
        navigate(roleToPath(user.role))
      } else {
        if (!form.email || !form.password || !form.nom || !form.prenom) {
          setError('Tous les champs obligatoires doivent être remplis')
          return
        }
        const user = await register({
          email: form.email,
          password: form.password,
          nom: form.nom,
          prenom: form.prenom,
          telephone: form.telephone,
          role: role.toUpperCase(),
        })
        navigate(roleToPath(user.role))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 bg-white dark:bg-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 transition-all text-sm'

  const roles = [
    { value: 'particulier' as UserRole, label: t.auth.particulier, desc: t.auth.particulier_desc, icon: User },
    { value: 'prestataire' as UserRole, label: t.auth.prestataire, desc: t.auth.prestataire_desc, icon: Wrench },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-slate-900 dark:bg-slate-950 p-12 border-r border-slate-800">
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-orange-700 transition-colors">
            <Zap className="w-5 h-5 text-white" aria-hidden />
          </div>
          <span className="font-display font-bold text-2xl text-white">
            Presto<span className="text-orange-500">link</span>
          </span>
        </Link>

        <div>
          <ShieldCheck className="w-8 h-8 text-orange-400 mb-6" aria-hidden />
          <blockquote className="text-slate-300 text-lg leading-relaxed italic mb-6">
            "J'ai trouvé un électricien qualifié en moins de 2h. La plateforme est simple, sécurisée et les prestataires sont vraiment professionnels."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm font-bold">MK</div>
            <div>
              <p className="font-semibold text-white text-sm">Marie Kamga</p>
              <p className="text-slate-400 text-xs">Cliente &middot; Yaoundé</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600">Plateforme vérifiée &amp; sécurisée</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-md">

          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-orange-600 text-sm mb-6 cursor-pointer transition-colors active:scale-95">
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Retour
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" aria-hidden />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Presto<span className="text-orange-500">link</span>
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {mode === 'login' ? t.auth.welcome_back : t.auth.create_account}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            {mode === 'login' ? 'Connectez-vous pour accéder à votre espace.' : 'Rejoignez notre communauté.'}
          </p>

          {/* Mode switch */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98]',
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-orange-700 dark:text-orange-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
                )}
              >
                {m === 'login' ? t.auth.submit_login : t.auth.register}
              </button>
            ))}
          </div>

          {mode === 'register' && (
            <div className="mb-5">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t.auth.role_select}</p>
              <div className="grid grid-cols-2 gap-3">
                {roles.map(r => {
                  const Icon = r.icon
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        if (r.value === 'prestataire') { navigate('/inscription/prestataire'); return }
                        setRole(r.value)
                      }}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center active:scale-[0.98]',
                        role === r.value
                          ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-orange-200 dark:hover:border-orange-700',
                      )}
                    >
                      <Icon className="w-5 h-5" aria-hidden />
                      <div>
                        <p className="text-sm font-semibold">{r.label}</p>
                        <p className="text-[11px] opacity-70">{r.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.auth.prenom}</label>
                  <input id="prenom" name="prenom" type="text" autoComplete="given-name"
                    value={form.prenom} onChange={set} placeholder="Jean-Pierre" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.auth.nom}</label>
                  <input id="nom" name="nom" type="text" autoComplete="family-name"
                    value={form.nom} onChange={set} placeholder="Atangana" className={inputCls} />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.auth.email}</label>
              <input id="email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={set} placeholder="jp.atangana@gmail.com" className={inputCls} />
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.auth.telephone}</label>
                <input id="telephone" name="telephone" type="tel" autoComplete="tel"
                  value={form.telephone} onChange={set} placeholder="+237 670 00 00 00" className={inputCls} />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t.auth.password}</label>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={form.password} onChange={set} placeholder="••••••••"
                  className={cn(inputCls, 'pr-11')}
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
              {mode === 'register' && <PasswordStrength password={form.password} />}
            </div>

            {mode === 'login' && (
              <div className="text-right -mt-1">
                <Link to="/mot-de-passe-oublie" className="text-xs text-orange-600 dark:text-orange-400 hover:underline cursor-pointer">
                  {t.auth.forgotPwd}
                </Link>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-1">
              {mode === 'login'
                ? t.auth.submit_login
                : role === 'prestataire'
                  ? 'Continuer vers le KYC'
                  : t.auth.submit_register}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
            {mode === 'login' ? t.auth.toggle_to_register.split('?')[0] + '? ' : t.auth.toggle_to_login.split('?')[0] + '? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
              className="text-orange-600 dark:text-orange-400 font-semibold hover:underline cursor-pointer"
            >
              {mode === 'login' ? t.auth.register : t.auth.login}
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}
