import { type uint32 } from '../types/numbers.ts'

export const LANGUAGE_IDS = ['en', 'ru', 'bg'] as const
export type LanguageId = typeof LANGUAGE_IDS[uint32]

export const WEBSITE_LANGUAGE_IDS = ['en', 'ru'] as const // Only those languages in which the site is translated
export type WebsiteLanguageId = typeof WEBSITE_LANGUAGE_IDS[uint32]

export const DEFAULT_LANGUAGE: WebsiteLanguageId = 'en'
export const API_LANGUAGE = DEFAULT_LANGUAGE
