import Observable from './observable.js'

export default class BehaviorSubject {
  constructor (value) {
    this._value = value
    this.observers = []
    this.observable = new Observable(function (observer) {
      const index = this.observers.length
      this.observers.push(observer)
      observer.next(this._value)
      return Array.prototype.splice.bind(this.observers, index, 1)
    }.bind(this))
  }

  ['@@observable'] () {
    return this
  }

  get value () {
    return this._value
  }

  next (value) {
    this._value = value

    for (const observer of this.observers) {
      observer.next(value)
    }

    return value
  }

  subscribe (potentialObserver) {
    return this.observable.subscribe.apply(this.observable, arguments)
  }
}
