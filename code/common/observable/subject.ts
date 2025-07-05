import { Observable } from './observable.ts'
import { type CleanupFunction, type IObserver } from './types.ts'

export class Subject<T, V = void> extends Observable<T, V> {
  #observers: Set<IObserver<T, V>>
  #closed: boolean
  #error?: unknown

  constructor() {
    super(observer => this._subjectSubscriber(observer))
    this.#observers = new Set()
    this.#closed = false
    this.#error = undefined
  }

  protected _subjectSubscriber(observer: IObserver<T, V>): CleanupFunction {
    if (this.#error) {
      observer.error(this.#error)
      return function () {}
    } else if (this.#closed) {
      observer.complete()
      return function () {}
    } else {
      this.#observers.add(observer)
      return Set.prototype.delete.bind(this.#observers, observer)
    }
  }

  next(value: T) {
    if (this.#closed) {
      return value
    }

    for (const observer of this.#observers) {
      observer.next(value)
    }

    return value
  }

  error(err: unknown) {
    if (this.#closed) {
      throw err
    }

    this.#closed = true
    this.#error = err
    let hasThrown = false

    for (const observer of this.#observers) {
      try {
        observer.error(err)
      } catch (innerErr) {
        hasThrown = true
      }
    }

    if (hasThrown) {
      throw err
    }
  }

  complete(value: V) {
    if (this.#closed) {
      return
    }

    this.#closed = true

    for (const observer of this.#observers) {
      observer.complete(value)
    }

    return value
  }
}
