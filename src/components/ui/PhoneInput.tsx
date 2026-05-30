import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const COUNTRIES = [
  { code: 'CM', name: 'Cameroun',         dial: '+237', flag: '🇨🇲' },
  { code: 'SN', name: 'Sénégal',          dial: '+221', flag: '🇸🇳' },
  { code: 'CI', name: "Côte d'Ivoire",   dial: '+225', flag: '🇨🇮' },
  { code: 'GH', name: 'Ghana',            dial: '+233', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria',          dial: '+234', flag: '🇳🇬' },
  { code: 'GA', name: 'Gabon',            dial: '+241', flag: '🇬🇦' },
  { code: 'CG', name: 'Congo',            dial: '+242', flag: '🇨🇬' },
  { code: 'FR', name: 'France',           dial: '+33',  flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique',         dial: '+32',  flag: '🇧🇪' },
]

const PLACEHOLDERS: Record<string, string> = {
  CM: '670 00 00 00',
  SN: '77 000 00 00',
  CI: '07 00 00 00 00',
  GH: '024 000 0000',
  NG: '080 0000 0000',
  FR: '06 00 00 00 00',
}

interface PhoneInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
}

export function PhoneInput({ label, value, onChange, required, className }: PhoneInputProps) {
  const [selected, setSelected] = useState(COUNTRIES[0])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        <div ref={ref} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1.5 h-[46px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 transition-all cursor-pointer select-none"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="text-lg leading-none">{selected.flag}</span>
            <span className="hidden sm:inline text-xs text-slate-600 dark:text-slate-400">{selected.dial}</span>
            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-150', open && 'rotate-180')} />
          </button>

          {open && (
            <div
              role="listbox"
              className="absolute top-full left-0 mt-1 z-50 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="max-h-60 overflow-y-auto">
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    role="option"
                    aria-selected={selected.code === c.code}
                    onClick={() => { setSelected(c); setOpen(false) }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left cursor-pointer transition-colors',
                      selected.code === c.code
                        ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                    )}
                  >
                    <span className="text-base shrink-0">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-slate-400 shrink-0">{c.dial}</span>
                    {selected.code === c.code && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          type="tel"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={PLACEHOLDERS[selected.code] ?? 'Numéro de téléphone'}
          required={required}
          className="flex-1 h-[46px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all"
        />
      </div>
    </div>
  )
}
