import { errors } from './errors.js'

export class SubscriptionObserver {
  constructor (observer) {
    this.observer = observer
    this.cleanup = null
    this._closed = false
  }

  subscribe (subscriber) {
    let cleanup

    try {
      cleanup = subscriber(this)
    } catch (err) {
      this.error(err)
    }

    if (cleanup instanceof Object && cleanup.unsubscribe instanceof Function) {
      this.cleanup = cleanup.unsubscribe
    } else if (cleanup === undefined || cleanup === null) {
      this.cleanup = null
    } else if (cleanup instanceof Function) {
      this.cleanup = cleanup
    } else {
      throw new errors.ErrorClass('Cleanup must be an object with an unsubscribe method, a function, null or undefined')
    }

    if (this.closed && this.cleanup !== null) {
      this.cleanup()
    }
  }

  _cleanupAndThrow (err) {
    if (this.cleanup !== null) {
      try {
        this.cleanup()
      } catch (cleanupErr) {
        throw err
      }
    }

    throw err
  }

  next (value) {
    if (this._closed) {
      return
    }

    const method = this.observer.next

    if (method instanceof Function) {
      try {
        return method.call(this.observer, value)
      } catch (err) {
        if (this.cleanup === null) {
          throw err
        }

        this._cleanupAndThrow(err)
      }
    } else if (method !== undefined && method !== null) {
      throw new errors.ErrorClass('The next method must be a function')
    }
  }

  error (err) {
    if (this._closed) {
      throw err
    }

    this._closed = true
    let method

    try {
      method = this.observer.error
    } catch (lookupErr) {
      this._cleanupAndThrow(lookupErr)
    }

    if (method instanceof Function) {
      let result

      try {
        result = method.call(this.observer, err)
      } catch (innerErr) {
        this._cleanupAndThrow(innerErr)
      }

      if (this.cleanup !== null) {
        this.cleanup()
      }

      return result
    }

    if (method === undefined || method === null) {
      this._cleanupAndThrow(err)
    }

    const methodErr = new errors.ErrorClass('The error method must be a function')
    this._cleanupAndThrow(methodErr)
  }

  complete (value) {
    if (this._closed) {
      return
    }

    this._closed = true
    let method

    try {
      method = this.observer.complete
    } catch (lookupErr) {
      this._cleanupAndThrow(lookupErr)
    }

    if (method instanceof Function) {
      try {
        const result = method.call(this.observer, value)

        if (this.cleanup !== null) {
          this.cleanup()
        }

        return result
      } catch (err) {
        if (this.cleanup === null) {
          throw err
        }

        this._cleanupAndThrow(err)
      }
    }

    if (this.cleanup !== null) {
      this.cleanup()
    }

    if (method !== undefined && method !== null) {
      throw new errors.ErrorClass('The complete method must be a function')
    }
  }

  get closed () {
    return this._closed
  }
}

// This is required by the spec
SubscriptionObserver.prototype.constructor = Object
