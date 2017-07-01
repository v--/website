const { all } = require('common/support/itertools')
const { NotImplementedError } = require('common/errors')

class MethodNotImplementedError extends NotImplementedError {}

function abstractMethodChecker(context, abstract = []) {
    for (const methodName of abstract) {
        if (!(methodName in context)) {
            throw new MethodNotImplementedError(`${context.constructor.name} did not implement ${methodName}`)
        }
    }
}

function interfaceFactory(...props) {
    return {
        [Symbol.hasInstance](instance) {
            if (instance instanceof Object)
                return all(prop => prop in instance, props)

            return false
        }
    }
}

module.exports = {
    interfaceFactory,
    abstractMethodChecker,
    MethodNotImplementedError
}
