import { type uint32 } from '../../types/numbers.ts'
import { Observable } from '../observable.ts'
import { type Subscription } from '../subscription.ts'
import { type IObserver } from '../types.ts'

export function concat<T, V = void>(...observables: Array<Observable<T, V>>) {
  return new Observable(function (observer: IObserver<T, V>) {
    let subscription: Subscription<T, V> | undefined = undefined

    function subscribeToNthObservable(n: uint32) {
      if (subscription) {
        subscription.unsubscribe()
      }

      const observable = observables[n]
      subscription = observable.subscribe({
        next(value: T) {
          observer.next(value)
        },
        error(err: unknown) {
          observer.error(err)
        },
        complete() {
          if (n < observables.length) {
            subscribeToNthObservable(n + 1)
          } else {
            observer.complete()
          }
        },
      })
    }

    if (observables.length > 0) {
      subscribeToNthObservable(0)
    } else {
      observer.complete()
    }

    return function unsubscribe() {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  })
}
