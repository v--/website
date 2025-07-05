import { Observable } from '../observable.ts'

export async function collect<T>(observable: Observable<T>) {
  return new Promise(function (resolve, reject) {
    const result: T[] = []

    observable.subscribe({
      next(value) {
        result.push(value)
      },

      error(err) {
        reject(err)
      },

      complete() {
        resolve(result)
      },
    })
  })
}
