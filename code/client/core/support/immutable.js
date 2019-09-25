import { chain, filter } from '../../../common/support/iteration.js'

export class ImmutableMap {
  constructor (values) {
    this.payload = new Map(values)
    this.size = this.payload.size
  }

  has (key) {
    return this.payload.has(key)
  }

  get (key) {
    return this.payload.get(key)
  }

  set (key, value) {
    return new this.constructor(chain(this.payload.entries(), [[key, value]]))
  }

  delete (key) {
    return new this.constructor(filter(([k, _]) => k !== key, this.payload.entries()))
  }
}

export class ImmutableSet {
  constructor (values) {
    this.payload = new Set(values)
    this.size = this.payload.size
  }

  has (value) {
    return this.payload.has(value)
  }

  add (value) {
    return new this.constructor(chain(this.payload.values(), [value]))
  }

  delete (value) {
    return new this.constructor(filter(v => v !== value, this.payload.entries()))
  }
}
