import { type IIconRef, type IIconRefPackage } from '../icon_store.ts'
import { type IconRefId } from '../types/bundles.ts'

export interface IIconRefService {
  getIconRef(id: IconRefId): Promise<IIconRef>
  getIconRefPackage(ids: IconRefId[]): Promise<IIconRefPackage>
}
