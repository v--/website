import { errors } from './errors.js'

/**
 * @template T
 * @implements Observables.ISubscriptionObserver<T>
 */
export class SubscriptionObserver {
  /**
   * @param {Partial<Observables.IObserver<T>>} observer
   */
  constructor(observer) {
    this.observer = observer
    this._closed = false

    /** @type {TypeCons.Optional<Observables.CleanupFunction>} */
    this.cleanupFunction = undefined
  }

  /**
   * @param {Observables.SubscriberFunction<T>} subscriber
   */
  subscribe(subscriber) {
    /** @type {Observables.Cleanup} */
    let cleanup

    try {
      cleanup = /** @type {Observables.Cleanup} */ (subscriber(this))
    } catch (err) {
      this.error(err)
    }

    if (cleanup instanceof Object && (/** @type {Observables.ISubscription} */ (cleanup)).unsubscribe instanceof Function) {
      this.cleanupFunction = (/** @type {Observables.ISubscription} */ (cleanup)).unsubscribe
    } else if (cleanup === undefined || cleanup === null) {
      this.cleanupFunction = undefined
    } else if (cleanup instanceof Function) {
      this.cleanupFunction = cleanup
    } else {
      throw new errors.ErrorClass('Observables.Cleanup must be a subscription, a function, null or undefined')
    }

    if (this.closed && this.cleanupFunction) {
      this.cleanupFunction()
    }
  }

  /**
   * @param {Error} err
   */
  _cleanupAndThrow(err) {
    if (this.cleanupFunction) {
      try {
        this.cleanupFunction()
      } catch (cleanupErr) {
        throw err
      }
    }

    throw err
  }

  /**
   * @param {T} value
   */
  next(value) {
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

  /**
   * @param {Error} err
   */
  error(err) {
    if (this._closed) {
      throw err
    }

    this._closed = true

    /** @type {Function | null | undefined} */
    let method

    try {
      method = this.observer.error
    } catch (lookupErr) {
      this._cleanupAndThrow(lookupErr)
    }

    if (method instanceof Function) {
      /** @type {unknown} */
      let result

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

  /**
   * @param {T} [value]
   */
  complete(value) {
    if (this._closed) {
      return
    }

    this._closed = true

    /** @type {Function | null | undefined} */
    let method

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
