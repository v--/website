import { filter, map } from './iteration.js'
import { join } from './strings.js'

/**
 * @param {Array<string | boolean | null | undefined>} classes
 * @returns {string}
 */
export function classlist(...classes) {
  return join(
    ' ',
    /** @type {Iterable<string>} */ (
      filter(Boolean, classes)
    )
  )
}

/**
 * @param {Record<string, string>} object
 */
export function styles(object) {
  return join('; ', map(([key, value]) => `${key}: ${value}`, Object.entries(object)))
}
