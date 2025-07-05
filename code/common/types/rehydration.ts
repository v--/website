import { ENCODED_ERROR_SCHEMA } from '../presentable_errors.ts'
import { DIRECTORY_SCHEMA, ICON_MAP_SCHEMA, PACMAN_REPOSITORY_SCHEMA } from '../services.ts'
import { LANGUAGE_IDS, TRANSLATION_MAP_SCHEMA } from '../translation.ts'
import { ICON_REF_IDS, TRANSLATION_BUNDLE_IDS } from '../types/bundles.ts'
import { type Infer, Schema } from '../validation.ts'

export const REHYDRATION_DATA_SCHEMA = Schema.object({
  iconMaps: Schema.array(
    Schema.object({
      refId: Schema.literal(...ICON_REF_IDS),
      map: ICON_MAP_SCHEMA,
    }),
  ),
  translationMaps: Schema.array(
    Schema.object({
      bundleId: Schema.literal(...TRANSLATION_BUNDLE_IDS),
      languageId: Schema.literal(...LANGUAGE_IDS),
      map: TRANSLATION_MAP_SCHEMA,
    }),
  ),
  pageData: Schema.optional(
    Schema.union(
      Schema.object({ tag: Schema.literal('files'), content: DIRECTORY_SCHEMA }),
      Schema.object({ tag: Schema.literal('pacman'), content: PACMAN_REPOSITORY_SCHEMA }),
      Schema.object({ tag: Schema.literal('error'), content: ENCODED_ERROR_SCHEMA }),
    ),
  ),
})

export type IRehydrationData = Infer<typeof REHYDRATION_DATA_SCHEMA>
export type PageDataHydrationTag = 'files' | 'pacman' | 'error'
