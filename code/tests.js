const chai = require('chai')
const chaiIterator = require('chai-iterator')

chai.use(chaiIterator)

module.exports = { expect: chai.expect }
