import { Path } from './path.js'
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
