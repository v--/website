import { Observable } from './observable.js'

export class Subject<T> implements Observables.IObservable<T>, Observables.IObserver<T> {
  observers: Observables.IObserver<T>[]
  observable: Observables.IObservable<T>

  constructor() {
    this.observers = []
    this.observable = new Observable(this._subscriber.bind(this))
  }

  ['@@observable']() {
    return this
  }

  _subscriber(observer: Observables.IObserver<T>) {
    const index = this.observers.length
    this.observers.push(observer)

    return () => {
      this.observers.splice(index, 1)
    }
  }

  next(value: T): T {
    for (const observer of this.observers) {
      observer.next(value)
    }

    return value
  }

  error(err: Error) {
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

  complete(value?: T) {
    for (const observer of this.observers) {
      observer.complete(value)
    }

    return value
  }

  subscribe(potentialObserver: Observables.IPotentialObserver<T>) {
    // eslint-disable-next-line prefer-rest-params
    return this.observable.subscribe(potentialObserver)
  }
}
