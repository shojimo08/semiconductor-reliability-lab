import { useI18n } from '../i18n/useI18n'
import type { Language } from '../i18n/translations'

const options: Array<{ language: Language; label: string }> = [
  { language: 'zh-TW', label: '繁中' },
  { language: 'en', label: 'EN' },
  { language: 'ja', label: '日本語' },
]

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n()
  return <nav className="language-selector" aria-label={t('language.label')}>
    {options.map((option) => <button key={option.language} type="button" lang={option.language}
      aria-pressed={language === option.language} className={language === option.language ? 'active' : ''}
      onClick={() => setLanguage(option.language)}>{option.label}</button>)}
  </nav>
}
