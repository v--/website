import { type uint32 } from '../../types/numbers.ts'
import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

export function skip<T>(n: uint32) {
  return function (observable: Observable<T>) {
    return new Observable((observer: IObserver<T>) => {
      let nSkipped = 0

      return observable.subscribe({
        ...observer,
        next(value: T) {
          if (nSkipped >= n) {
            observer.next(value)
          } else {
            nSkipped++
          }
        },
      })
    })
  }
}
