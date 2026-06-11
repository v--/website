import { type Getter } from '../../types/typecons.ts'
import { Observable } from '../observable.ts'

/**
 * Upon subscribing, retrieve the promise or observable from the factory and subscribe to it.
 *
 * This is another deviation of RxJS, where there is a `from` operator acting slightly differently.
 */
export function fromFactory<T>(factory: Getter<Promise<T> | Observable<T>>): Observable<T> {
  return new Observable<T>(function subscriber(observer) {
    const source = factory()

    if (Observable.isObservable(source)) {
      return source.subscribe({
        start: observer.start,
        next: observer.next,
        error: observer.error,
      })
    }

    source.then(
      observer.next,
      observer.error,
    )
  })
}
