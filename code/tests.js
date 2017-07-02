const chai = require('chai')
const chaiIterator = require('chai-iterator')

chai.use(chaiIterator)

chai.Assertion.addMethod('equalComponent', function (b) {
    const a = this._obj

    this.assert(
        String(a) === String(b),
        `Expected ${a} to equal ${b}`,
        `Expected ${a} not to equal ${b}`
    )
})

module.exports = { expect: chai.expect }
