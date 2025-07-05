import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

const SENTINEL = {}

export function distinctUntilChanged<T>(comparator: (a: T, b: T) => boolean = (a: T, b: T) => a === b) {
  return function (observable: Observable<T>): Observable<T> {
    return new Observable((observer: IObserver<T>) => {
      let lastValue: T | object = SENTINEL

      return observable.subscribe({
        next(value: T) {
          if (lastValue !== SENTINEL && comparator(value, lastValue as T)) {
            return
          }

          lastValue = value
          observer.next(value)
        },

        error(err: unknown) {
          observer.error(err)
        },

        complete() {
          observer.complete()
        },
      })
    })
  }
}
