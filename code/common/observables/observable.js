import { errors } from './errors.js'
import { SubscriptionObserver } from './subscription_observer.js'
import { Subscription } from './subscription.js'

export class Observable {
  static isObservable (object) {
    return object instanceof Object && '@@observable' in object
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
      throw new errors.ErrorClass('The source must be an object')
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

      throw new errors.ErrorClass('The @@observable method must return an object')
    }

    throw new errors.ErrorClass('The source must be either an iterable or an observable')
  }

  constructor (subscriber) {
    if (subscriber instanceof Function) {
      this.subscriber = subscriber
    } else {
      throw new errors.ErrorClass('The subscriber must be a function')
    }
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
      throw new errors.ErrorClass('The observer must either be an observer object or a function')
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
