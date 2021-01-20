import { Observable } from './observable.js'

/**
 * @template T
 * @implements Observables.IObservable<T>, Observables.IObserver<T>
 */
export class Subject {
  constructor() {
    /** @type {Observables.IObserver<T>[]} */
    this.observers = []

    /** @type {Observables.IObservable<T>} */
    this.observable = new Observable(this._subscriber.bind(this))
  }

  ['@@observable']() {
    return this
  }

  /**
   * @param {Observables.IObserver<T>} observer
   */
  _subscriber(observer) {
    const index = this.observers.length
    this.observers.push(observer)

    return () => {
      this.observers.splice(index, 1)
    }
  }

  /**
   * @param {T} value
   */
  next(value) {
    for (const observer of this.observers) {
      observer.next(value)
    }

    return value
  }

  /**
   * @param {Error} err
   */
  error(err) {
    let hasThrown = false

    for (const observer of this.observers) {
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

  /**
   * @param {T} [value]
   */
  complete(value) {
    for (const observer of this.observers) {
      observer.complete(value)
    }

    return value
  }

  /**
   * @param {Observables.IPotentialObserver<T>} potentialObserver
   */
  subscribe(potentialObserver) {
    // eslint-disable-next-line prefer-rest-params
    return this.observable.subscribe(potentialObserver)
  }
}
