import chai from 'chai'

import { stringifyExpression } from '../code/client/resolution/support/stringify.js'
import { isSameNumber } from '../code/common/math/numeric/floating.js'
import { repr } from '../code/common/support/strings.js'
import { CoolError } from '../code/common/errors.js'

class AssertionError extends CoolError {}

/**
 * @param {TResolution.FOLExpression} a
 * @param {TResolution.FOLExpression} b
 */
export function assertEqualExpressions(a, b) {
  chai.assert.strictEqual(stringifyExpression(a), stringifyExpression(b))
}

/**
 * @param {unknown} src
 * @param {unknown} target
 */
export function assertReprEqual(src, target) {
  const r = repr(src)

  if (r !== target) {
    throw new AssertionError(`${r} does not equal ${target}`)
  }
}

/**
 * @param {unknown} a
 * @param {unknown} b
 */
export function assertCustomEqual(a, b) {
  if (!(a instanceof Object)) {
    chai.assert.strictEqual(a, b)
  }

  if ('equals' in /** @type {object} */ (a)) {
    if (!(/** @type {{ equals: (value: unknown) => boolean }} */ (a)).equals(b)) {
      throw new AssertionError(`${repr(a)} does not equal ${repr(b)}`)
    }
  } else {
    chai.assert.deepEqual(a, b)
  }
}

/**
 * @param {number} a
 * @param {number} b
 */
export function assertSameNumber(a, b) {
  if (!isSameNumber(a, b)) {
    throw new AssertionError(`${repr(a)} is not indistinguishable from ${repr(b)}`)
  }
}

export const expect = chai.expect
export const assert = chai.assert

// eslint-disable-next-line no-undef
export const describe = (/** @type {any} */ (global)).describe
// eslint-disable-next-line no-undef
export const it = (/** @type {any} */ (global)).it
