import { Observable } from './observable.js'

export function combineLatest (...observables) {
  const values = new Map()

  return new Observable(function (observer) {
    for (const observable of observables) {
      observable.subscribe({
        error: observer.error,
        complete: observer.complete,
        next: function (value) {
          values.set(observable, value)

          if (values.size === observables.length) {
            observer.next([...values.values()])
          }
        }
      })
    }
  })
}
