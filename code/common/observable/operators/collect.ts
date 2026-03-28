import { Observable } from '../observable.ts'

export function collect<T>(observable$: Observable<T>) {
  const values: T[] = []
  const { promise, resolve, reject } = Promise.withResolvers<T[]>()

  observable$.subscribe({
    next(value: T) {
      values.push(value)
    },
    error(err: unknown) {
      reject(err)
    },
    complete() {
      resolve(values)
    },
  })

  return promise
}
