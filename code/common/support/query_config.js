import { CoolError } from '../errors.js'
import { Path } from './path.js'

export class QueryStringError extends CoolError {}

/**
 * @template {Record<string, string>} Schema
 */
export class QueryConfig {
  /**
   * @param {TRouter.IPath} path
   * @param {Partial<Schema>} defaults
   */
  constructor(path, defaults) {
    this.path = path
    this.defaults = defaults
  }

  /**
   * @param {keyof Schema & string} key
   * @returns {string | undefined}
   */
  get(key) {
    if (this.path.query.has(key)) {
      return this.path.query.get(key)
    }

    const defaultValue = this.defaults[key]

    if (typeof defaultValue === 'string') {
      return defaultValue
    }
  }

  /**
   * @param {Partial<Schema>} config
   */
  getUpdatedPath(config) {
    const newQuery = new Map()

    for (const [key, value] of this.path.query.entries()) {
      newQuery.set(key, value)
    }

    for (const [key, value] of Object.entries(config)) {
      newQuery.set(key, value)
    }

    for (const [key, value] of Object.entries(this.defaults)) {
      if (newQuery.get(key) === value) {
        newQuery.delete(key)
      }
    }

    const newPath = new Path(this.path.segments, newQuery)
    return newPath.cooked
  }
}
