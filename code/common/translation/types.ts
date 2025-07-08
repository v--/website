import { WEBSITE_LANGUAGE_IDS } from '../languages.ts'
import { type SubstitutionContext } from '../rich/substitution.ts'
import { RICH_TEXT_DOCUMENT_SCHEMA } from '../rich.ts'
import { TRANSLATION_BUNDLE_IDS, type TranslationBundleId } from '../types/bundles.ts'
import { type Infer, Schema } from '../validation.ts'

export const TRANSLATION_MAP_ENTRY_SCHEMA = Schema.union(
  Schema.string,
  RICH_TEXT_DOCUMENT_SCHEMA,
)

export type ITranslationMapEntry = Infer<typeof TRANSLATION_MAP_ENTRY_SCHEMA>

export const TRANSLATION_MAP_SCHEMA = Schema.record(Schema.string, TRANSLATION_MAP_ENTRY_SCHEMA)

export type ITranslationMap = Infer<typeof TRANSLATION_MAP_SCHEMA>

export const TRANSLATION_PACKAGE_SCHEMA = Schema.array(
  Schema.object({
    bundleId: Schema.literal(...TRANSLATION_BUNDLE_IDS),
    languageId: Schema.literal(...WEBSITE_LANGUAGE_IDS),
    map: TRANSLATION_MAP_SCHEMA,
  }),
)

export type ITranslationPackage = Infer<typeof TRANSLATION_PACKAGE_SCHEMA>

/**
 * This spec contains all information necessary to translate a single string in a fixed language
 */
export interface ITranslationSpec {
  bundleId: TranslationBundleId
  key: string
  context?: SubstitutionContext
}
