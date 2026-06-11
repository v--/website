import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

const SENTINEL = {}

/**
 * One of the intentional differences with RxJS. A curried function taking a reference observable
 * and a source observable and emitting the latest value, if any, from the source, whenever the reference emits.
 */
export function bufferLatest<T>(reference: Observable<void>) {
  return function (observable: Observable<T>): Observable<T> {
    return new Observable((observer: IObserver<T>) => {
      let lastEmitted: T = SENTINEL as T

      const subscription = observable.subscribe({
        ...observer,
        next(value: T) {
          lastEmitted = value
        },
      })

      const refSubscription = reference.subscribe({
        next(_value: void) {
          if (lastEmitted !== SENTINEL) {
            observer.next(lastEmitted)
            lastEmitted = SENTINEL as T
          }
        },
        error: observer.error,
        complete: observer.complete,
      })

      return function unsubscribe() {
        subscription.unsubscribe()
        refSubscription.unsubscribe()
      }
    })
  }
}
