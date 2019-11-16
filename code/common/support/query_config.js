import { Path } from './path.js'
import { join, repr } from './strings.js'
import { chain, filter, map, sort } from './iteration.js'
import { CoolError } from '../errors.js'

export class QueryStringError extends CoolError {}

export class QueryConfig {
  constructor (path, defaults, parsers) {
    this.path = path
    this.defaults = defaults
    this.parsers = parsers
  }

  get (key) {
    if (this.path.query.has(key)) {
      return this.parsers[key](this.path.query.get(key))
    }

    return this.defaults[key]
  }

  getUpdatedPath (config) {
    const newQuery = new Map()

    for (const [key, value] of this.path.query.entries()) {
      newQuery.set(key, value)
    }

    for (const [key, value] of Object.entries(config)) {
      newQuery.set(key, String(value))
    }

    for (const [key, value] of Object.entries(this.defaults)) {
      if (newQuery.get(key) === String(value)) {
        newQuery.delete(key)
      }
    }

    const newPath = new Path(this.path.segments, newQuery)
    return newPath.cooked
  }
}

export class CheckList {
  static fromString (options, string) {
    if (string === '') {
      return new this()
    }

    const parsed = new Set()

    for (const str of string.split(';')) {
      const num = Number(str)

      if (!Number.isSafeInteger(num)) {
        throw new QueryStringError('Unable to parse the index ' + repr(num))
      }

      if (num < 0 || num >= options.length) {
        throw new QueryStringError('Index ' + num + ' is too large')
      }

      parsed.add(options[num])
    }

    return new this(options, parsed)
  }

  constructor (options, checked) {
    this.options = options
    this.checked = checked
  }

  has (option) {
    return this.checked.has(option)
  }

  add (option) {
    const newChecked = new Set(chain(this.checked, [option]))
    return new this.constructor(this.options, newChecked)
  }

  remove (targetOption) {
    const newChecked = new Set(filter(option => targetOption !== option, this.checked))
    return new this.constructor(this.options, newChecked)
  }

  toString () {
    return sort(Array.from(this.checked).map(option => this.options.indexOf(option))).join(';')
  }
}

export class NumericMapping {
  static fromString (string) {
    if (string === '') {
      return new this()
    }

    const parsed = []

    for (const tupleString of string.split(';')) {
      const tuple = tupleString.split(',').map(Number)

      if (tuple.length !== 2 || !Number.isFinite(tuple[0]) || !Number.isFinite(tuple[1])) {
        throw new QueryStringError('Unable to parse the tuple ' + repr(tupleString))
      }

      parsed.push(tuple)
    }

    return new this(parsed)
  }

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
    const newValues = chain(this.entries(), [[arg, val]])
    return new this.constructor(newValues)
  }

  delete (targetArg) {
    const newValues = filter(([arg, _val]) => targetArg !== arg, this.entries())
    return new this.constructor(newValues)
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

  toString () {
    return join(';', map(tuple => tuple.join(','), this._payload.entries()))
  }
}
