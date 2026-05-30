import { cn } from '@/lib/utils'

const RULES = [
  { test: (p: string) => p.length >= 8,        label: '8 caractères minimum' },
  { test: (p: string) => /[A-Z]/.test(p),      label: 'Une majuscule' },
  { test: (p: string) => /[a-z]/.test(p),      label: 'Une minuscule' },
  { test: (p: string) => /\d/.test(p),          label: 'Un chiffre' },
  { test: (p: string) => /[@$!%*?&#^+=_\-]/.test(p), label: 'Un caractère spécial' },
]

const LEVELS = [
  { label: 'Très faible', color: 'bg-red-500',    textColor: 'text-red-600 dark:text-red-400'    },
  { label: 'Faible',      color: 'bg-orange-400', textColor: 'text-orange-600 dark:text-orange-400' },
  { label: 'Moyen',       color: 'bg-amber-400',  textColor: 'text-amber-600 dark:text-amber-400'  },
  { label: 'Fort',        color: 'bg-green-400',  textColor: 'text-green-600 dark:text-green-400'  },
  { label: 'Très fort',   color: 'bg-green-600',  textColor: 'text-green-700 dark:text-green-400'  },
]

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const score = RULES.filter(r => r.test(password)).length
  const level = LEVELS[Math.max(0, score - 1)]

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {LEVELS.map((l, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                i < score ? l.color : 'bg-slate-200 dark:bg-slate-700',
              )}
            />
          ))}
        </div>
        <span className={cn('text-xs font-semibold shrink-0 min-w-[60px] text-right', level.textColor)}>
          {level.label}
        </span>
      </div>

      {/* Rules checklist */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {RULES.map(r => {
          const ok = r.test(password)
          return (
            <div key={r.label} className={cn('flex items-center gap-1.5 text-xs', ok ? 'text-green-600 dark:text-green-400' : 'text-slate-400')}>
              <span className={cn('w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold', ok ? 'bg-green-100 dark:bg-green-900/40 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400')}>
                {ok ? '✓' : '·'}
              </span>
              {r.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
