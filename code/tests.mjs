import chai from 'chai'

chai.Assertion.addMethod('equalComponent', function (b) {
  const a = this._obj
  new chai.Assertion(String(a)).to.equal(String(b))
})

export const expect = chai.expect
