import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

const SENTINEL = {}

export function pairwise<T>() {
  return function (observable: Observable<T>): Observable<[T, T]> {
    return new Observable((observer: IObserver<[T, T]>) => {
      let lastEmitted: T = SENTINEL as T

      const subscription = observable.subscribe({
        ...observer,
        next(value: T) {
          if (lastEmitted !== SENTINEL) {
            observer.next([lastEmitted, value] as [T, T])
          }

          lastEmitted = value
        },
      })

      return function unsubscribe() {
        subscription.unsubscribe()
      }
    })
  }
}
