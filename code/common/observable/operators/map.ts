import { type Mapper } from '../../types/typecons.ts'
import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

export function map<T, S>(transform: Mapper<T, S>) {
  return function (observable: Observable<T>) {
    return new Observable((observer: IObserver<S>) => {
      return observable.subscribe({
        ...observer,
        next(value: T) {
          observer.next(transform(value))
        },
      })
    })
  }
}
