import { type SubstitutionContext } from '../rich/substitution.ts'
import { RICH_TEXT_DOCUMENT_SCHEMA } from '../rich.ts'
import { type TranslationBundleId } from '../types/bundles.ts'
import { type uint32 } from '../types/numbers.ts'
import { type Infer, Schema } from '../validation.ts'

export const LANGUAGE_IDS = ['en', 'ru'] as const
export type LanguageId = typeof LANGUAGE_IDS[uint32]
export const DEFAULT_LANGUAGE: LanguageId = 'en'
export const CANONICAL_LANGUAGE_STRING: Record<LanguageId, string> = {
  en: 'en-US',
  ru: 'ru-RU',
}

export const TRANSLATION_MAP_ENTRY_SCHEMA = Schema.union(
  Schema.string,
  RICH_TEXT_DOCUMENT_SCHEMA,
)

export type ITranslationMapEntry = Infer<typeof TRANSLATION_MAP_ENTRY_SCHEMA>

export const TRANSLATION_MAP_SCHEMA = Schema.record(TRANSLATION_MAP_ENTRY_SCHEMA)

export type ITranslationMap = Infer<typeof TRANSLATION_MAP_SCHEMA>

/**
 * This spec contains all information necessary to translate a single string in a fixed language
 */
export interface ITranslationSpec {
  bundleId: TranslationBundleId
  key: string
  context?: SubstitutionContext
}
