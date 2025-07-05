import { type IconRefId } from '../types/bundles.ts'
import { type Infer, Schema } from '../validation.ts'

export const ICON_SPEC_SCHEMA = Schema.object({
  path: Schema.string,
  viewBox: Schema.string,
})

export type IIconSpec = Infer<typeof ICON_SPEC_SCHEMA>

export const ICON_MAP_SCHEMA = Schema.record(ICON_SPEC_SCHEMA)

export type IIconRef = Infer<typeof ICON_MAP_SCHEMA>

export interface IIconService {
  getIconRef(id: IconRefId): Promise<IIconRef>
  getPreloadedIconRef(id: IconRefId): IIconRef
}
