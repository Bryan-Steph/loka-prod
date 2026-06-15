'use client'

import { createContext, useContext, useEffect, useState, createElement, type ReactNode } from 'react'
// Local translations and types inline to avoid a missing-module error.
// Replace or extend these with your real translations as needed.
type Lang = 'en' | 'fr'
type TranslationKey = string

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // example keys — add your real translations here
    greeting: 'Hello',
  },
  fr: {
    greeting: 'Bonjour',
  },
}
import { useAuthStore } from '@/store/authStore'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'loka-lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')
  const user = useAuthStore((s) => s.user)

  // Initial load: prefer logged-in user's language_pref, fall back to localStorage
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null
    if (user?.language_pref === 'fr' || user?.language_pref === 'en') {
      setLangState(user.language_pref)
    } else if (stored === 'en' || stored === 'fr') {
      setLangState(stored)
    }
  }, [user?.language_pref])

  const setLang = (next: Lang) => {
    setLangState(next)
    window.localStorage.setItem(STORAGE_KEY, next)

    // Persist for logged-in users — fire and forget
    if (user) {
      fetch('/api/users/me', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ language_pref: next }),
      }).catch(() => {})
    }
  }

  const t = (key: TranslationKey): string => translations[lang][key] ?? translations.en[key] ?? key

  return createElement(
    LanguageContext.Provider,
    { value: { lang, setLang, t } },
    children
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    // Fail-safe: never crash if provider isn't mounted above.
    // Returns English defaults — page renders, translation toggle just won't work.
    return {
      lang: 'en',
      setLang: () => {},
      t: (key: TranslationKey) => translations.en[key] ?? key,
    }
  }
  return ctx
}