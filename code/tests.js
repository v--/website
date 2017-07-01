const chai = require('chai')
const chaiIterator = require('chai-iterator')

const { all, zip } = require('common/support/itertools')

chai.use(chaiIterator)

function cmpComponents(a, b) {
    const aKeys = Object.keys(a.options).sort()
    const bKeys = Object.keys(b.options).sort()

    function cmpKeys([aKey, bKey]) {
        return aKey === bKey && a.options[aKey] === b.options[bKey]
    }

    return a.constructor === b.constructor &&
        aKeys.length === bKeys.length &&
        all(cmpKeys, zip(aKeys, bKeys)) &&
        a.children.length === b.children.length &&
        all(([aChild, bChild]) => cmpComponents(aChild, bChild), zip(a.children, b.children))
}

chai.Assertion.addMethod('equalComponent', function (b) {
    const a = this._obj

    this.assert(
        cmpComponents(a, b),
        `Expected ${a} to equal ${b}`,
        `Expected ${a} not to equal ${b}`
    )
})

module.exports = { expect: chai.expect }
