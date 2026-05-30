import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Prestation } from '@/types'
import { formatPrice } from '@/lib/utils'
import { ProviderAvatar } from './ProviderAvatar'

export function PrestationCard({ prestation: p }: { prestation: Prestation }) {
  return (
    <Link
      to={`/services/${p.id}`}
      aria-label={`Voir ${p.titre}`}
    >
      <article className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4 hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-lg hover:shadow-orange-100/40 dark:hover:shadow-none transition-all duration-200 cursor-pointer h-full active:scale-[0.99]">

        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-semibold">
            {p.categorie.nom}
          </span>
          {!p.disponibilite && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              Indisponible
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white text-base leading-snug group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
            {p.titre}
          </h3>
          <p className="font-display font-bold text-orange-700 dark:text-orange-400 text-lg shrink-0 whitespace-nowrap">
            {formatPrice(p.prix)}
          </p>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{p.description}</p>

        <div className="flex items-center justify-between pt-1 mt-auto border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ProviderAvatar avatar={p.prestataire.avatar} size="xs" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {p.prestataire.prenom} {p.prestataire.nom}
            </p>
          </div>
          <span className="flex items-center gap-0.5 text-xs font-semibold text-orange-600 dark:text-orange-400 group-hover:translate-x-0.5 transition-transform">
            Voir <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </span>
        </div>
      </article>
    </Link>
  )
}
