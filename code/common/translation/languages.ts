import { type uint32 } from '../types/numbers.ts'

export const LANGUAGE_IDS = ['en', 'ru'] as const
export type LanguageId = typeof LANGUAGE_IDS[uint32]
export const DEFAULT_LANGUAGE: LanguageId = 'en'
export const API_LANGUAGE = DEFAULT_LANGUAGE
export const CANONICAL_LANGUAGE_STRING: Record<LanguageId, string> = {
  en: 'en-US',
  ru: 'ru-RU',
}
