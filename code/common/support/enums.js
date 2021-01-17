import { enumerate } from './iteration.js'

/**
 * @param {string[]} options
 */
export function createEnum(...options) {
  /** @type {Record<string, number> & Record<number, string>} */
  const result = {}

  for (const [i, option] of enumerate(options)) {
    result[option] = i
    result[i] = option
  }

  return result
}
