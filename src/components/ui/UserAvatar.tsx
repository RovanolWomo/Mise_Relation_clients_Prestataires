import { cn } from '@/lib/utils'

interface UserAvatarProps {
  nom: string
  prenom: string
  avatar?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export function UserAvatar({ nom, prenom, avatar, size = 'md', className }: UserAvatarProps) {
  const initials = (prenom?.[0] ?? '?') + (nom?.[0] ?? '')
  const sizeCls = SIZES[size]

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={`${prenom} ${nom}`}
        className={cn('rounded-full object-cover shrink-0', sizeCls, className)}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          target.nextElementSibling?.removeAttribute('style')
        }}
      />
    )
  }

  return (
    <div className={cn(
      'rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shrink-0',
      sizeCls, className
    )}>
      {initials.toUpperCase()}
    </div>
  )
}
