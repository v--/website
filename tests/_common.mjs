import chai from 'chai'
import { stringifyFormula } from '../code/client/resolution/support/stringify.mjs'

chai.Assertion.addMethod('equalComponent', function (b) {
  const a = this._obj
  new chai.Assertion(String(a)).to.equal(String(b))
})

Object.defineProperty(chai.assert, 'equalFormulas', {
  value (a, b) {
    chai.assert.strictEqual(stringifyFormula(a), stringifyFormula(b))
  }
})

export const expect = chai.expect
export const assert = chai.assert
