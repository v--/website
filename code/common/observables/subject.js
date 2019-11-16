import { Observable } from './observable.js'

export class Subject {
  constructor () {
    this.observers = []
    this.observable = new Observable(this._subscriber.bind(this))
  }

  ['@@observable'] () {
    return this
  }

  _subscriber (observer) {
    const index = this.observers.length
    this.observers.push(observer)
    return Array.prototype.splice.bind(this.observers, index, 1)
  }

  next (value) {
    this._value = value

    for (const observer of this.observers) {
      observer.next(value)
    }

    return value
  }

  error (err) {
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

  complete (value) {
    this._value = value

    for (const observer of this.observers) {
      observer.complete(value)
    }

    return value
  }

  subscribe (_potentialObserver) {
    return this.observable.subscribe.apply(this.observable, arguments)
  }
}
