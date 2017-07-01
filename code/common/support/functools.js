const { CoolError } = require('common/errors')

class MissingInterfaceError extends CoolError {}

module.exports = {
    overloader(...impls) {
        return function overloaded(primary, ...args) {
            for (const { type, impl } of impls)
                if ((type instanceof Function && primary instanceof type) ||
                    (typeof type === 'string' && typeof primary === type))
                    return impl(primary, ...args)

            throw new MissingInterfaceError(`No method matches ${primary}`)
        }
    },

    bind(object, methodName) {
        return object[methodName].bind(object)
    }
}
