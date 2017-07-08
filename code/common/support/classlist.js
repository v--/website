const { filter } = require('common/support/itertools')
const { join } = require('common/support/strtools')

module.exports = function classlist(...classes) {
    return join(' ', filter(Boolean, classes))
}
