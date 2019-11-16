import chai from 'chai'
import { stringifyExpression } from '../code/client/resolution/support/stringify.js'
import { isSameNumber } from '../code/common/math/numeric/floating.js'
import { repr } from '../code/common/support/strings.js'
import { CoolError } from '../code/common/errors.js'

class AssertionError extends CoolError {}

Object.defineProperty(chai.assert, 'equalExpressions', {
  value (a, b) {
    chai.assert.strictEqual(stringifyExpression(a), stringifyExpression(b))
  }
})

Object.defineProperty(chai.assert, 'reprEqual', {
  value (src, target) {
    const r = repr(src)

    if (r !== target) {
      throw new AssertionError(`${r} does not equal ${target}`)
    }
  }
})

Object.defineProperty(chai.assert, 'customEqual', {
  value (a, b) {
    if (!(a instanceof Object)) {
      chai.assert.strictEqual(a, b)
    }

    if ('equals' in a) {
      if (!a.equals(b)) {
        throw new AssertionError(`${repr(a)} does not equal ${repr(b)}`)
      }
    } else {
      chai.assert.deepEqual(a, b)
    }
  }
})

Object.defineProperty(chai.assert, 'sameNumber', {
  value (a, b) {
    if (!isSameNumber(a, b)) {
      throw new AssertionError(`${repr(a)} is not indistinguishable from ${repr(b)}`)
    }
  }
})

export const expect = chai.expect
export const assert = chai.assert
