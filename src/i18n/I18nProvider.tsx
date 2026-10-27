import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { resolveLanguage, translate, type Language } from './translations'
import { I18nContext, type I18nValue } from './context'

const STORAGE_KEY = 'semiconductor-reliability-lab.language'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try { return resolveLanguage(localStorage.getItem(STORAGE_KEY)) } catch { return 'en' }
  })

  useEffect(() => {
    document.documentElement.lang = language
    try { localStorage.setItem(STORAGE_KEY, language) } catch { /* Storage can be unavailable in privacy modes. */ }
  }, [language])

  const value = useMemo<I18nValue>(() => ({
    language,
    setLanguage: setLanguageState,
    t: (key, values) => translate(language, key, values),
  }), [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
