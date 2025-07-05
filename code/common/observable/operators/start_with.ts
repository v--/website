import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

export function startWith<T>(...values: T[]) {
  return function (observable: Observable<T>) {
    return new Observable((observer: IObserver<T>) => {
      for (const value of values) {
        observer.next(value)
      }

      return observable.subscribe(observer)
    })
  }
}
