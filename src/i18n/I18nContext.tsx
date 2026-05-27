import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, type Locale, type Translations } from './translations'

type I18nContextType = {
  locale: Locale
  t: Translations
  setLocale: (l: Locale) => void
}

const I18nContext = createContext<I18nContextType>({
  locale: 'fr',
  t: translations.fr,
  setLocale: () => {},
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr')
  return (
    <I18nContext.Provider value={{ locale, t: translations[locale] as Translations, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useT() {
  return useContext(I18nContext)
}
