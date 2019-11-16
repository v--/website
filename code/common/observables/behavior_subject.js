import { Subject } from './subject.js'

export class BehaviorSubject extends Subject {
  constructor (value) {
    super()
    this._value = value
  }

  _subscriber (observer) {
    const index = this.observers.length
    this.observers.push(observer)
    observer.next(this._value)
    return Array.prototype.splice.bind(this.observers, index, 1)
  }

  get value () {
    return this._value
  }
}
