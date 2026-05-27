import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'cta' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
    'transition-all duration-200 cursor-pointer select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  ].join(' ')

  const variants = {
    primary:   'bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.95] hover:shadow-md transition-all duration-200 shadow-sm shadow-orange-200',
    secondary: 'bg-orange-100 text-orange-700 hover:bg-orange-200 active:scale-[0.95] transition-all duration-200',
    ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.95] transition-all duration-200',
    outline:   'border border-orange-200 text-orange-700 bg-white hover:bg-orange-50 hover:border-orange-300 active:scale-[0.95] transition-all duration-200',
    cta:       'bg-green-500 text-white hover:bg-green-600 active:scale-[0.95] hover:shadow-md transition-all duration-200 shadow-sm shadow-green-200',
    danger:    'bg-red-500 text-white hover:bg-red-600 active:scale-[0.95] transition-all duration-200',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

