import { Observable } from '../observable.ts'

export function collect<T>(observable$: Observable<T>) {
  return new Promise((resolve, reject) => {
    const values: T[] = []

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
  })
}
