import { EmptyIterError, map, reduce } from './iteration.js'
import { roundNumber } from '../math/numeric/floating.js'

/**
 * @param {string} delimiter
 * @param {Iterable<string>} iterable
 * @returns {string}
 */
export function join(delimiter, iterable) {
  try {
    return reduce((value, accum) => accum === '' ? value : `${accum}${delimiter}${value}`, iterable, '')
  } catch (e) {
    if (e instanceof EmptyIterError) {
      return ''
    }

    throw e
  }
}

/**
 * @param {object} object
 * @returns {Generator<string>}
 */
function * iterKeyValuePairs(object) {
  for (const [key, value] of Object.entries(object)) {
    yield `${key}: ${repr(value)}`
  }
}

/**
 * @param {object} object
 * @returns {string}
 */
function serializeObject(object) {
  const guts = join(', ', iterKeyValuePairs(object))

  if (guts) {
    return '{ ' + guts + ' }'
  }

  return '{}'
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function repr(value) {
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
