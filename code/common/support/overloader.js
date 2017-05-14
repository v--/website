const { NotImplementedError } = require('common/errors');

module.exports = function overloader(...impls) {
    return function overloaded(primary, ...args) {
        for (const impl of impls)
            if (primary instanceof impl.type)
                return impl.impl(primary, ...args);

        throw new NotImplementedError(`No method matches ${primary}`);
    };
};
