import { errors } from './errors'
import { SubscriptionObserver } from './subscription_observer.js'
import { Subscription } from './subscription.js'

/**
 * @template T
 * @implements TObservables.IObservable<T>
 */
export class Observable {
  /**
   * @param {unknown} object
   * @returns {boolean}
   */
  static isObservable(object) {
    return object instanceof Object && '@@observable' in object
  }

  /**
   * @template T
   * @param {T[]} items
   * @returns Observable<T>
   */
  static of(...items) {
    const Cls = this instanceof Function ? this : Observable

    return new Cls(function(observer) {
      for (const item of items) {
        observer.next(item)
      }

      observer.complete()
    })
  }

  /**
   * @template T
   * @param {Iterable<T> | TObservables.IObservable<T>} source
   * @returns Observable<T>
   */
  static from(source) {
    const Cls = this instanceof Function ? this : Observable

    if (!(source instanceof Object)) {
      throw new errors.ErrorClass('The source must be an object')
    }

    if (Symbol.iterator in source) {
      return new Cls(function(observer) {
        for (const item of /** @type {Iterable<T>} */ (source)) {
          observer.next(item)
        }

        observer.complete()
      })
    }

    if (Observable.isObservable(source)) {
      const result = (/** @type {TObservables.IObservable<T>} */ (source)) ['@@observable']()

      if (Observable.isObservable(result)) {
        return new Cls(result.subscribe)
      }

      throw new errors.ErrorClass('The @@observable method must return an observable object')
    }

    throw new errors.ErrorClass('The source must be either an iterable or an observable')
  }

  /**
   * @param {TObservables.SubscriberFunction<T>} subscriber
   */
  constructor(subscriber) {
    /** @private */
    this.subscriber = subscriber

    if (!(subscriber instanceof Function)) {
      throw new errors.ErrorClass('The subscriber must be a function')
    }
  }

  ['@@observable']() {
    return this
  }

  /**
   * @param {TObservables.IPotentialObserver<T>} potentialObserver
   */
  subscribe(potentialObserver) {
    /** @type {Partial<TObservables.IObserver<T>>} */
    let observer

    if (potentialObserver instanceof Function) {
      observer = {
        next: potentialObserver,
        // eslint-disable-next-line prefer-rest-params
        error: arguments[1],
        // eslint-disable-next-line prefer-rest-params
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
