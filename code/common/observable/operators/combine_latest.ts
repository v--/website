import { getObjectEntries, schwartzSort } from '../../support/iteration.ts'
import { type uint32 } from '../../types/numbers.ts'
import { Observable } from '../observable.ts'

/**
 * One of the intentional differences with RxJS. This method is easier to describe via an example than by a long-winded explanation.
 *
 * If a$ and b$ are observables, then
 *   combineLatest({ a: a$, b: b$ })
 * emits objects of the form { a, b } whenever either a$ or b$ emit.
 *
 * All observables must emit at least once before we can construct an object to emit.
 *
 * We also allow static values. The following emits just once, immediately.
 *   combineLatest({ a: 0, b: 1 })
 *
 * This is a place where we divert from RxJS on purpose. We allow a object like
 *   { a: 1, b: Observable.of(2) }
 * whereas RxJS requires all values to be "streams" - observables, promises, iterables or ReadableStream instance.
 *
 * Correspondingly, combineLatest({ a: [1] }) emits { a: [1] } in our implementation and { a: 1 } in RxJS'.
 *
 * This function is the backbone of our component API, so we prefer it as it is implemented.
 */
export function combineLatest<T extends object>(object: T): Observable<FlattenObservableRecord<T>> {
  const values = new Map<keyof T, unknown>()
  const haveCompleted = new Set<Observable<unknown>>()

  const totalValueCount = Object.keys(object).length
  let staticValueCount = 0

  for (const [key, value] of getObjectEntries(object)) {
    if (!Observable.isObservable(value)) {
      staticValueCount += 1
      values.set(key, value)
    }
  }

  if (values.size === totalValueCount) {
    return Observable.of(getObjectEntries(values) as FlattenObservableRecord<T>)
  }

  return new Observable(function (observer) {
    const subscriptions = getObjectEntries(object).map(function ([key, observable]) {
      if (!Observable.isObservable(observable)) {
        return
      }

      return observable.subscribe({
        next(value) {
          values.set(key, value)

          if (values.size === totalValueCount) {
            if (object instanceof Array) {
              const combined = schwartzSort(([k, _v]) => k as uint32, values.entries())
                .map(([_k, v]) => v)

              observer.next(combined as FlattenObservableRecord<T>)
            } else {
              const combined = Object.fromEntries(values)
              observer.next(combined as FlattenObservableRecord<T>)
            }
          }
        },

        error(err) {
          return observer.error(err)
        },

        complete() {
          haveCompleted.add(observable)

          if (haveCompleted.size + staticValueCount === totalValueCount) {
            observer.complete()
          }
        },
      })
    })

    return function unsubscribe() {
      for (const subscription of subscriptions) {
        if (subscription) {
          subscription.unsubscribe()
        }
      }
    }
  })
}

export type FlattenObservableRecord<T extends object> =
  { [K in keyof T]: T[K] extends Observable<infer S> ? S : T[K] }
