import { type float64 } from '../../types/numbers.ts'
import { Observable } from '../observable.ts'

export function throttleObservable<T>(observable: Observable<T>, period: float64): Observable<T> {
  let lastEvent = performance.now()

  return new Observable<T>(function (observer) {
    return observable.subscribe({
      ...observer,
      next: function (value) {
        const currentEvent = performance.now()

        if (currentEvent - lastEvent >= period) {
          lastEvent = currentEvent
          observer.next(value)
        }
      },
    })
  })
}
