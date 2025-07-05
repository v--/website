import { errors } from './errors.ts'
import { type Cleanup, type CleanupFunction, type IObserver, type SubscriberFunction } from './types.ts'
import { type uint32 } from '../types/numbers.ts'
import { type Action } from '../types/typecons.ts'

export class SubscriptionObserver<T, V = void> {
  #closed: boolean = false
  #cleanupFunction?: CleanupFunction = undefined
  readonly observer: Partial<IObserver<T, V>>

  static #living = new Set<SubscriptionObserver<unknown, unknown>>()

  static getLivingObserverCount(): uint32 {
    return this.#living.size
  }

  static killLivingObservers(logErrors = true) {
    for (const observer of this.#living) {
      try {
        observer.complete()
      } catch (err) {
        if (logErrors) {
          // eslint-disable-next-line no-console
          console.error('An error occurred while killing observers', err)
        }
      }
    }

    this.#living = new Set()
  }

  constructor(observer: Partial<IObserver<T, V>>) {
    this.observer = observer

    // We find it convenient to bind these methods after construction
    // Another possibility is to introduce distinct properties for bound and unbound methods,
    // But the specification requires these methods on the prototype
    this.next = this.next.bind(this)
    this.error = this.error.bind(this)
    this.complete = this.complete.bind(this)

    SubscriptionObserver.#living.add(this)
  }

  subscribe(subscriber: SubscriberFunction<T, V>) {
    let cleanup: Cleanup | void

    try {
      cleanup = subscriber(this)
    } catch (err) {
      this.error(err)
    }

    if (cleanup instanceof Object && 'unsubscribe' in cleanup && cleanup.unsubscribe instanceof Function) {
      this.#cleanupFunction = cleanup.unsubscribe
    } else if (cleanup === undefined || cleanup === null) {
      this.#cleanupFunction = undefined
    } else if (cleanup instanceof Function) {
      this.#cleanupFunction = cleanup
    } else {
      throw new errors.ErrorClass('Cleanup must be a subscription, a function, null or undefined')
    }

    if (this.#closed && this.#cleanupFunction) {
      this.#cleanupFunction()
    }
  }

  #cleanupAndThrow(err: unknown) {
    if (this.#cleanupFunction) {
      try {
        this.#cleanupFunction()
      } catch (cleanupErr) {
        throw err
      }
    }

    throw err
  }

  next(value: T): void {
    if (this.#closed) {
      return
    }

    const method: Action<T> | undefined = this.observer.next

    if (method instanceof Function) {
      try {
        return method.call(this.observer, value)
      } catch (err) {
        if (this.#cleanupFunction === undefined) {
          throw err
        }

        this.#cleanupAndThrow(err)
      }
    } else if (method !== undefined && method !== null) {
      throw new errors.ErrorClass('The next method must be a function')
    }
  }

  error(err: unknown): void {
    if (this.#closed) {
      throw err
    }

    this.#closed = true
    SubscriptionObserver.#living.delete(this)

    let method: Action<unknown> | undefined

    try {
      method = this.observer.error
    } catch (lookupErr) {
      this.#cleanupAndThrow(lookupErr)
    }

    if (method instanceof Function) {
      let result: void = undefined

      try {
        result = method.call(this.observer, err)
      } catch (innerErr) {
        this.#cleanupAndThrow(innerErr)
      }

      if (this.#cleanupFunction) {
        this.#cleanupFunction()
      }

      return result
    }

    if (method === undefined || method === null) {
      this.#cleanupAndThrow(err)
    }

    const methodErr = new errors.ErrorClass('The error method must be a function')
    this.#cleanupAndThrow(methodErr)
  }

  complete(value?: V): void {
    if (this.#closed) {
      return
    }

    this.#closed = true
    SubscriptionObserver.#living.delete(this)

    let method: Action<V | undefined> | undefined

    try {
      method = this.observer.complete
    } catch (lookupErr) {
      this.#cleanupAndThrow(lookupErr)
    }

    if (method instanceof Function) {
      try {
        const result = method.call(this.observer, value)

        if (this.#cleanupFunction) {
          this.#cleanupFunction()
        }

        return result
      } catch (err) {
        if (this.#cleanupFunction === null) {
          throw err
        }

        this.#cleanupAndThrow(err)
      }
    }

    if (this.#cleanupFunction) {
      this.#cleanupFunction()
    }

    if (method !== undefined && method !== null) {
      throw new errors.ErrorClass('The complete method must be a function')
    }
  }

  get closed() {
    return this.#closed
  }
}

// This is required by the spec
SubscriptionObserver.prototype.constructor = Object
