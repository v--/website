const { describe, it } = require('mocha')
const chai = require('chai')
const chaiIterator = require('chai-iterator')

chai.use(chaiIterator)

module.exports = {
    describe, it,
    expect: chai.expect
}
