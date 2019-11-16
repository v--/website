import { sort } from '../../../common/support/iteration.js'

export class NumericMapping {
  constructor (values) {
    this._payload = new Map(values)
  }

  get (arg) {
    if (this._payload.has(arg)) {
      return this._payload.get(arg)
    }

    return null
  }

  set (arg, val) {
    this._payload.set(arg, val)
  }

  delete (targetArg) {
    this._payload.delete(targetArg)
  }

  clone () {
    return new this.constructor(this.entries())
  }

  entries () {
    return this._payload.entries()
  }

  get n () {
    return this._payload.size
  }

  get domain () {
    return sort(this._payload.keys())
  }

  get range () {
    return this.domain.map(x => this.get(x))
  }
}
