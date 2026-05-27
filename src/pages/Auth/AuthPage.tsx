import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, User, Wrench, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/I18nContext'
import type { UserRole } from '@/types'

type Mode = 'login' | 'register'

const DEMO_ACCOUNTS = [
  { role: 'particulier' as UserRole, name: 'Marie Kamga',   email: 'marie@mail.com',    password: 'demo123', path: '/particulier', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400' },
  { role: 'prestataire' as UserRole, name: 'Alain Mbeki',   email: 'alain@mail.com',    password: 'demo123', path: '/prestataire', color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400' },
  { role: 'admin' as UserRole,       name: 'Admin Prestolink', email: 'admin@prestolink.cm', password: 'admin', path: '/admin',     color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-400' },
]

const ROLE_LABELS: Record<UserRole, string> = {
  particulier: 'Particulier',
  prestataire: 'Prestataire',
  admin: 'Admin',
}

export function AuthPage({ mode: initial }: { mode: Mode }) {
  const [mode, setMode] = useState<Mode>(initial)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useT()
  const [role, setRole] = useState<UserRole>((params.get('role') as UserRole) || 'particulier')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', password: '' })

  const set = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'register' && role === 'prestataire') {
      navigate('/inscription/prestataire')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    navigate(role === 'admin' ? '/admin' : role === 'prestataire' ? '/prestataire' : '/particulier')
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all text-sm'

  const roles = [
    { value: 'particulier' as UserRole, label: t.auth.particulier, desc: t.auth.particulier_desc, icon: User },
    { value: 'prestataire' as UserRole, label: t.auth.prestataire, desc: t.auth.prestataire_desc, icon: Wrench },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-slate-900 dark:bg-slate-950 p-12 border-r border-slate-800">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="w-5 h-5 text-white" aria-hidden />
          </div>
          <span className="font-display font-bold text-2xl text-white">
            Presto<span className="text-orange-500">link</span>
          </span>
        </Link>

        <div>
          <ShieldCheck className="w-8 h-8 text-blue-400 mb-6" aria-hidden />
          <blockquote className="text-slate-300 text-lg leading-relaxed italic mb-6">
            "J'ai trouve un electricien qualifie en moins de 2h. La plateforme est simple, securisee et les prestataires sont vraiment professionnels."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">MK</div>
            <div>
              <p className="font-semibold text-white text-sm">Marie Kamga</p>
              <p className="text-slate-400 text-xs">Cliente &middot; Yaounde</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600">Plateforme verifiee &amp; securisee</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-md">

          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600 text-sm mb-6 cursor-pointer transition-colors">
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Retour
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
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
            {mode === 'login' ? 'Connectez-vous pour acceder a votre espace.' : 'Rejoignez notre communaute.'}
          </p>

          {/* Mode switch */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer',
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
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
                      onClick={() => setRole(r.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center',
                        role === r.value
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-200 dark:hover:border-blue-700',
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
              {role === 'prestataire' && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                  Un formulaire KYC sera requis pour valider votre profil
                </p>
              )}
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
                  value={form.telephone} onChange={set} placeholder="+237 6 70 00 00 00" className={inputCls} />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right -mt-1">
                <Link to="/mot-de-passe-oublie" className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
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
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              {mode === 'login' ? t.auth.register : t.auth.login}
            </button>
          </p>

          {/* Demo access */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
              Acces demonstration — cliquez pour entrer
            </p>
            <div className="flex flex-col gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => navigate(acc.path)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer transition-all hover:opacity-90 hover:shadow-sm text-left',
                    acc.color,
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold">{acc.name}</p>
                    <p className="text-xs opacity-75">{acc.email} &nbsp;&middot;&nbsp; {acc.password}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">
                    {ROLE_LABELS[acc.role]}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
