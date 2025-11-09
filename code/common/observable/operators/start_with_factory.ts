import { type Getter } from '../../types/typecons.ts'
import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

/**
 * This is another deviation from RxJS, where no such operator exists.
 */
export function startWithFactory<T>(factory: Getter<T>) {
  return function (observable: Observable<T>) {
    return new Observable((observer: IObserver<T>) => {
      observer.next(factory())
      return observable.subscribe(observer)
    })
  }
}
