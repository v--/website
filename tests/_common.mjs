import chai from 'chai'
import { stringifyExpression } from '../code/client/resolution/support/stringify.mjs'

Object.defineProperty(chai.assert, 'equalComponents', {
  value (a, b) {
    chai.assert.strictEqual(String(a), String(b))
  }
})

Object.defineProperty(chai.assert, 'equalExpressions', {
  value (a, b) {
    chai.assert.strictEqual(stringifyExpression(a), stringifyExpression(b))
  }
})

export const expect = chai.expect
export const assert = chai.assert
