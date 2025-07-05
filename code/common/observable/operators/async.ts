import { waitForNextMicrotask, waitForNextTask } from '../../support/async.ts'
import { Observable } from '../observable.ts'

export function delayByMicrotask<T>(observable: Observable<T>) {
  return new Observable(observer => {
    return observable.subscribe({
      next(value: T) {
        waitForNextMicrotask().then(
          observer.next.bind(observer, value),
          observer.error.bind(observer),
        )
      },

      error(err: unknown) {
        observer.error(err)
      },

      complete() {
        observer.complete()
      },
    })
  })
}

export function delayByTask<T>(observable: Observable<T>) {
  return new Observable(observer => {
    return observable.subscribe({
      next(value: T) {
        waitForNextTask().then(
          observer.next.bind(observer, value),
          observer.error.bind(observer),
        )
      },

      error(err: unknown) {
        observer.error(err)
      },

      complete() {
        observer.complete()
      },
    })
  })
}
