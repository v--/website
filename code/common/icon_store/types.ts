import { ICON_REF_IDS } from '../types/bundles.ts'
import { type Infer, Schema } from '../validation.ts'

export const ICON_SPEC_SCHEMA = Schema.object({
  path: Schema.string,
  viewBox: Schema.string,
})

export type IIconSpec = Infer<typeof ICON_SPEC_SCHEMA>

export const ICON_REF_SCHEMA = Schema.record(Schema.string, ICON_SPEC_SCHEMA)

export type IIconRef = Infer<typeof ICON_REF_SCHEMA>

export const ICON_REF_PACKAGE_SCHEMA = Schema.array(
  Schema.object({
    id: Schema.literal(...ICON_REF_IDS),
    ref: ICON_REF_SCHEMA,
  }),
)

export type IIconRefPackage = Infer<typeof ICON_REF_PACKAGE_SCHEMA>
