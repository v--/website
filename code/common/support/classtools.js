const { NotImplementedError } = require('common/errors')

class MethodNotImplementedError extends NotImplementedError {}

function abstractMethodChecker(context, abstract = []) {
    for (const methodName of abstract) {
        if (!(methodName in context)) {
            throw new MethodNotImplementedError(`${context.constructor.name} did not implement ${methodName}`)
        }
    }
}

module.exports = {
    abstractMethodChecker,
    MethodNotImplementedError
}
