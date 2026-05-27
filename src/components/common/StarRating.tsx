import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  note: number
  size?: 'sm' | 'md'
  showValue?: boolean
}

export function StarRating({ note, size = 'sm', showValue = false }: StarRatingProps) {
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-1" aria-label={`Note : ${note} sur 5`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <Star
            key={n}
            aria-hidden
            className={cn(dim, n <= Math.round(note)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-100 text-slate-200',
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-slate-600 ml-0.5">{note}</span>
      )}
    </div>
  )
}

