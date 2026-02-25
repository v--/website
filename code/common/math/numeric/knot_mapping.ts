import { isClose } from '../../support/floating.ts'
import { schwartzSort } from '../../support/iteration.ts'
import { type float64, type uint32 } from '../../types/numbers.ts'
import { type IPlainVec2D } from '../geom2d.ts'

export class KnotMapping {
  #entries: IPlainVec2D[]

  constructor(entries?: Iterable<IPlainVec2D>) {
    if (entries) {
      this.#entries = schwartzSort(v => v.x, entries)
    } else {
      this.#entries = []
    }
  }

  isEmpty() {
    return this.#entries.length === 0
  }

  set(x: float64, y: float64) {
    return new KnotMapping([
      ...this.iterEntries().filter(v => v.x !== x),
      { x, y },
    ])
  }

  getValue(x: float64): float64 | undefined {
    for (const v of this.#entries) {
      if (isClose(v.x, x)) {
        return v.y
      }
    }

    return undefined
  }

  delete(x: float64) {
    return new KnotMapping(
      this.iterEntries().filter(v => v.x !== x),
    )
  }

  getNodeCount(): uint32 {
    return this.#entries.length
  }

  iterEntries(): IteratorObject<IPlainVec2D> {
    return this.#entries[Symbol.iterator]()
  }

  * iterX(): Generator<float64> {
    for (const { x } of this.#entries) {
      yield x
    }
  }

  * iterY(): Generator<float64> {
    for (const { y } of this.#entries) {
      yield y
    }
  }
}
