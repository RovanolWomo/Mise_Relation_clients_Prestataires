import { useState } from 'react'
import { Search, Filter, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { ProviderAvatar } from '@/components/common/ProviderAvatar'
import { formatPrice } from '@/lib/utils'
import { prestations, categories } from '@/data/mock'

export function ServicesPage() {
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState<number | null>(null)

  const filtered = prestations.filter(p => {
    const matchCat = selectedCat === null || p.categorie.id === selectedCat
    const matchSearch = search === '' ||
      p.titre.toLowerCase().includes(search.toLowerCase()) ||
      p.categorie.nom.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">Services disponibles</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Trouvez le prestataire qu'il vous faut</p>

          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ex: Plomberie, Electricité, Informatique..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="lg:w-56 shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-slate-400" aria-hidden />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categories</span>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedCat(null)}
                  className={`text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    selectedCat === null
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Toutes les categories
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCat(c.id)}
                    className={`text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      selectedCat === c.id
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{c.nom}</span>
                    <span className="text-xs text-slate-400">{c.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {filtered.length} service{filtered.length !== 1 ? 's' : ''} trouve{filtered.length !== 1 ? 's' : ''}
            </p>

            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                <p className="text-slate-400 text-sm">Aucun service ne correspond a votre recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map(p => (
                  <Link
                    key={p.id}
                    to={`/services/${p.id}`}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <Badge variant="info" className="mb-2">{p.categorie.nom}</Badge>
                        <h3 className="font-display font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {p.titre}
                        </h3>
                      </div>
                      {!p.disponibilite && (
                        <span className="shrink-0 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Indisponible</span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{p.description}</p>

                    <div className="flex items-center gap-3 mb-4">
                      <ProviderAvatar avatar={p.prestataire.avatar} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {p.prestataire.prenom} {p.prestataire.nom}
                        </p>
                        <span className="flex items-center gap-0.5 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" aria-hidden />
                          Yaounde
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                      <span className="text-xs text-slate-400">
                        {p.disponibilite ? 'Disponible' : 'Indisponible'}
                      </span>
                      <p className="font-display font-bold text-blue-700 dark:text-blue-400">{formatPrice(p.prix)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
