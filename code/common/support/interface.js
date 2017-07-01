const { all } = require('common/support/itertools')
const { repr } = require('common/support/strtools')
const { CoolError } = require('common/errors')

class InterfaceNotImplementedError extends CoolError {}

function interfaceFactory(...props) {
    return {
        [Symbol.hasInstance](instance) {
            if (instance instanceof Object)
                return all(prop => prop in instance, props)

            return false
        }
    }
}

function assertInterface(context, abstract = []) {
    for (const propName of abstract) {
        if (!(propName in context)) {
            throw new InterfaceNotImplementedError(`${repr(context)} did not implement ${propName}`)
        }
    }
}

module.exports = {
    InterfaceNotImplementedError,
    interfaceFactory,
    assertInterface
}
