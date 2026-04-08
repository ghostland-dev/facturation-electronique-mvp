'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { translations, type Locale, type TranslationKeys } from './translations'

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string 
      ? T[K] extends object 
        ? `${K}.${NestedKeyOf<T[K]>}` 
        : K 
      : never 
    }[keyof T]
  : never

type TranslationKey = NestedKeyOf<TranslationKeys>

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let result: unknown = obj
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key]
    } else {
      return path // Return the key if not found
    }
  }
  
  return typeof result === 'string' ? result : path
}

export function I18nProvider({ 
  children, 
  initialLocale = 'fr' 
}: { 
  children: ReactNode
  initialLocale?: Locale 
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  const t = useCallback((key: TranslationKey): string => {
    return getNestedValue(translations[locale] as unknown as Record<string, unknown>, key)
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function useTranslation() {
  const { t, locale, setLocale } = useI18n()
  return { t, locale, setLocale }
}
