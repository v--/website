import chai from 'chai'

chai.Assertion.addMethod('equalComponent', function (b) {
  const a = this._obj

  this.assert(
    String(a) === String(b),
    `Expected ${a} to equal ${b}`,
    `Expected ${a} not to equal ${b}`
  )
})

export const expect = chai.expect
