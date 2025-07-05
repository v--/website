import { type Predicate } from '../../types/typecons.ts'
import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

export function filter<T>(predicate: Predicate<T>) {
  return function (observable: Observable<T>) {
    return new Observable((observer: IObserver<T>) => {
      return observable.subscribe({
        ...observer,
        next(value: T) {
          if (predicate(value)) {
            observer.next(value)
          }
        },
      })
    })
  }
}
