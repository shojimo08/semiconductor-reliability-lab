import { createContext } from 'react'
import type { Language } from './translations'

export interface I18nValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, values?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nValue | null>(null)
