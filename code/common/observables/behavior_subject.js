import { Subject } from './subject.js'

/**
 * @template T
 * @extends Subject<T>
 */
export class BehaviorSubject extends Subject {
  /**
   * @param {T} value
   */
  constructor(value) {
    super()
    this._value = value
  }

  /**
   * @param {Observables.IObserver<T>} observer
   */
  _subscriber(observer) {
    const index = this.observers.length
    this.observers.push(observer)
    observer.next(this._value)
    return Array.prototype.splice.bind(this.observers, index, 1)
  }

  /**
   * @param {T} value
   */
  next(value) {
    this._value = value
    return super.next(value)
  }

  get value() {
    return this._value
  }
}
