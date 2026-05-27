import { Link } from 'react-router-dom'
import { Zap, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-slate-800">

          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" aria-hidden />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Presto<span className="text-orange-500">link</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              La plateforme de confiance pour connecter particuliers et prestataires techniques en Afrique.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wide">Services</h3>
            <ul className="space-y-2 text-sm">
              {['Plomberie', 'Electricite', 'Informatique', 'Peinture', 'Menuiserie'].map(s => (
                <li key={s}>
                  <Link to="/services" className="hover:text-white transition-colors cursor-pointer">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wide">Plateforme</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Comment ca marche', href: '/#comment' },
                { label: 'Devenir prestataire', href: '/inscription' },
                { label: 'Tarifs', href: '/tarifs' },
                { label: 'FAQ', href: '/faq' },
              ].map(l => (
                <li key={l.href}>
                  <Link to={l.href} className="hover:text-white transition-colors cursor-pointer">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wide">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-400 shrink-0" aria-hidden />+237 6 50 00 00 00</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400 shrink-0" aria-hidden />contact@prestolink.cm</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" aria-hidden />Yaounde, Cameroun</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>&copy; 2026 Prestolink. Tous droits reserves.</p>
          <div className="flex gap-4">
            <Link to="/confidentialite" className="hover:text-slate-400 transition-colors cursor-pointer">Confidentialite</Link>
            <Link to="/conditions" className="hover:text-slate-400 transition-colors cursor-pointer">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
