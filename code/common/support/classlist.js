const { filter } = require('common/support/iteration')
const { join } = require('common/support/strings')

module.exports = function classlist(...classes) {
    return join(' ', filter(Boolean, classes))
}
