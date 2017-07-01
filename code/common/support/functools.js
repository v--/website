const { CoolError } = require('common/errors')
const Interface = require('common/support/interface')

function bind(object, methodName) {
    return object[methodName].bind(object)
}

class MissingInterfaceError extends CoolError {}

const IImplSpec = Interface.create('type', 'impl')

module.exports = {
    bind,

    overloader(...impls) {
        for (const impl of impls)
            IImplSpec.assert(impl)

        return function overloaded(primary, ...args) {
            for (const { type, impl } of impls)
                if (primary instanceof type)
                    return impl(primary, ...args)

            throw new MissingInterfaceError(`No method matches ${primary}`)
        }
    }
}
