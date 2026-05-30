import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { categories as mockCategories } from '@/data/mock'
import type { Categorie } from '@/types'

export function useCategories() {
  const [categories, setCategories] = useState<Categorie[]>(mockCategories)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get<Categorie[]>('/services/categories')
      .then(data => {
        if (data?.length) setCategories(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { categories, loading }
}
