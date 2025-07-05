import { type uint32 } from '../../types/numbers.ts'
import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

export function take<T>(capacity: uint32) {
  return function (observable: Observable<T>) {
    return new Observable((observer: IObserver<T>) => {
      let counter = 0

      const subscription = observable.subscribe({
        ...observer,
        next(value: T) {
          observer.next(value)
          counter++

          if (counter >= capacity) {
            observer.complete()
          }
        },
      })

      return subscription
    })
  }
}
