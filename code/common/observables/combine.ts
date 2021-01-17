import { Observable } from './observable.js'

export function combineLatest<T>(_a: Observables.IObservable<T>): Observables.IObservable<[T]> 
export function combineLatest<T, R>(_a: Observables.IObservable<T>, _b: Observables.IObservable<R>): Observables.IObservable<[T, R]>
export function combineLatest<T, R, S>(_a: Observables.IObservable<T>, _b: Observables.IObservable<R>, _c: Observables.IObservable<S>): Observables.IObservable<[T, R, S]>
export function combineLatest(...observables: Array<Observables.IObservable<unknown>>): Observables.IObservable<unknown[]> {
  const values = new Map<Observables.IObservable<unknown>, unknown>()

  return new Observable(function(observer) {
    for (const observable of observables) {
      observable.subscribe({
        error: observer.error,
        complete: function(value: unknown) {
          return observer.complete([value])
        },
        next: function(value: unknown) {
          values.set(observable, value)

          if (values.size === observables.length) {
            observer.next([...values.values()])
          }
        }
      })
    }
  })
}
