import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap, Bell, Sun, Moon, ChevronDown, Menu, X, LogOut, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/I18nContext'
import { useTheme } from '@/context/ThemeContext'
import { UserAvatar } from '@/components/ui/UserAvatar'

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
  user: { prenom: string; nom?: string; role: string; avatar: string; avatarUrl?: string }
  items: SidebarItem[]
  children: React.ReactNode
}

const MOCK_NOTIFS = [
  { id: 1, message: 'Alain Mbeki a accepté votre demande de plomberie', type: 'success', lu: false, time: 'Il y a 30 min' },
  { id: 2, message: 'Rappel : intervention demain à 09h00', type: 'info', lu: false, time: 'Il y a 2h' },
  { id: 3, message: 'Votre paiement de 8 000 FCFA a été confirmé', type: 'success', lu: true, time: 'Hier' },
]

function NavItem({ item, pathname, onClose }: { item: SidebarItem; pathname: string; onClose: () => void }) {
  const Icon = item.icon!
  const active = item.active ?? (item.href
    ? (item.href.length > 1 ? pathname === item.href : pathname === '/')
    : false)
  const cls = cn(
    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150 w-full text-left',
    active
      ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200',
  )
  const inner = (
    <>
      <Icon className="w-4 h-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{item.label}</span>
      {(item.badge ?? 0) > 0 && (
        <span className={cn(
          'text-[11px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center',
          active ? 'bg-orange-600 text-white' : 'bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-400',
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
  const [notifOpen, setNotifOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)
  const { locale, setLocale } = useT()
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const notifRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  const unread = notifs.filter(n => !n.lu).length

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function markAllRead() {
    setNotifs(n => n.map(x => ({ ...x, lu: true })))
  }

  const profileHref = user.role === 'prestataire' ? '/prestataire/profil' : user.role === 'particulier' ? '/particulier/profil' : '/admin'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm h-16">
        <div className="h-full px-4 flex items-center gap-2">
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors active:scale-95"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-orange-700 transition-colors">
              <Zap className="w-4 h-4 text-white" aria-hidden />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white hidden sm:block">
              Presto<span className="text-orange-500">link</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors active:scale-95"
              aria-label="Langue"
            >
              {locale.toUpperCase()}
            </button>
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors active:scale-95"
              aria-label="Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Notification bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen(v => !v); setAvatarOpen(false) }}
                className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 cursor-pointer transition-colors active:scale-95"
                aria-label={`Notifications${unread > 0 ? ` (${unread} non lues)` : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                    {unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">Notifications</h3>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-xs text-orange-600 dark:text-orange-400 hover:underline cursor-pointer">
                        Tout marquer lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifs.map(n => (
                      <button
                        key={n.id}
                        onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, lu: true } : x))}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-3 text-left cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800',
                          !n.lu && 'bg-orange-50/50 dark:bg-orange-900/10',
                        )}
                      >
                        <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', n.lu ? 'bg-transparent' : 'bg-orange-500')} />
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs leading-snug', n.lu ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium')}>
                            {n.message}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {notifs.length === 0 && (
                    <p className="text-center text-sm text-slate-400 py-8">Aucune notification</p>
                  )}
                </div>
              )}
            </div>

            {/* Avatar dropdown */}
            <div ref={avatarRef} className="relative ml-1">
              <button
                onClick={() => { setAvatarOpen(v => !v); setNotifOpen(false) }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 cursor-pointer transition-colors active:scale-95"
                aria-haspopup="menu"
                aria-expanded={avatarOpen}
              >
                <UserAvatar nom={user.nom || user.avatar} prenom={user.prenom} avatar={user.avatarUrl} size="sm" />
                <span className="text-sm font-semibold text-orange-800 dark:text-orange-300 hidden sm:block">{user.prenom}</span>
                <ChevronDown className={cn('w-3.5 h-3.5 text-orange-400 transition-transform duration-150', avatarOpen && 'rotate-180')} />
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden" role="menu">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.prenom}</p>
                    <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to={profileHref}
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 cursor-pointer transition-colors"
                      role="menuitem"
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </Link>
                    <Link
                      to="#"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </Link>
                  </div>
                  <div className="py-1 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      to="/connexion"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
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
            <Link
              to={profileHref}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <ProviderAvatar avatar={user.avatar} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.prenom}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
            </Link>
            <Link
              to="/connexion"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden />
              Déconnexion
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
