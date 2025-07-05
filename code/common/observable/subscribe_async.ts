import { type Observable } from './observable.ts'
import { concatMap } from './operators/concat_map.ts'
import { type Subscription } from './subscription.ts'
import { type IPotentialAsyncObserver } from './types.ts'

export function subscribeAsync<T, V = void>(
  observable: Observable<T, V>,
  potentialObserver: IPotentialAsyncObserver<T, V>,
): Subscription<T, V> {
  const observer = potentialObserver instanceof Function ? { next: potentialObserver } : potentialObserver
  const originalNext = potentialObserver instanceof Function ? potentialObserver : potentialObserver.next

  return observable.pipe(
    concatMap(async function (value: T) {
      if (originalNext) {
        await originalNext(value)
      }

      return value
    }),
  ).subscribe({
    start: observer.start,

    error(err: unknown) {
      if (observer.error === undefined) {
        return
      }

      const result = observer.error(err)

      if (result instanceof Promise) {
        result.catch(function (nestedErr) {
          // eslint-disable-next-line no-console
          console.error('An error occurred while handling an async subscription error', nestedErr)
        })
      }
    },

    complete(value?: V) {
      if (observer.complete === undefined) {
        return
      }

      const result = observer.complete(value)

      if (result instanceof Promise) {
        result.catch(function (err) {
          return observer.error?.(err)
        }).catch(function (nestedErr) {
          // eslint-disable-next-line no-console
          console.error('An error occurred while handling async subscription completion', nestedErr)
        })
      }
    },
  })
}
