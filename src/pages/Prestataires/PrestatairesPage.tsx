import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { ProviderAvatar } from '@/components/common/ProviderAvatar'
import { formatPrice } from '@/lib/utils'
import { prestations, categories } from '@/data/mock'

const providerProfiles = prestations.map(p => ({
  id: p.prestataire.id,
  nom: p.prestataire.nom,
  prenom: p.prestataire.prenom,
  avatar: p.prestataire.avatar,
  categorie: p.categorie.nom,
  avisCount: p.avisCount,
  prix: p.prix,
  localisation: 'Yaounde',
  disponible: p.disponibilite,
}))

export function PrestatairesPage() {
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState<string>('all')

  const filtered = providerProfiles.filter(p => {
    const matchCat = selectedCat === 'all' || p.categorie === selectedCat
    const matchSearch = search === '' ||
      `${p.prenom} ${p.nom}`.toLowerCase().includes(search.toLowerCase()) ||
      p.categorie.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">Nos prestataires</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Des professionnels verifies pres de chez vous</p>

          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ex: Atangana ou Maçon..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filter pills */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${
              selectedCat === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            Tous
          </button>
          {categories.slice(0, 6).map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.nom)}
              className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                selectedCat === c.nom
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              {c.nom}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {filtered.length} prestataire{filtered.length !== 1 ? 's' : ''} trouve{filtered.length !== 1 ? 's' : ''}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(prov => (
            <Link
              key={prov.id}
              to={`/prestataires/${prov.id}`}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <ProviderAvatar avatar={prov.avatar} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors truncate">
                    {prov.prenom} {prov.nom}
                  </p>
                  <Badge variant="info" className="mt-1">{prov.categorie}</Badge>
                </div>
                {prov.disponible
                  ? <span className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0" aria-label="Disponible" />
                  : <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" aria-label="Indisponible" />}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" aria-hidden />
                  {prov.localisation}
                </div>
                <p className="font-display font-bold text-blue-700 dark:text-blue-400 text-sm">{formatPrice(prov.prix)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
