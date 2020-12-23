import { IObserver } from './observer.js'
import { Subject } from './subject.js'

export class BehaviorSubject<T> extends Subject<T> {
  _value: T

  constructor(value: T) {
    super()
    this._value = value
  }

  _subscriber(observer: IObserver<T>) {
    const index = this.observers.length
    this.observers.push(observer)
    observer.next(this._value)
    return Array.prototype.splice.bind(this.observers, index, 1)
  }

  next(value: T) {
    this._value = value
    return super.next(value)
  }

  get value() {
    return this._value
  }
}
