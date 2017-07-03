const { CoolError } = require('common/errors')
const { repr }= require('common/support/strtools')
const Interface = require('common/support/interface')

function bind(object, methodName, ...args) {
    return object[methodName].bind(object, ...args)
}

class MissingInterfaceError extends CoolError {}

const IImplSpec = Interface.create({ iface: Interface.IInterface, impl: Interface.IFunction })

module.exports = {
    bind,

    overloader(...impls) {
        for (const impl of impls)
            IImplSpec.assert(impl)

        return function overloaded(primary, ...args) {
            for (const { iface, impl } of impls)
                if (primary instanceof iface)
                    return impl(primary, ...args)

            throw new MissingInterfaceError(`No method matches ${repr(primary)}`)
        }
    }
}
