import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

const SENTINEL = {}

export function distinctUntilChanged<T>() {
  return function (observable: Observable<T>): Observable<T> {
    return new Observable((observer: IObserver<T>) => {
      let lastEmitted: T = SENTINEL as T

      const subscription = observable.subscribe({
        ...observer,
        next(value: T) {
          if (lastEmitted !== value) {
            observer.next(value)
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
