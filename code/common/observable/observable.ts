import { errors } from './errors.ts'
import { Subscription } from './subscription.ts'
import { SubscriptionObserver } from './subscription_observer.ts'
import { type IObserver, type IPotentialObserver, type SubscriberFunction } from './types.ts'

export class Observable<T, V = void> {
  #subscriber?: SubscriberFunction<T, V>

  static isObservable<T>(value: unknown): value is Observable<T> {
    return value instanceof Object && '@@observable' in value
  }

  static of<T>(...items: T[]): Observable<T> {
    const cls = this instanceof Function ? this : Observable

    return new cls(function (observer: IObserver<T>) {
      for (const item of items) {
        observer.next(item)
      }

      observer.complete()
    })
  }

  static from<T>(source: Iterable<T> | Observable<T>): Observable<T> {
    const cls = this instanceof Function ? this : Observable

    if (!(source instanceof Object)) {
      throw new errors.ErrorClass('The source must be an object')
    }

    if (Symbol.iterator in source) {
      return new cls(function (observer: IObserver<T>) {
        for (const item of source) {
          observer.next(item)
        }

        observer.complete()
      })
    }

    if (Observable.isObservable(source)) {
      const result = source['@@observable']()

      if (result.constructor == this) {
        return result
      }

      if (result instanceof Object) {
        if (result.subscribe instanceof Function) {
          return new cls(result.subscribe)
        } else {
          return new cls()
        }
      }
    }

    throw new errors.ErrorClass('The source must be either an iterable or an observable')
  }

  constructor(subscriber?: SubscriberFunction<T, V>) {
    if (arguments.length > 0) {
      if (subscriber instanceof Function) {
        this.#subscriber = subscriber
      } else {
        throw new errors.ErrorClass('The subscriber must be a function')
      }
    }
  }

  ['@@observable']() {
    return this
  }

  subscribe(potentialObserver: IPotentialObserver<T, V>): Subscription<T, V> {
    let observer: Partial<IObserver<T, V>>

    if (potentialObserver instanceof Function) {
      observer = {
        next: potentialObserver,
        /* eslint-disable prefer-rest-params */
        error: arguments[1],
        complete: arguments[2],
        /* eslint-enable prefer-rest-params */
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

    if (this.#subscriber && !subscriptionObserver.closed) {
      subscriptionObserver.subscribe(this.#subscriber)
    }

    return subscription
  }

  pipe<A>(transformation: (observable: Observable<T, V>) => Observable<A, V>): Observable<A, V>
  pipe<A, B>(
    transformationA: (observable: Observable<T, V>) => Observable<A, V>,
    transformationB: (observable: Observable<A, V>) => Observable<B, V>
  ): Observable<B, V>
  pipe<A, B, C>(
    transformationA: (observable: Observable<T, V>) => Observable<A, V>,
    transformationB: (observable: Observable<A, V>) => Observable<B, V>,
    transformationC: (observable: Observable<B, V>) => Observable<C, V>
  ): Observable<C, V>
  pipe<A, B, C, D>(
    transformationA: (observable: Observable<T, V>) => Observable<A, V>,
    transformationB: (observable: Observable<A, V>) => Observable<B, V>,
    transformationC: (observable: Observable<B, V>) => Observable<C, V>,
    transformationD: (observable: Observable<C, V>) => Observable<D, V>
  ): Observable<D, V>
  pipe(...transformations: Array<(observable: Observable<unknown, V>) => Observable<unknown, V>>): Observable<unknown, V>
  pipe(...transformations: Array<(observable: Observable<unknown, V>) => Observable<unknown, V>>): Observable<unknown, V> {
    let result = this as Observable<unknown, V>

    for (const transformation of transformations) {
      result = transformation(result)
    }

    return result
  }
}
