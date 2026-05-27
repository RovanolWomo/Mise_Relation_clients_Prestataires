import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap, Sun, Moon, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/I18nContext'
import { useTheme } from '@/context/ThemeContext'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { t, locale, setLocale } = useT()
  const { theme, toggle } = useTheme()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const frosted = !isHome || scrolled

  const navLinks = [
    { label: t.nav.home,      href: '/' },
    { label: t.nav.services,  href: '/services' },
    { label: t.nav.providers, href: '/prestataires' },
    { label: t.nav.how,       href: '/#comment' },
  ]

  return (
    <header className={cn(
      'fixed top-0 inset-x-0 z-50 transition-all duration-300',
      frosted
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm'
        : 'bg-transparent',
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" aria-hidden />
            </div>
            <span className={cn('font-display font-bold text-xl', frosted ? 'text-slate-900 dark:text-white' : 'text-white')}>
              Presto<span className="text-orange-500">link</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer',
                  pathname === link.href
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                    : frosted
                      ? 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                      : 'text-white/80 hover:text-white hover:bg-white/10',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
                frosted ? 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white/80 hover:bg-white/10',
              )}
              aria-label="Changer la langue"
            >
              <Globe className="w-3.5 h-3.5" aria-hidden />
              {locale.toUpperCase()}
            </button>
            <button
              onClick={toggle}
              className={cn(
                'p-2 rounded-lg cursor-pointer transition-colors',
                frosted ? 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white/80 hover:bg-white/10',
              )}
              aria-label={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <Link to="/connexion">
              <Button variant="primary" size="sm">{t.nav.login}</Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className={cn('px-2 py-1.5 rounded-lg text-xs font-semibold cursor-pointer', frosted ? 'text-slate-500' : 'text-white/80')}
            >
              {locale.toUpperCase()}
            </button>
            <button
              onClick={toggle}
              className={cn('p-2 rounded-lg cursor-pointer', frosted ? 'text-slate-500' : 'text-white/80')}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setOpen(v => !v)}
              className={cn('p-2 rounded-lg cursor-pointer transition-colors', frosted ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10')}
              aria-label={open ? 'Fermer' : 'Menu'}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-4 flex flex-col gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 cursor-pointer transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Link to="/connexion" onClick={() => setOpen(false)}>
              <Button variant="primary" size="md" className="w-full">{t.nav.login}</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

