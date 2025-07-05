import { type Mapper } from '../../types/typecons.ts'
import { Observable } from '../observable.ts'
import { type IObserver } from '../types.ts'

export function concatMap<T, S, V = void>(transform: Mapper<T, Promise<S>>) {
  return function (observable: Observable<T, V>) {
    return new Observable(function (observer: IObserver<S, V>) {
      let erroredOut = false
      let completed = false
      let completionValue: V = undefined as V
      let currentlyProcessing = false
      const queue: T[] = []

      function onError(err: unknown) {
        erroredOut = true
        observer.error(err)
      }

      function onComplete(value: V) {
        completed = true
        completionValue = value

        if (!currentlyProcessing) {
          observer.complete(completionValue)
        }
      }

      async function processEntireQueue() {
        if (currentlyProcessing) {
          return
        }

        currentlyProcessing = true

        while (queue.length > 0) {
          const value = queue.shift()!

          try {
            const processed = await transform(value)
            observer.next(processed)
          } catch (err) {
            onError(err)
            currentlyProcessing = false
            break
          }

          if (erroredOut) {
            return
          }
        }

        currentlyProcessing = false

        if (completed) {
          observer.complete(completionValue)
        }
      }

      return observable.subscribe({
        start: observer.start,

        next(value: T) {
          queue.push(value)

          if (!currentlyProcessing) {
            processEntireQueue().catch(onError)
          }
        },

        error: onError,
        complete: onComplete,
      })
    })
  }
}
