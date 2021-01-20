import { Observable } from './observable.js'

/**
 * @template T
 * @param {TObservables.IObservable<T>} observable
 * @param {TNum.Float64} time
 * @returns {TObservables.IObservable<T>}
 */
export function throttleObservable(observable, time) {
  let lastEvent = Date.now()

  return new Observable(/** @param {TObservables.IObserver<T>} observer */ function(observer) {
    observable.subscribe({
      error: observer.error,
      complete: observer.complete,
      next: function(value) {
        const currentEvent = Date.now()

        if (currentEvent - lastEvent >= time) {
          lastEvent = currentEvent
          observer.next(value)
        }
      }
    })
  })
}
