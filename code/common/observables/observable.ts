import { errors } from './errors.js'
import { SubscriptionObserver } from './subscription_observer.js'
import { Subscription } from './subscription.js'

export class Observable<T> implements Observables.IObservable<T> {
  static isObservable(object: unknown): boolean {
    return object instanceof Object && '@@observable' in object
  }

  static of<T>(...items: T[]): Observable<T> {
    const Cls = this instanceof Function ? this : Observable

    return new Cls(function(observer) {
      for (const item of items) {
        observer.next(item)
      }

      observer.complete()
    })
  }

  static from<T>(source: Iterable<T> | Observable<T>): Observable<T> {
    const Cls = this instanceof Function ? this : Observable

    if (!(source instanceof Object)) {
      throw new errors.ErrorClass('The source must be an object')
    }

    if (Symbol.iterator in source) {
      return new Cls(function(observer) {
        for (const item of source as Iterable<T>) {
          observer.next(item)
        }

        observer.complete()
      })
    }

    if ('@@observable' in source) {
      const result = source['@@observable']() as Observable<T>

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

  constructor(private subscriber: Observables.SubscriberFunction<T>) {
    if (!(subscriber instanceof Function)) {
      throw new errors.ErrorClass('The subscriber must be a function')
    }
  }

  ['@@observable']() {
    return this
  }

  subscribe(potentialObserver: Observables.IPotentialObserver<T>) {
    let observer: Partial<Observables.IObserver<T>>

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
