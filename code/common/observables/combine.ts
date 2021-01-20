import { Observable } from './observable.js'

export function combineLatest<T>(_a: TObservables.IObservable<T>): TObservables.IObservable<[T]> 
export function combineLatest<T, R>(_a: TObservables.IObservable<T>, _b: TObservables.IObservable<R>): TObservables.IObservable<[T, R]>
export function combineLatest<T, R, S>(_a: TObservables.IObservable<T>, _b: TObservables.IObservable<R>, _c: TObservables.IObservable<S>): TObservables.IObservable<[T, R, S]>
export function combineLatest(...observables: Array<TObservables.IObservable<unknown>>): TObservables.IObservable<unknown[]> {
  const values = new Map<TObservables.IObservable<unknown>, unknown>()

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
