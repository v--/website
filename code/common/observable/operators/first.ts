import { waitForNextMicrotask } from '../../support/async.ts'
import { type Observable } from '../observable.ts'

export function first<T>(observable: Observable<T>): Promise<T> {
  return new Promise(function (resolve, reject) {
    const subscription = observable.subscribe({
      next(value: T) {
        waitForNextMicrotask().then(() => subscription.unsubscribe()).catch(reject)
        resolve(value)
      },

      error(err: unknown) {
        waitForNextMicrotask().then(() => subscription.unsubscribe()).catch(reject)
        reject(err)
      },
    })

    return subscription
  })
}
