import { type Reducer } from '../../types/typecons.ts'
import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

export function scan<T, S = T>(reducer: Reducer<T, S>, initial: S) {
  return function (observable: Observable<T>): Observable<S> {
    return new Observable((observer: IObserver<S>) => {
      let accum = initial

      return observable.subscribe({
        ...observer,
        next(value: T) {
          accum = reducer(accum, value)
          observer.next(accum)
        },
      })
    })
  }
}
