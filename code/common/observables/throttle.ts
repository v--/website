import { IObservable, Observable } from './observable.js'

export function throttleObservable<T>(observable: IObservable<T>, time: number): Observable<T> {
  let lastEvent = Date.now()

  return new Observable(function(observer) {
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
