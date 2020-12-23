import { IObservable, Observable } from './observable.js'

export function combineLatest<T>(_a: IObservable<T>): IObservable<[T]> 
export function combineLatest<T, R>(_a: IObservable<T>, _b: IObservable<R>): IObservable<[T, R]>
export function combineLatest<T, R, S>(_a: IObservable<T>, _b: IObservable<R>, _c: IObservable<S>): IObservable<[T, R, S]>
export function combineLatest(...observables: Array<IObservable<unknown>>): IObservable<unknown[]> {
  const values = new Map<IObservable<unknown>, unknown>()

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
