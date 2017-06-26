const { NotImplementedError } = require('common/errors')

module.exports = function overloader(...impls) {
    return function overloaded(primary, ...args) {
        for (const impl of impls)
            if ((impl.type instanceof Function && primary instanceof impl.type) ||
                (typeof impl.type === 'string' && typeof primary === impl.type))
                return impl.impl(primary, ...args)

        throw new NotImplementedError(`No method matches ${primary}`)
    }
}
