import { ICON_REF_PACKAGE_SCHEMA } from '../icon_store.ts'
import { ENCODED_ERROR_SCHEMA } from '../presentable_errors.ts'
import { DIRECTORY_SCHEMA, PACMAN_REPOSITORY_SCHEMA } from '../services.ts'
import { TRANSLATION_PACKAGE_SCHEMA } from '../translation.ts'
import { type Infer, Schema } from '../validation.ts'

export const REHYDRATION_DATA_SCHEMA = Schema.object({
  iconRefPackage: ICON_REF_PACKAGE_SCHEMA,
  translationPackage: TRANSLATION_PACKAGE_SCHEMA,
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
