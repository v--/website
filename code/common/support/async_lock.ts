import { BehaviorSubject, filter, first } from '../observable.ts'
import { type IFinalizeable } from '../types/finalizable.ts'

export class AsyncLock implements IFinalizeable {
  #locked$ = new BehaviorSubject(false)

  async aquire() {
    while (this.#locked$.value) {
      const observable$ = this.#locked$.pipe(
        filter(locked => !locked),
      )

      await first(observable$)
    }

    this.#locked$.next(true)
  }

  async release() {
    this.#locked$.next(false)
  }

  async finalize() {
    this.#locked$.complete()
  }
}
