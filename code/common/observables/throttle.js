import { Observable } from './observable.js'

/**
 * @template T
 * @param {Observables.IObservable<T>} observable
 * @param {float64} time
 * @returns {Observables.IObservable<T>}
 */
export function throttleObservable(observable, time) {
  let lastEvent = Date.now()

  return new Observable(/** @param {Observables.IObserver<T>} observer */ function(observer) {
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
