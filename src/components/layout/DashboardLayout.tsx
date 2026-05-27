import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap, Bell, Sun, Moon, ChevronDown, Menu, X, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/I18nContext'
import { useTheme } from '@/context/ThemeContext'
import { ProviderAvatar } from '@/components/common/ProviderAvatar'

export interface SidebarItem {
  icon?: React.ElementType
  label?: string
  href?: string
  active?: boolean
  onClick?: () => void
  badge?: number
  separator?: boolean
}

interface DashboardLayoutProps {
  user: { prenom: string; role: string; avatar: string }
  items: SidebarItem[]
  children: React.ReactNode
}

function NavItem({
  item,
  pathname,
  onClose,
}: {
  item: SidebarItem
  pathname: string
  onClose: () => void
}) {
  const Icon = item.icon!
  const active = item.active ?? (item.href ? pathname.startsWith(item.href) && item.href !== '/' ? true : pathname === item.href : false)
  const cls = cn(
    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150 w-full text-left',
    active
      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
  )
  const inner = (
    <>
      <Icon className="w-4 h-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{item.label}</span>
      {(item.badge ?? 0) > 0 && (
        <span className={cn(
          'text-[11px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center',
          active ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-400',
        )}>
          {item.badge}
        </span>
      )}
    </>
  )

  if (item.href) {
    return (
      <Link to={item.href} onClick={() => { onClose(); item.onClick?.() }} className={cls}>
        {inner}
      </Link>
    )
  }
  return (
    <button onClick={() => { onClose(); item.onClick?.() }} className={cls}>
      {inner}
    </button>
  )
}

export function DashboardLayout({ user, items, children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false)
  const { locale, setLocale } = useT()
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm h-16">
        <div className="h-full px-4 flex items-center gap-2">
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" aria-hidden />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white hidden sm:block">
              Presto<span className="text-orange-500">link</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              aria-label="Langue"
            >
              {locale.toUpperCase()}
            </button>
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              aria-label="Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 cursor-pointer transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" aria-hidden />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer transition-colors ml-1">
              <ProviderAvatar avatar={user.avatar} size="xs" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-300 hidden sm:block">{user.prenom}</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Mobile overlay */}
        {open && (
          <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={cn(
          'fixed left-0 top-16 bottom-0 w-60 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-40 flex flex-col transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}>
          <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5" aria-label="Navigation">
            {items.map((item, i) =>
              item.separator
                ? <hr key={i} className="border-slate-100 dark:border-slate-800 my-2" />
                : <NavItem key={i} item={item} pathname={pathname} onClose={() => setOpen(false)} />
            )}
          </nav>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
              <ProviderAvatar avatar={user.avatar} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.prenom}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
            </div>
            <Link
              to="/connexion"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden />
              Deconnexion
            </Link>
          </div>
        </aside>

        {/* Page content */}
        <div className="flex-1 min-w-0 md:ml-60">
          {children}
        </div>
      </div>
    </div>
  )
}
