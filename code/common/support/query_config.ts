import { Path } from './path.js'
import { CoolError } from '../errors.js'

export class QueryStringError extends CoolError {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class QueryConfig<Schema extends Record<string, any>> {
  constructor(
    public path: Path,
    public defaults: Partial<Schema>,
    public parsers: Record<keyof Schema, (raw: string) => unknown>,
  ) {}

  get(key: string) {
    if (this.path.query.has(key)) {
      return this.parsers[key](this.path.query.get(key)!)
    }

    return this.defaults[key]
  }

  getUpdatedPath(config: Partial<Schema>) {
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
