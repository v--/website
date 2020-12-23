import { EmptyIterError, map, reduce } from './iteration.js'
import { roundNumber } from '../math/numeric/floating.js'

export function join(delimiter: string, iterable: Iterable<string>): string {
  try {
    return reduce<string>((value, accum) => accum === '' ? value : `${accum}${delimiter}${value}`, iterable, '')
  } catch (e) {
    if (e instanceof EmptyIterError) {
      return ''
    }

    throw e
  }
}

function * iterKeyValuePairs(object: object): Generator<string> {
  for (const [key, value] of Object.entries(object)) {
    yield `${key}: ${repr(value)}`
  }
}

function serializeObject(object: object): string {
  const guts = join(', ', iterKeyValuePairs(object))

  if (guts) {
    return '{ ' + guts + ' }'
  }

  return '{}'
}

export function repr(value: unknown): string {
  if (typeof value === 'number') {
    return String(roundNumber(value))
  }

  if (typeof value === 'string') {
    return `'${value}'`
  }

  if (value instanceof Function) {
    return value.name || 'anonymous'
  }

  if (value instanceof Array) {
    return '[' + join(', ', map(repr, value)) + ']'
  }

  if (value instanceof Object && (!('toString' in value) || value.toString === Object.prototype.toString)) {
    const object = serializeObject(value)

    if (value.constructor === Object) {
      return object
    }

    return `${repr(value.constructor)} ${object}`
  }

  return String(value)
}
