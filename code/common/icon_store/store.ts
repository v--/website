import { BehaviorSubject, Observable } from '../observable.ts'
import { IconStoreError } from './error.ts'
import { type IIconRefPackage, type IIconSpec } from './types.ts'
import { type IconRefId } from '../types/bundles.ts'
import { type IFinalizeable } from '../types/finalizable.ts'

export class IconStore implements IFinalizeable {
  #package$: BehaviorSubject<IIconRefPackage>
  readonly package$: Observable<IIconRefPackage>

  constructor(pkg: IIconRefPackage = []) {
    this.#package$ = new BehaviorSubject(pkg ?? [])
    this.package$ = this.#package$
  }

  getCurrentPackage() {
    return this.#package$.value
  }

  updatePackage(newPackage: IIconRefPackage) {
    this.#package$.next(newPackage)
  }

  getIconSpec(refId: IconRefId, name: string): IIconSpec {
    const entry = this.#package$.value.find(e => e.id === refId)

    if (entry === undefined) {
      throw new IconStoreError('Icon ref has not been loaded', { refId })
    }

    const spec = entry.ref[name]

    if (spec === undefined) {
      throw new IconStoreError('Missing icon', { refId, name })
    }

    return spec
  }

  async finalize() {
    this.#package$.complete()
  }
}
