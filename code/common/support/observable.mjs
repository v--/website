import { CoolError } from '../errors'

export class ObservableError extends CoolError {}

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
      throw new Observable.ErrorClass('Cleanup must be an object with an unsubscribe method, a function, null or undefined')
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
        return method(value)
      } catch (err) {
        if (this.cleanup === null) {
          throw err
        }

        this._cleanupAndThrow(err)
      }
    } else if (method !== undefined && method !== null) {
      throw new Observable.ErrorClass('The next method must be a function')
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
        result = method(err)
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

    const methodErr = new Observable.ErrorClass('The error method must be a function')
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
        const result = method(value)

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
      throw new Observable.ErrorClass('The complete method must be a function')
    }
  }

  get closed () {
    return this._closed
  }
}

SubscriptionObserver.prototype.constructor = Object

export class Subscription {
  constructor (subscriptionObserver) {
    this.subscriptionObserver = subscriptionObserver
  }

  unsubscribe () {
    this.subscriptionObserver.complete()
  }

  get closed () {
    return this.subscriptionObserver.closed
  }
}

Subscription.prototype.constructor = Object

export default class Observable {
  static isObservable (object) {
    return '@@observable' in object
  }

  static of (...items) {
    const Cls = this instanceof Function ? this : Observable

    return new Cls(function (observer) {
      for (const item of items) {
        observer.next(item)
      }

      observer.complete()
    })
  }

  static from (source) {
    const Cls = this instanceof Function ? this : Observable

    if (!(source instanceof Object)) {
      throw new Observable.ErrorClass('The source must be an object')
    }

    if (Symbol.iterator in source) {
      return new Cls(function (observer) {
        for (const item of source) {
          observer.next(item)
        }

        observer.complete()
      })
    }

    if ('@@observable' in source) {
      const result = source['@@observable']()

      if (result instanceof Object) {
        if (result.subscribe instanceof Function) {
          return new Cls(result.subscribe)
        }

        return result
      }

      throw new Observable.ErrorClass('The @@observable method must return an object')
    }

    throw new Observable.ErrorClass('The source must be either an iterable or an observable')
  }

  constructor (subscriber) {
    if (subscriber instanceof Function) {
      this.subscriber = subscriber
    } else {
      throw new Observable.ErrorClass('The subscriber must be a function')
    }

    this.observers = new Set()
  }

  ['@@observable'] () {
    return this
  }

  subscribe (potentialObserver) {
    let observer

    if (potentialObserver instanceof Function) {
      observer = {
        next: potentialObserver,
        error: arguments[1],
        complete: arguments[2]
      }
    } else if (potentialObserver instanceof Object) {
      observer = potentialObserver
    } else {
      throw new Observable.ErrorClass('The observer must either be an observer object or a function')
    }

    const subscriptionObserver = new SubscriptionObserver(observer)
    const subscription = new Subscription(subscriptionObserver)

    if (observer.start instanceof Function) {
      observer.start(subscription)
    }

    if (!subscriptionObserver.closed) {
      subscriptionObserver.subscribe(this.subscriber)
    }

    return subscription
  }
}

// Allow the error class to be modified to allow of the official observable tests to pass
Observable.ErrorClass = ObservableError
