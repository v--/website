import { Observable } from '../observable.ts'
import { subscribeAsync } from '../subscribe_async.ts'
import { type IObserver } from '../types.ts'
import { first } from './first.ts'

export function withLatestFrom<T, R>(secondary: Observable<R>) {
  return function (observable: Observable<T>): Observable<[T, R]> {
    return new Observable((observer: IObserver<[T, R]>) => {
      return subscribeAsync(observable, {
        ...observer,
        async next(value: T) {
          const aux = await first(secondary)
          return observer.next([value, aux])
        },
      })
    })
  }
}
