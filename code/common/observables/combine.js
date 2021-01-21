import { Observable } from './observable.js'

/**
 * @param {Array<TObservables.IObservable<unknown>>} observables
 * @return {TObservables.IObservable<unknown[]>}
 */
export function combineLatest(...observables) {
  /** @type {TCons.NonStrictMap<TObservables.IObservable<unknown>, unknown>} */
  const values = new Map()

  return new Observable(function(observer) {
    for (const observable of observables) {
      observable.subscribe({
        error: observer.error,
        complete: /** @param {unknown} value */ function(value) {
          return observer.complete([value])
        },
        next: /** @param {unknown} value */ function(value) {
          values.set(observable, value)

          if (values.size === observables.length) {
            observer.next([...values.values()])
          }
        }
      })
    }
  })
}

/**
 * @template T, S
 * @param {TObservables.IObservable<T>} a
 * @param {TObservables.IObservable<S>} b
 */
export function combineLatest2(a, b) {
  return combineLatest(a, b)
}
