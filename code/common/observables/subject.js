import { Observable } from './observable.js'

/**
 * @template T
 * @implements TObservables.ISubject<T>
 */
export class Subject {
  constructor() {
    /** @type {TObservables.IObserver<T>[]} */
    this.observers = []

    /** @type {TObservables.IObservable<T>} */
    this.observable = new Observable(this._subscriber.bind(this))
  }

  ['@@observable']() {
    return this
  }

  /**
   * @param {TObservables.IObserver<T>} observer
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
   * @param {TObservables.IPotentialObserver<T>} potentialObserver
   */
  subscribe(potentialObserver) {
    // eslint-disable-next-line prefer-rest-params
    return this.observable.subscribe(potentialObserver)
  }
}
