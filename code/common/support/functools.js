const { NotImplementedError } = require('common/errors')

module.exports = {
    overloader(...impls) {
        return function overloaded(primary, ...args) {
            for (const { type, impl } of impls)
                if ((type instanceof Function && primary instanceof type) ||
                    (typeof type === 'string' && typeof primary === type))
                    return impl(primary, ...args)

            throw new NotImplementedError(`No method matches ${primary}`)
        }
    },

    bind(object, methodName) {
        return object[methodName].bind(object)
    }
}
