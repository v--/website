import { IObservable, Observable } from './observable.js'
import { IObserver, PotentialObserver } from './observer.js'

export class Subject<T> implements IObservable<T>, IObserver<T> {
  observers: IObserver<T>[]
  observable: Observable<T>

  constructor() {
    this.observers = []
    this.observable = new Observable(this._subscriber.bind(this))
  }

  ['@@observable']() {
    return this
  }

  _subscriber(observer: IObserver<T>) {
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

  subscribe(potentialObserver: PotentialObserver<T>) {
    // eslint-disable-next-line prefer-rest-params
    return this.observable.subscribe(potentialObserver)
  }
}
