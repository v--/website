import { errors } from './errors.js'
import { IObserver } from './observer.js'
import { Subscription } from './subscription.js'

export type CleanupFunction = (() => void)
export type Cleanup<T> = Subscription<T> | CleanupFunction | null | undefined

export interface SubscriberFunction<T> {
  (observer: SubscriptionObserver<T>): Cleanup<T> | Subscription<T> | void;
}

export class SubscriptionObserver<T> implements IObserver<T> {
  cleanupFunction?: CleanupFunction
  private _closed: boolean

  constructor(
    private observer: Partial<IObserver<T>>
  ) {
    this._closed = false
  }

  subscribe(subscriber: SubscriberFunction<T>) {
    let cleanup: Cleanup<T>

    try {
      cleanup = subscriber(this) as Cleanup<T>
    } catch (err) {
      this.error(err)
    }

    if (cleanup instanceof Object && (cleanup as Subscription<T>).unsubscribe instanceof Function) {
      this.cleanupFunction = (cleanup as Subscription<T>).unsubscribe
    } else if (cleanup === undefined || cleanup === null) {
      this.cleanupFunction = undefined
    } else if (cleanup instanceof Function) {
      this.cleanupFunction = cleanup
    } else {
      throw new errors.ErrorClass('Cleanup must be a subscription, a function, null or undefined')
    }

    if (this.closed && this.cleanupFunction) {
      this.cleanupFunction()
    }
  }

  _cleanupAndThrow(err: Error) {
    if (this.cleanupFunction) {
      try {
        this.cleanupFunction()
      } catch (cleanupErr) {
        throw err
      }
    }

    throw err
  }

  next(value: T) {
    if (this._closed) {
      return
    }

    const method = this.observer.next

    if (method instanceof Function) {
      try {
        return method.call(this.observer, value)
      } catch (err) {
        if (this.cleanupFunction === undefined) {
          throw err
        }

        this._cleanupAndThrow(err)
      }
    } else if (method !== undefined && method !== null) {
      throw new errors.ErrorClass('The next method must be a function')
    }
  }

  error(err: Error) {
    if (this._closed) {
      throw err
    }

    this._closed = true
    let method: Function | null | undefined

    try {
      method = this.observer.error
    } catch (lookupErr) {
      this._cleanupAndThrow(lookupErr)
    }

    if (method instanceof Function) {
      let result: unknown

      try {
        result = method.call(this.observer, err)
      } catch (innerErr) {
        this._cleanupAndThrow(innerErr)
      }

      if (this.cleanupFunction) {
        this.cleanupFunction()
      }

      return result
    }

    if (method === undefined || method === null) {
      this._cleanupAndThrow(err)
    }

    const methodErr = new errors.ErrorClass('The error method must be a function')
    this._cleanupAndThrow(methodErr)
  }

  complete(value?: T) {
    if (this._closed) {
      return
    }

    this._closed = true
    let method: Function | null | undefined

    try {
      method = this.observer.complete
    } catch (lookupErr) {
      this._cleanupAndThrow(lookupErr)
    }

    if (method instanceof Function) {
      try {
        const result = method.call(this.observer, value)

        if (this.cleanupFunction) {
          this.cleanupFunction()
        }

        return result
      } catch (err) {
        if (this.cleanupFunction === null) {
          throw err
        }

        this._cleanupAndThrow(err)
      }
    }

    if (this.cleanupFunction) {
      this.cleanupFunction()
    }

    if (method !== undefined && method !== null) {
      throw new errors.ErrorClass('The complete method must be a function')
    }
  }

  get closed() {
    return this._closed
  }
}

// This is required by the spec
SubscriptionObserver.prototype.constructor = Object
