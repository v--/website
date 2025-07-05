import { Observable } from '../observable.ts'
import { type Subscription } from '../subscription.ts'
import { fromFactory } from './from_factory.ts'

export function switchMap<T, R>(factory: (value: T) => Promise<R> | Observable<R>) {
  return function (observable: Observable<T>) {
    return new Observable<R>(function subscriber(observer) {
      let nestedSubscription: Subscription<R> | undefined = undefined
      const nestedObserver = {
        next(value: R) {
          observer.next(value)
        },

        error(err: unknown) {
          observer.error(err)
        },
      }

      const subscription = observable.subscribe({
        ...observer,
        next(value: T) {
          nestedSubscription?.unsubscribe()
          nestedSubscription = fromFactory(() => factory(value)).subscribe(nestedObserver)
        },
      })

      return function unsubscribe() {
        nestedSubscription?.unsubscribe()
        subscription.unsubscribe()
      }
    })
  }
}
