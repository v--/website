import { Observable } from './observable.js'

/**
 * @template T, R
 * @param {(value: T) => R} transform
 */
export function map(transform) {
  /**
   * @param {TObservables.IObservable<T>} observable
   */
  return function(observable) {
    return new Observable(observer => {
      observable.subscribe({
        /** @param {T} value */
        next(value) {
          observer.next(transform(value))
        },

        /** @param {Error} err */
        error(err) {
          observer.error(err)
        },

        complete() {
          observer.complete()
        }
      })
    })
  }
}

/**
 * @template T
 * @param {TObservables.IObservable<T>} observable
 */
export function microtaskEnqueue(observable) {
  return new Observable(observer => {
    observable.subscribe({
      /** @param {T} value */
      next(value) {
        Promise.resolve().then(() => {
          observer.next(value)
        })
      },

      /** @param {Error} err */
      error(err) {
        observer.error(err)
      },

      complete() {
        observer.complete()
      }
    })
  })
}
