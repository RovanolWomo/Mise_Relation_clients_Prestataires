const PALETTE = [
  'bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-orange-500',
  'bg-pink-600', 'bg-teal-600', 'bg-amber-600', 'bg-rose-600', 'bg-indigo-600',
]

function hashColor(s: string) {
  const n = s.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTE[n % PALETTE.length]
}

const SIZE = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
}

export function ProviderAvatar({
  avatar,
  size = 'md',
  className = '',
}: {
  avatar: string
  size?: keyof typeof SIZE
  className?: string
}) {
  return (
    <div
      className={`${SIZE[size]} ${hashColor(avatar)} rounded-full flex items-center justify-center text-white font-bold shrink-0 select-none shadow-sm ${className}`}
      aria-hidden
    >
      {avatar}
    </div>
  )
}
