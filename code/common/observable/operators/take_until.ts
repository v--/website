import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

export function takeUntil<T>(reference: Observable<unknown>) {
  return function (observable: Observable<T>): Observable<T> {
    return new Observable((observer: IObserver<T>) => {
      const subscription = observable.subscribe(observer)
      const refSubscription = reference.subscribe({
        next(_value: void) {
          observer.complete()
        },
      })

      return function unsubscribe() {
        subscription.unsubscribe()
        refSubscription.unsubscribe()
      }
    })
  }
}
